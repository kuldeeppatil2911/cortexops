const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// connect DB
connectDB();

const app = express();

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});