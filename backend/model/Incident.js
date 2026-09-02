const mongoose = require("mongoose");

const timelineEntrySchema = new mongoose.Schema({
  event: { type: String, required: true },
  detail: { type: String, default: "" },
  actor: { type: String, default: "system" },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const agentActivitySchema = new mongoose.Schema({
  step: { type: String, required: true },
  state: { type: String, enum: ["pending", "running", "completed"], default: "completed" },
  detail: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  raisedBy: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  knowledgeBase: {
    type: String,
    trim: true,
    default: "",
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved"],
    default: "Open",
  },
  statusChangedBy: {
    type: String,
    trim: true,
    default: "",
  },
  statusChangeReason: {
    type: String,
    trim: true,
    default: "",
  },
  resolvedAt: { type: Date, default: null },
  rootCause: { type: String, default: "", trim: true },
  resolution: { type: String, default: "", trim: true },
  agentState: { type: String, enum: ["idle", "analyzing", "completed"], default: "idle" },
  agentActivity: { type: [agentActivitySchema], default: [] },
  timeline: { type: [timelineEntrySchema], default: [] },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

incidentSchema.virtual("durationMs").get(function durationMs() {
  const end = this.resolvedAt || new Date();
  return Math.max(0, end.getTime() - this.createdAt.getTime());
});
incidentSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Incident", incidentSchema);