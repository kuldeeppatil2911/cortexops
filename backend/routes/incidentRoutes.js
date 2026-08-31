const express = require("express");
const router = express.Router();
const Incident = require("../model/Incident");

// CREATE INCIDENT
router.post("/", async (req, res) => {
  try {
    const { title, description, severity } = req.body;

    const newIncident = new Incident({
      title,
      description,
      severity,
    });

    const savedIncident = await newIncident.save();

    res.status(201).json(savedIncident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL INCIDENTS
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE INCIDENT
router.get("/:id", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE INCIDENT
router.put("/:id", async (req, res) => {
  try {
    const { title, description, severity, status } = req.body;
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { title, description, severity, status },
      { new: true }
    );
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json(incident);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE INCIDENT
router.delete("/:id", async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    res.json({ message: "Incident deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;