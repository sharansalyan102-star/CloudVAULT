const fileRoutes = require("./routes/fileRoutes");
const authRoutes = require("./routes/authRoutes");
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// MongoDB Connection
connectDB();

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to CloudVault Backend!");
});

// Server Configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
    console.log(`CloudVault server running on port ${PORT}`);
});
