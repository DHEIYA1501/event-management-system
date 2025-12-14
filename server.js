const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import database connection from config/db.js
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const eventRoutes = require("./routes/events"); // ✅ IMPORTED

// Connect to MongoDB using config/db.js
console.log("🔗 Attempting MongoDB connection via config/db.js...");
console.log("URI:", process.env.MONGO_URI ? "Set ✓" : "Missing ✗");

// Call the connectDB function
connectDB();

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/events", eventRoutes); // ✅ UNCOMMENTED - B2 FIXED CONTROLLER

// Home route with enhanced UI
app.get("/", (req, res) => {
  const mongoose = require("mongoose");
  const dbStatus = mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected";
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>College Event Platform</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          margin: 0; 
          padding: 30px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        .container { 
          max-width: 1000px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 20px; 
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { 
          color: #4F46E5; 
          border-bottom: 3px solid #4F46E5; 
          padding-bottom: 15px; 
          margin-top: 0;
          font-size: 2.5em;
        }
        .status-badge { 
          display: inline-block; 
          padding: 10px 20px; 
          border-radius: 50px; 
          font-weight: bold; 
          margin: 20px 0; 
          font-size: 1.1em;
        }
        .connected { background: #10B981; color: white; }
        .disconnected { background: #EF4444; color: white; }
        .endpoint-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
          gap: 15px; 
          margin: 30px 0;
        }
        .endpoint-card { 
          background: #F9FAFB; 
          padding: 20px; 
          border-radius: 10px; 
          border-left: 5px solid #4F46E5;
          transition: transform 0.2s;
        }
        .endpoint-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .method { 
          display: inline-block; 
          padding: 5px 12px; 
          border-radius: 5px; 
          font-weight: bold; 
          font-size: 0.9em; 
          margin-right: 10px;
        }
        .get { background: #10B981; color: white; }
        .post { background: #3B82F6; color: white; }
        .put { background: #F59E0B; color: white; }
        .delete { background: #EF4444; color: white; }
        .path { font-family: monospace; color: #1F2937; }
        .desc { color: #6B7280; margin-top: 8px; font-size: 0.9em; }
        .quick-links { 
          background: #EFF6FF; 
          padding: 25px; 
          border-radius: 15px; 
          margin-top: 30px;
        }
        .api-link { 
          display: inline-block; 
          background: #4F46E5; 
          color: white; 
          padding: 10px 20px; 
          border-radius: 8px; 
          text-decoration: none; 
          margin: 10px 5px; 
          font-weight: bold;
        }
        .api-link:hover { background: #4338CA; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 College Event Platform API</h1>
        
        <div class="status-badge ${mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'}">
          Database Status: ${dbStatus}
        </div>
        
        <p>Welcome to the College Event Platform API. This backend service powers event management, user authentication, and profile management.</p>
        
        <h2>📡 API Endpoints</h2>
        <div class="endpoint-grid">
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/auth/register</span>
            <div class="desc">Register a new user account</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/auth/login</span>
            <div class="desc">Login user and get JWT token</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/auth/verify-otp</span>
            <div class="desc">Verify OTP for registration</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/profile</span>
            <div class="desc">Get user profile (JWT required)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/profile/picture</span>
            <div class="desc">Upload profile picture</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method get">GET</span>
            <span class="path">/api/events</span>
            <div class="desc">Get all events</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/events</span>
            <div class="desc">Create new event (Admin only)</div>
          </div>
          
          <div class="endpoint-card">
            <span class="method post">POST</span>
            <span class="path">/api/events/:id/register</span>
            <div class="desc">Register for an event</div>
          </div>
        </div>
        
        <div class="quick-links">
          <h3>🔗 Quick Links</h3>
          <a href="/db-status" class="api-link">Database Status</a>
          <a href="/api/health" class="api-link">Health Check</a>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #F3F4F6; border-radius: 10px; font-size: 0.9em; color: #6B7280;">
          <strong>Server Info:</strong> Running on port ${process.env.PORT || 5000} | 
          <strong>Database:</strong> ${mongoose.connection.name || "collegeapp"} | 
          <strong>Environment:</strong> ${process.env.NODE_ENV || "development"}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Database status endpoint
app.get("/db-status", (req, res) => {
  const mongoose = require("mongoose");
  const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
  res.json({
    success: mongoose.connection.readyState === 1,
    status: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    models: mongoose.modelNames(),
    connected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Route ${req.method} ${req.url} does not exist`,
    availableRoutes: [
      "GET    /",
      "GET    /db-status",
      "GET    /api/health",
      "POST   /api/auth/register",
      "POST   /api/auth/login",
      "POST   /api/auth/verify-otp",
      "GET    /api/profile",
      "POST   /api/profile/picture",
      "GET    /api/events",          // ✅ ADDED
      "POST   /api/events",          // ✅ ADDED
      "POST   /api/events/:id/register"  // ✅ ADDED
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log("🚀 SERVER STARTED SUCCESSFULLY");
  console.log(`${'='.repeat(60)}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 DB Config: config/db.js`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`${'='.repeat(60)}`);
  
  console.log("\n📡 API ENDPOINTS:");
  console.log(`${'-'.repeat(50)}`);
  console.log("🔐 AUTHENTICATION:");
  console.log(`   POST   /api/auth/register    - Register user`);
  console.log(`   POST   /api/auth/login       - Login user`);
  console.log(`   POST   /api/auth/verify-otp  - Verify OTP`);
  
  console.log("\n👤 PROFILE:");
  console.log(`   GET    /api/profile          - Get profile`);
  console.log(`   POST   /api/profile/picture  - Upload picture`);
  
  console.log("\n🎪 EVENTS:");  // ✅ UPDATED
  console.log(`   GET    /api/events           - Get all events`);
  console.log(`   POST   /api/events           - Create event (Admin)`);
  console.log(`   POST   /api/events/:id/register - Register for event`);
  
  console.log("\n📊 SYSTEM:");
  console.log(`   GET    /                     - Home page`);
  console.log(`   GET    /db-status            - Database status`);
  console.log(`   GET    /api/health           - Health check`);
  console.log(`${'='.repeat(60)}\n`);
});