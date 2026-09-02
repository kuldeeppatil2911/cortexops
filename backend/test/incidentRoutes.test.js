const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const incidentRoutes = require("../routes/incidentRoutes");

let mongoServer;
let api;
const emittedEvents = [];

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.set("io", { emit: (event, payload) => emittedEvents.push({ event, payload }) });
  app.use("/api/incidents", incidentRoutes);
  return app;
}

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  api = request(createTestApp());
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("incident API supports the complete lifecycle", async () => {
  const createResponse = await api.post("/api/incidents").send({
    title: "Database latency",
    raisedBy: "Aarav Sharma",
    description: "Primary database response time increased.",
    severity: "High",
    knowledgeBase: "Check database connections and move traffic to the replica.",
  });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.title, "Database latency");
  assert.equal(createResponse.body.status, "Open");
  assert.equal(createResponse.body.raisedBy, "Aarav Sharma");
  assert.match(createResponse.body.knowledgeBase, /replica/);
  assert.equal(emittedEvents.at(-1).event, "incident:created");
  const incidentId = createResponse.body._id;

  const listResponse = await api.get("/api/incidents");
  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.length, 1);

  const getResponse = await api.get(`/api/incidents/${incidentId}`);
  assert.equal(getResponse.status, 200);
  assert.equal(getResponse.body._id, incidentId);

  const updateResponse = await api.put(`/api/incidents/${incidentId}`).send({
    title: "Database latency resolved",
    description: "Traffic was moved to the replica.",
    severity: "Medium",
    status: "Resolved",
    statusChangedBy: "Aarav Sharma",
    statusChangeReason: "Recovery was verified in production monitoring.",
    knowledgeBase: "Recovery confirmed after traffic was moved to the replica.",
  });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.status, "Resolved");
  assert.equal(updateResponse.body.severity, "Medium");
  assert.match(updateResponse.body.knowledgeBase, /Recovery confirmed/);
  assert.equal(emittedEvents.at(-1).event, "incident:updated");

  const deleteResponse = await api.delete(`/api/incidents/${incidentId}`);
  assert.equal(deleteResponse.status, 200);
  assert.equal(emittedEvents.at(-1).event, "incident:deleted");

  const missingResponse = await api.get(`/api/incidents/${incidentId}`);
  assert.equal(missingResponse.status, 404);
});

test("status changes require the actor name and reason", async () => {
  const createResponse = await api.post("/api/incidents").send({
    title: "Queue backlog",
    raisedBy: "Neha Kapoor",
  });

  const response = await api.put(`/api/incidents/${createResponse.body._id}`).send({
    status: "In Progress",
  });

  assert.equal(response.status, 400);
  assert.match(response.body.error, /name and reason/i);
});

test("incident API rejects invalid severity values", async () => {
  const response = await api.post("/api/incidents").send({
    title: "Invalid incident",
    severity: "Critical",
  });

  assert.equal(response.status, 500);
  assert.match(response.body.error, /enum/i);
});

test("new incidents automatically activate the agent and persist progress", async () => {
  const createResponse = await api.post("/api/incidents").send({
    title: "Checkout timeout",
    raisedBy: "Riya Shah",
    severity: "High",
    knowledgeBase: "Fail over to the payment replica and verify checkout latency.",
  });

  assert.equal(createResponse.status, 201);

  await new Promise((resolve) => setTimeout(resolve, 1700));
  const detailResponse = await api.get(`/api/incidents/${createResponse.body._id}`);
  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.body.agentState, "completed");
  assert.equal(detailResponse.body.agentActivity.length, 4);
  assert.match(detailResponse.body.timeline.map((entry) => entry.event).join(" "), /Agent activated/);
  assert.match(detailResponse.body.resolution, /action was executed/);
  assert.ok(emittedEvents.some((event) => event.event === "agent:started"));
  assert.ok(emittedEvents.some((event) => event.event === "agent:progress"));
});
