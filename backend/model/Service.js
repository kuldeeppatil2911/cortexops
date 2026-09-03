const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, default: "", trim: true },
  environment: { type: String, required: true, trim: true, default: "Production" },
  endpoint: { type: String, required: true, trim: true },
  owner: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ["Healthy", "Degraded", "Unhealthy", "Unknown"],
    default: "Unknown",
  },
  dependencies: { type: [String], default: [] },
  lastCheckedAt: { type: Date, default: null },
  lastSuccessfulCheckAt: { type: Date, default: null },
  lastFailedCheckAt: { type: Date, default: null },
  lastResponseTimeMs: { type: Number, default: null },
  lastHttpStatus: { type: Number, default: null },
  lastCheckError: { type: String, default: "" },
  availability: { type: Number, default: null, min: 0, max: 100 },
}, { timestamps: true });

serviceSchema.index({ status: 1, environment: 1 });

module.exports = mongoose.model("Service", serviceSchema);
