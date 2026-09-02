const mongoose = require("mongoose");

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Incident", incidentSchema);