const Service = require("../model/Service");

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_INTERVAL_MS = 60000;

async function checkService(service, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const checkedAt = new Date();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetchImpl(service.endpoint, {
      method: "GET",
      signal: controller.signal,
      redirect: "error",
    });
    const responseTimeMs = Date.now() - startedAt;
    return {
      status: response.ok ? "Healthy" : "Unhealthy",
      lastCheckedAt: checkedAt,
      lastSuccessfulCheckAt: response.ok ? checkedAt : service.lastSuccessfulCheckAt,
      lastFailedCheckAt: response.ok ? service.lastFailedCheckAt : checkedAt,
      lastResponseTimeMs: responseTimeMs,
      lastHttpStatus: response.status,
      lastCheckError: response.ok ? "" : `HTTP ${response.status}`,
      availability: response.ok ? 100 : 0,
    };
  } catch (error) {
    return {
      status: "Unhealthy",
      lastCheckedAt: checkedAt,
      lastSuccessfulCheckAt: service.lastSuccessfulCheckAt,
      lastFailedCheckAt: checkedAt,
      lastResponseTimeMs: Date.now() - startedAt,
      lastHttpStatus: null,
      lastCheckError: error.name === "AbortError" ? `Timeout after ${timeoutMs}ms` : error.message,
      availability: 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runServiceCheck(serviceId, options = {}) {
  const service = await Service.findById(serviceId);
  if (!service) return null;
  const result = await checkService(service, options);
  Object.assign(service, result);
  return service.save();
}

async function checkAllServices(options = {}) {
  const services = await Service.find();
  return Promise.all(services.map((service) => runServiceCheck(service._id, options)));
}

function startHealthMonitor({ io, intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  const run = async () => {
    try {
      const services = await checkAllServices();
      services.filter(Boolean).forEach((service) => {
        if (io) io.emit("service:health", service);
      });
    } catch (error) {
      console.error("Health monitor cycle failed:", error.message);
    }
  };

  const interval = setInterval(run, intervalMs);
  interval.unref();
  void run();
  return interval;
}

module.exports = { checkService, runServiceCheck, checkAllServices, startHealthMonitor };
