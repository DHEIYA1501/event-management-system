// middleware/superAdminMiddleware.js
const User = require('../models/user');

const superAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // ONLY allow super_admin
    if (user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Super admin privileges required." 
      });
    }
    
    next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error in super admin middleware" 
    });
  }
};

module.exports = superAdmin;