const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const serviceRoutes = require("../routes/serviceRoutes");

let mongoServer;
let api;
const emittedEvents = [];

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.set("io", { emit: (event, payload) => emittedEvents.push({ event, payload }) });
  app.use("/api/services", serviceRoutes);
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

test("service registry supports CRUD and realtime events", async () => {
  const createResponse = await api.post("/api/services").send({
    name: "Payment Service",
    description: "Handles checkout and payment authorization.",
    environment: "Production",
    endpoint: "https://payments.example.com/health",
    owner: "Backend Team",
    status: "Healthy",
    dependencies: ["PostgreSQL", "Redis"],
  });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.name, "Payment Service");
  assert.deepEqual(createResponse.body.dependencies, ["PostgreSQL", "Redis"]);
  assert.equal(emittedEvents.at(-1).event, "service:created");
  const serviceId = createResponse.body._id;

  const listResponse = await api.get("/api/services");
  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.length, 1);

  const getResponse = await api.get(`/api/services/${serviceId}`);
  assert.equal(getResponse.status, 200);

  const updateResponse = await api.put(`/api/services/${serviceId}`).send({
    name: "Payment Service",
    description: "Checkout and payment authorization.",
    environment: "Production",
    endpoint: "https://payments.example.com/health",
    owner: "Platform Team",
    status: "Degraded",
    dependencies: ["PostgreSQL", "Redis", "Kafka"],
  });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.status, "Degraded");
  assert.equal(updateResponse.body.owner, "Platform Team");
  assert.equal(emittedEvents.at(-1).event, "service:updated");

  const deleteResponse = await api.delete(`/api/services/${serviceId}`);
  assert.equal(deleteResponse.status, 200);
  assert.equal(emittedEvents.at(-1).event, "service:deleted");

  const missingResponse = await api.get(`/api/services/${serviceId}`);
  assert.equal(missingResponse.status, 404);
});

test("service registry validates required fields and status", async () => {
  const response = await api.post("/api/services").send({ name: "Incomplete Service" });
  assert.equal(response.status, 400);
});
