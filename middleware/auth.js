const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    console.log('✅ auth middleware HIT');

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    req.user = decoded; // { id, role, email }

    return next(); // ✅ safe
  } catch (error) {
    console.error('❌ AUTH ERROR:', error);

    // 🚫 DO NOT call next(error)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = { protect };
