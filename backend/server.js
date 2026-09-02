const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();

// connect DB
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
app.set("io", io);

app.use(cors());
app.use(express.json());

//connecting incidnet here
const incidentRoutes = require("./routes/incidentRoutes");

app.use("/api/incidents", incidentRoutes);
////////


app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});