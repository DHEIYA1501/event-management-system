const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // 2. Check if token exists and has "Bearer " prefix
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }
    
    // 3. Extract token (remove "Bearer " part)
    const token = authHeader.split(' ')[1];
    
    // 4. Verify token using JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Attach user data to request object
    req.user = decoded;
    
    // 6. Continue to the next middleware/route handler
    next();
    
  } catch (error) {
    // 7. Handle JWT verification errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Export ONLY the middleware function
module.exports = { protect };