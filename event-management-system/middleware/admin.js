const User = require("../models/User");

const admin = async (req, res, next) => {
  try {
    // Get user from database to ensure fresh data
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if user has admin role
    if (user.role !== "clubAdmin" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Club admin privileges required."
      });
    }
    
    // Attach user to request for consistency
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in admin middleware"
    });
  }
};

module.exports = admin;