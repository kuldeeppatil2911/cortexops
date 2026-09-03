const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Realtime client connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`Realtime client disconnected: ${socket.id}`));
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const incidentRoutes = require("./routes/incidentRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
app.use("/api/incidents", incidentRoutes);
app.use("/api/services", serviceRoutes);

// Serve React frontend
const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendBuildPath));

// API health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "cortexops-api", timestamp: new Date().toISOString() });
});

// Fallback for the React app (must be after API routes)
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 CortexOps running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});
