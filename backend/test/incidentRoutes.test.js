const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const incidentRoutes = require("../routes/incidentRoutes");

let mongoServer;
let api;

function createTestApp() {
  const app = express();
  app.use(express.json());
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
    description: "Primary database response time increased.",
    severity: "High",
    knowledgeBase: "Check database connections and move traffic to the replica.",
  });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.title, "Database latency");
  assert.equal(createResponse.body.status, "Open");
  assert.match(createResponse.body.knowledgeBase, /replica/);
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
    knowledgeBase: "Recovery confirmed after traffic was moved to the replica.",
  });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.status, "Resolved");
  assert.equal(updateResponse.body.severity, "Medium");
  assert.match(updateResponse.body.knowledgeBase, /Recovery confirmed/);

  const deleteResponse = await api.delete(`/api/incidents/${incidentId}`);
  assert.equal(deleteResponse.status, 200);

  const missingResponse = await api.get(`/api/incidents/${incidentId}`);
  assert.equal(missingResponse.status, 404);
});

test("incident API rejects invalid severity values", async () => {
  const response = await api.post("/api/incidents").send({
    title: "Invalid incident",
    severity: "Critical",
  });

  assert.equal(response.status, 500);
  assert.match(response.body.error, /enum/i);
});
