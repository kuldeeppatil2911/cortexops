const express = require("express");
const router = express.Router();
const Incident = require("../model/Incident");

// CREATE INCIDENT
router.post("/", async (req, res) => {
  try {
    const { title, raisedBy, description, severity, knowledgeBase } = req.body;

    const newIncident = new Incident({
      title,
      raisedBy,
      description,
      severity,
      knowledgeBase,
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
    const { title, description, severity, status, knowledgeBase, statusChangedBy, statusChangeReason } = req.body;
    const currentIncident = await Incident.findById(req.params.id);
    if (!currentIncident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    if (status && status !== currentIncident.status && (!statusChangedBy || !statusChangeReason)) {
      return res.status(400).json({ error: "Name and reason are required when changing status" });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { title, description, severity, status, knowledgeBase, statusChangedBy, statusChangeReason },
      { new: true, runValidators: true }
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