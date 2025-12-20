const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const asyncHandler = require("express-async-handler");

// @desc    Create new event (Club Admin only)
// @route   POST /api/events
// @access  Private (Club Admin)
exports.createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    time,
    location,
    category,
    capacity,
    image,
    requirements,
    price
  } = req.body;

  // Create event
  const event = await Event.create({
    title,
    description,
    date,
    time,
    location,
    category,
    capacity: capacity || 100,
    image,
    requirements,
    price: price || 0,
    organizer: req.user.id,
    status: "upcoming"
  });

  // Populate organizer details
  const populatedEvent = await Event.findById(event._id).populate(
    "organizer",
    "name email avatar"
  );

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: populatedEvent
  });
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = asyncHandler(async (req, res) => {
  // Get query parameters for filtering
  const { category, status, search, sort = "date" } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (category) {
    filter.category = category;
  }
  
  if (status) {
    filter.status = status;
  }
  
  // Search in title or description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } }
    ];
  }
  
  // Sort options
  let sortOption = {};
  switch (sort) {
    case "date":
      sortOption = { date: 1 };
      break;
    case "date-desc":
      sortOption = { date: -1 };
      break;
    case "created":
      sortOption = { createdAt: -1 };
      break;
    case "popular":
      // You might want to sort by registration count
      sortOption = { "registrations.length": -1 };
      break;
    default:
      sortOption = { date: 1 };
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments(filter);
  
  // Get events with filtering, sorting and pagination
  const events = await Event.find(filter)
    .populate("organizer", "name email avatar")
    .populate({
      path: "registrations",
      select: "user status",
      populate: {
        path: "user",
        select: "name avatar"
      }
    })
    .sort(sortOption)
    .skip(startIndex)
    .limit(limit);
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    total,
    data: events
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("organizer", "name email avatar bio")
    .populate({
      path: "registrations",
      select: "user status registeredAt",
      populate: {
        path: "user",
        select: "name email avatar studentId"
      }
    });
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Check if current user is registered
  let isRegistered = false;
  let userRegistration = null;
  
  if (req.user) {
    const registration = await Registration.findOne({
      event: event._id,
      user: req.user.id
    });
    
    if (registration) {
      isRegistered = true;
      userRegistration = registration;
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      ...event.toObject(),
      isRegistered,
      userRegistration
    }
  });
});

// @desc    Update event (Club Admin only)
// @route   PUT /api/events/:id
// @access  Private (Club Admin)
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this event"
    });
  }
  
  // Update fields
  const updatableFields = [
    "title", "description", "date", "time", "location",
    "category", "capacity", "image", "requirements",
    "price", "status"
  ];
  
  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
  });
  
  await event.save();
  
  // Populate organizer details
  const updatedEvent = await Event.findById(event._id).populate(
    "organizer",
    "name email avatar"
  );
  
  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: updatedEvent
  });
});

// @desc    Delete event (Club Admin only)
// @route   DELETE /api/events/:id
// @access  Private (Club Admin)
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this event"
    });
  }
  
  // Delete all registrations for this event first
  await Registration.deleteMany({ event: event._id });
  
  // Delete the event
  await event.deleteOne();
  
  res.status(200).json({
    success: true,
    message: "Event deleted successfully"
  });
});

// @desc    Register for event (Students only)
// @route   POST /api/events/:id/register
// @access  Private (Student)
exports.registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Check if event is still open for registration
  const eventDate = new Date(event.date);
  const today = new Date();
  
  if (eventDate < today && event.status !== "ongoing") {
    return res.status(400).json({
      success: false,
      message: "Registration for this event has closed"
    });
  }
  
  // Check if user is already registered
  const existingRegistration = await Registration.findOne({
    event: event._id,
    user: req.user.id
  });
  
  if (existingRegistration) {
    return res.status(400).json({
      success: false,
      message: "You are already registered for this event"
    });
  }
  
  // Check if event is at capacity
  const registrationCount = await Registration.countDocuments({ event: event._id });
  
  if (registrationCount >= event.capacity) {
    return res.status(400).json({
      success: false,
      message: "Event is at full capacity"
    });
  }
  
  // Create registration
  const registration = await Registration.create({
    event: event._id,
    user: req.user.id,
    status: "confirmed",
    additionalInfo: req.body.additionalInfo || ""
  });
  
  // Add registration to event
  event.registrations.push(registration._id);
  await event.save();
  
  // Populate registration details
  const populatedRegistration = await Registration.findById(registration._id)
    .populate("user", "name email avatar studentId")
    .populate("event", "title date location");
  
  res.status(201).json({
    success: true,
    message: "Successfully registered for the event",
    data: populatedRegistration
  });
});

// ========== DAY 3: NEW CONTROLLER FUNCTIONS ==========

// @desc    Get events for admin dashboard (with stats)
// @route   GET /api/events/admin/dashboard
// @access  Private (Club Admin only)
exports.getAdminEvents = asyncHandler(async (req, res) => {
  // Find events organized by this user
  const events = await Event.find({ organizer: req.user.id })
    .populate("organizer", "name email avatar")
    .populate({
      path: "registrations",
      select: "user status createdAt",
      populate: {
        path: "user",
        select: "name email"
      }
    })
    .sort({ createdAt: -1 });
  
  // Calculate statistics
  const stats = {
    totalEvents: events.length,
    totalRegistrations: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    eventsByCategory: {}
  };
  
  // Add registration count and other stats to each event
  const eventsWithStats = events.map(event => {
    const eventObj = event.toObject();
    const registrationCount = event.registrations.length;
    
    eventObj.registrationCount = registrationCount;
    eventObj.confirmedRegistrations = event.registrations.filter(
      reg => reg.status === "confirmed"
    ).length;
    
    // Update overall stats
    stats.totalRegistrations += registrationCount;
    
    // Count upcoming vs past events
    const eventDate = new Date(event.date);
    const today = new Date();
    if (eventDate >= today) {
      stats.upcomingEvents++;
    } else {
      stats.pastEvents++;
    }
    
    // Count events by category
    if (event.category) {
      stats.eventsByCategory[event.category] = (stats.eventsByCategory[event.category] || 0) + 1;
    }
    
    return eventObj;
  });
  
  // Calculate registration rate (average registrations per event)
  stats.averageRegistrations = stats.totalEvents > 0 
    ? (stats.totalRegistrations / stats.totalEvents).toFixed(1) 
    : 0;
  
  res.status(200).json({
    success: true,
    count: eventsWithStats.length,
    stats,
    data: eventsWithStats
  });
});

// @desc    Get all registrations for a specific event
// @route   GET /api/events/:id/registrations
// @access  Private (Club Admin only)
exports.getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view registrations for this event"
    });
  }
  
  // Get registrations with filtering
  const { status, search, sort = "registeredAt" } = req.query;
  
  const filter = { event: req.params.id };
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    // Search in user name or email
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    }).select("_id");
    
    filter.user = { $in: users.map(user => user._id) };
  }
  
  // Sort options
  let sortOption = {};
  switch (sort) {
    case "name":
      sortOption = { "user.name": 1 };
      break;
    case "date":
      sortOption = { registeredAt: 1 };
      break;
    case "date-desc":
      sortOption = { registeredAt: -1 };
      break;
    default:
      sortOption = { registeredAt: -1 };
  }
  
  const registrations = await Registration.find(filter)
    .populate("user", "name email phone studentId avatar year branch")
    .populate("event", "title date location")
    .sort(sortOption);
  
  // Get registration statistics
  const registrationStats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === "confirmed").length,
    pending: registrations.filter(r => r.status === "pending").length,
    cancelled: registrations.filter(r => r.status === "cancelled").length,
    attended: registrations.filter(r => r.status === "attended").length
  };
  
  res.status(200).json({
    success: true,
    event: {
      title: event.title,
      date: event.date,
      location: event.location,
      capacity: event.capacity
    },
    stats: registrationStats,
    count: registrations.length,
    data: registrations
  });
});

// @desc    Export event registrations as CSV
// @route   GET /api/events/:id/registrations/export
// @access  Private (Club Admin only)
exports.exportRegistrationsCSV = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found"
    });
  }
  
  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to export registrations for this event"
    });
  }
  
  // Get all registrations for this event
  const registrations = await Registration.find({ event: req.params.id })
    .populate("user", "name email phone studentId year branch")
    .populate("event", "title date location");
  
  if (registrations.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No registrations to export"
    });
  }
  
  // Create CSV content
  let csvContent = "Sr.No,Name,Email,Phone,Student ID,Year,Branch,Registration Date,Status,Additional Info\n";
  
  // Add each registration as a row
  registrations.forEach((reg, index) => {
    const row = [
      index + 1,
      `"${reg.user.name}"`,
      `"${reg.user.email}"`,
      `"${reg.user.phone || "N/A"}"`,
      `"${reg.user.studentId || "N/A"}"`,
      `"${reg.user.year || "N/A"}"`,
      `"${reg.user.branch || "N/A"}"`,
      `"${new Date(reg.registeredAt).toLocaleString()}"`,
      `"${reg.status}"`,
      `"${reg.additionalInfo || ""}"`
    ].join(",");
    
    csvContent += row + "\n";
  });
  
  // Set headers for file download
  const filename = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-registrations.csv`;
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  
  res.status(200).send(csvContent);
});

// @desc    Update registration status
// @route   PUT /api/events/:eventId/registrations/:registrationId
// @access  Private (Club Admin only)
exports.updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status, additionalInfo } = req.body;
  
  // Validate status
  const validStatuses = ["pending", "confirmed", "cancelled", "attended", "waitlisted"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    });
  }
  
  // Find the registration
  const registration = await Registration.findOne({
    _id: req.params.registrationId,
    event: req.params.eventId
  }).populate("event");
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration not found"
    });
  }
  
  // Check if user is authorized (event organizer or admin)
  const event = await Event.findById(req.params.eventId);
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this registration"
    });
  }
  
  // Update registration
  const oldStatus = registration.status;
  registration.status = status;
  
  if (additionalInfo !== undefined) {
    registration.additionalInfo = additionalInfo;
  }
  
  registration.updatedAt = Date.now();
  
  await registration.save();
  
  // Populate user details for response
  const updatedRegistration = await Registration.findById(registration._id)
    .populate("user", "name email avatar")
    .populate("event", "title date");
  
  res.status(200).json({
    success: true,
    message: `Registration status updated from ${oldStatus} to ${status}`,
    data: updatedRegistration
  });
});

// @desc    Cancel registration (User can cancel their own registration)
// @route   DELETE /api/events/:eventId/registrations/:registrationId
// @access  Private
exports.cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({
    _id: req.params.registrationId,
    event: req.params.eventId
  });
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: "Registration not found"
    });
  }
  
  // Check if user owns the registration or is admin
  if (registration.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to cancel this registration"
    });
  }
  
  // Update status to cancelled instead of deleting
  registration.status = "cancelled";
  registration.updatedAt = Date.now();
  await registration.save();
  
  // Remove registration from event's registrations array
  await Event.findByIdAndUpdate(
    req.params.eventId,
    { $pull: { registrations: registration._id } }
  );
  
  res.status(200).json({
    success: true,
    message: "Registration cancelled successfully"
  });
});