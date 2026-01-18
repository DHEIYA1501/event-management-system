const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect } = require("../middleware/auth");
const admin = require("../middleware/admin");

// @desc    Create new event (Club Admin only)
// @route   POST /api/events
// @access  Private (Club Admin)
router.post("/", protect, admin, eventController.createEvent);

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get("/", eventController.getAllEvents);

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
router.get("/:id", eventController.getEventById);

// @desc    Update event (Club Admin only)
// @route   PUT /api/events/:id
// @access  Private (Club Admin)
router.put("/:id", protect, admin, eventController.updateEvent);

// @desc    Delete event (Club Admin only)
// @route   DELETE /api/events/:id
// @access  Private (Club Admin)
router.delete("/:id", protect, admin, eventController.deleteEvent);

// @desc    Register for event (Students only)
// @route   POST /api/events/:id/register
// @access  Private (Student)
router.post("/:id/register", protect, eventController.registerForEvent);

// ========== DAY 3: NEW ADMIN ROUTES ==========

// @desc    Get admin dashboard events with stats
// @route   GET /api/events/admin/dashboard
// @access  Private (Club Admin only)
router.get("/admin/dashboard", protect, admin, eventController.getAdminEvents);

// @desc    Get event registrations (admin only)
// @route   GET /api/events/:id/registrations
// @access  Private (Club Admin only)
router.get("/:id/registrations", protect, admin, eventController.getEventRegistrations);

// @desc    Export registrations as CSV
// @route   GET /api/events/:id/registrations/export
// @access  Private (Club Admin only)
router.get("/:id/registrations/export", protect, admin, eventController.exportRegistrationsCSV);

// @desc    Update registration status (admin only)
// @route   PUT /api/events/:id/registrations/:registrationId
// @access  Private (Club Admin only)
router.put("/:id/registrations/:registrationId", protect, admin, eventController.updateRegistrationStatus);

module.exports = router;