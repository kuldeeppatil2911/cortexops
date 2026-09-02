const express = require("express");
const router = express.Router();
const Incident = require("../model/Incident");

function broadcast(req, event, payload) {
  const io = req.app.get("io");
  if (io) io.emit(event, payload);
}

function addTimeline(incident, event, detail, actor = "system") {
  incident.timeline.push({ event, detail, actor });
}

async function runAgentWorkflow(req, incidentId) {
  const incident = await Incident.findById(incidentId);
  if (!incident || incident.agentState === "analyzing") return;

  incident.agentState = "analyzing";
  incident.agentActivity = [];
  addTimeline(incident, "Agent activated", "Operational investigation started.");
  await incident.save();
  broadcast(req, "agent:started", incident);

  const steps = [
    ["Checking service health", "API health endpoint and database connection are available to this service."],
    ["Checking incident signals", `Reviewed severity ${incident.severity}, current status, and reporter context.`],
    ["Searching knowledge base", incident.knowledgeBase ? "Used the knowledge-base note attached to this incident." : "No incident-specific knowledge note is attached yet."],
    ["Preparing recommendation", incident.knowledgeBase || "Collect impact, scope, and the first verified mitigation step before changing status."],
  ];

  for (const [step, detail] of steps) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const current = await Incident.findById(incidentId);
    if (!current) return;
    current.agentActivity.push({ step, state: "completed", detail });
    addTimeline(current, step, detail);
    current.rootCause = current.rootCause || (current.knowledgeBase ? "See incident knowledge-base evidence." : "Pending operator evidence.");
    current.resolution = current.resolution || "Recommended action prepared; no automated production action was executed.";
    if (step === "Preparing recommendation") current.agentState = "completed";
    await current.save();
    broadcast(req, "agent:progress", current);
    broadcast(req, "incident:updated", current);
  }
}

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
      timeline: [{ event: "Incident detected", detail: "Incident created by reporter.", actor: raisedBy }],
    });

    const savedIncident = await newIncident.save();
    broadcast(req, "incident:created", savedIncident);
    void runAgentWorkflow(req, savedIncident._id).catch((error) => {
      console.error("Agent workflow failed:", error.message);
    });

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

    const previousStatus = currentIncident.status;
    Object.assign(currentIncident, { title, description, severity, knowledgeBase });
    if (status && status !== previousStatus) {
      currentIncident.status = status;
      currentIncident.statusChangedBy = statusChangedBy;
      currentIncident.statusChangeReason = statusChangeReason;
      addTimeline(currentIncident, `Status changed to ${status}`, statusChangeReason, statusChangedBy);
      if (status === "Resolved") {
        currentIncident.resolvedAt = new Date();
        addTimeline(currentIncident, "Incident resolved", "Recovery confirmed by status owner.", statusChangedBy);
      } else {
        currentIncident.resolvedAt = null;
      }
    }
    const incident = await currentIncident.save();
    broadcast(req, "incident:updated", incident);
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
    broadcast(req, "incident:deleted", { id: req.params.id });
    res.json({ message: "Incident deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/agent/start", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });
    if (incident.agentState === "analyzing") return res.status(409).json({ error: "Agent is already analyzing this incident" });
    res.status(202).json(incident);
    void runAgentWorkflow(req, incident._id).catch((error) => {
      console.error("Agent workflow failed:", error.message);
    });
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: error.message });
  }
});

module.exports = router;