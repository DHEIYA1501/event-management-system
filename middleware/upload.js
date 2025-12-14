const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // FIXED: Don't use req.user - it doesn't exist yet
    // Use timestamp + random number instead
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  // Simple check for image types
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept
  } else {
    cb(new Error('Only image files are allowed!'), false); // Reject
  }
};

// Create upload middleware
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
});

// Export the upload middleware
module.exports = upload;