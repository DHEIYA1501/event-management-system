const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Get user profile
router.get("/", protect, profileController.getProfile);

// Update profile
router.put("/", protect, profileController.updateProfile);

// Upload profile picture
router.post("/picture", protect, upload.single("profilePicture"), profileController.uploadProfilePicture);

// Change password - CORRECTED: Changed from POST to PUT
router.put("/password", protect, profileController.changePassword);

module.exports = router;