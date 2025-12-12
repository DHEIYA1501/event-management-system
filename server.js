const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");

// Connect to MongoDB - SIMPLIFIED FOR MONGOOSE 6+
console.log("🔗 Attempting MongoDB connection...");
console.log("URI:", process.env.MONGO_URI ? "Set ✓" : "Missing ✗");

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("\n✅ MongoDB CONNECTED SUCCESSFULLY!");
  console.log("📊 Database:", mongoose.connection.name);
  console.log("🔗 Host:", mongoose.connection.host);
  console.log("📈 State:", mongoose.connection.readyState === 1 ? "Connected ✓" : "Disconnected ✗");
})
.catch((err) => {
  console.log("\n❌ MongoDB CONNECTION FAILED!");
  console.log("Error:", err.message);
  console.log("\n🔧 QUICK FIXES:");
  console.log("1. Check .env has: MONGO_URI=mongodb://127.0.0.1:27017/collegeapp");
  console.log("2. MongoDB service running? (Get-Service MongoDB)");
  console.log("3. Try: mongod --dbpath C:\\data\\db");
});

// Use routes
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected";
  res.send(`
    <h1>🎉 College Event Platform - MONGODB EDITION</h1>
    <h3>Database Status: ${dbStatus}</h3>
    <h4>Test Endpoints:</h4>
    <ul>
      <li>POST /api/auth/register - Register user</li>
      <li>POST /api/auth/verify-otp - Verify OTP</li>
      <li>POST /api/auth/login - Login user</li>
      <li>GET  /db-status - Check database</li>
    </ul>
  `);
});

// Database status endpoint
app.get("/db-status", (req, res) => {
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  res.json({
    status: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    models: mongoose.modelNames(),
    connected: mongoose.connection.readyState === 1
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SERVER STARTED on port ${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`📊 DB Status: http://localhost:${PORT}/db-status`);
  console.log(`\n📡 AUTH ENDPOINTS:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/verify-otp`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
});