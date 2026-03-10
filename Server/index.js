
const dotenv = require("dotenv");
dotenv.config();  

const express = require("express");
const cors = require("cors");
const connectMongo = require("./config/mongo");
const connectPostgres = require("./config/postgres");
const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// DB Connections
connectMongo();
connectPostgres();

app.use("/api/assignments", require("./routes/assignments"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CipherSQLStudio API running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});