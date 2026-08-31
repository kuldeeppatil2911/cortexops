const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Incident", incidentSchema);