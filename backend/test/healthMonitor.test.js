const test = require("node:test");
const assert = require("node:assert/strict");
const { checkService } = require("../services/healthMonitor");

const service = {
  endpoint: "https://service.example/health",
  lastSuccessfulCheckAt: null,
};

test("health monitor records healthy response time and status", async () => {
  const result = await checkService(service, {
    fetchImpl: async () => ({ ok: true, status: 200 }),
  });

  assert.equal(result.status, "Healthy");
  assert.equal(result.lastHttpStatus, 200);
  assert.equal(result.availability, 100);
  assert.equal(typeof result.lastResponseTimeMs, "number");
  assert.equal(result.lastCheckError, "");
});

test("health monitor records HTTP failures", async () => {
  const result = await checkService(service, {
    fetchImpl: async () => ({ ok: false, status: 503 }),
  });

  assert.equal(result.status, "Unhealthy");
  assert.equal(result.lastHttpStatus, 503);
  assert.equal(result.lastCheckError, "HTTP 503");
  assert.equal(result.availability, 0);
});

test("health monitor records timeouts", async () => {
  const result = await checkService(service, {
    timeoutMs: 5,
    fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    }),
  });

  assert.equal(result.status, "Unhealthy");
  assert.match(result.lastCheckError, /Timeout/);
});
