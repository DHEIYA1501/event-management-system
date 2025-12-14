require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB Atlas connection...");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
    console.log("✅ Connection state:", mongoose.connection.readyState);
    mongoose.connection.close();
    console.log("✅ Connection closed");
    console.log("\n🎉 DATABASE IS WORKING!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ CONNECTION FAILED:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });