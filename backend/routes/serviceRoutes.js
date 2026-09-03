const express = require("express");
const Service = require("../model/Service");

const router = express.Router();

function broadcast(req, event, payload) {
  const io = req.app.get("io");
  if (io) io.emit(event, payload);
}

router.post("/", async (req, res) => {
  try {
    const { name, description, environment, endpoint, owner, status, dependencies } = req.body;
    const service = await Service.create({ name, description, environment, endpoint, owner, status, dependencies });
    broadcast(req, "service:created", service);
    res.status(201).json(service);
  } catch (error) {
    const statusCode = error.code === 11000 || error.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, description, environment, endpoint, owner, status, dependencies } = req.body;
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, environment, endpoint, owner, status, dependencies },
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ error: "Service not found" });
    broadcast(req, "service:updated", service);
    res.json(service);
  } catch (error) {
    const statusCode = error.code === 11000 || error.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    broadcast(req, "service:deleted", { id: req.params.id });
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
