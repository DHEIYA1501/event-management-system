// middleware/admin.js
const User = require('../models/user');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Check if user is club_admin or admin
    if (user.role !== 'club_admin' && user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Club admin privileges required." 
      });
    }
    
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