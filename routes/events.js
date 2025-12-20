const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { protect } = require("../middleware/auth");

// @desc    Create new event (Club Admin only)
// @route   POST /api/events
// @access  Private (Club Admin)
router.post("/", protect, eventController.createEvent);

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
router.put("/:id", protect, eventController.updateEvent);

// @desc    Delete event (Club Admin only)
// @route   DELETE /api/events/:id
// @access  Private (Club Admin)
router.delete("/:id", protect, eventController.deleteEvent);

// @desc    Register for event (Students only)
// @route   POST /api/events/:id/register
// @access  Private (Student)
router.post("/:id/register", protect, eventController.registerForEvent);

module.exports = router;