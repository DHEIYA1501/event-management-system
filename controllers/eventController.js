const Event = require('../models/event');
const User = require('../models/user');
const Registration = require('../models/registration'); // ✅ NEW

// 1. Create event (club admin only)
exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, time, venue, capacity } = req.body;
        
        // Check if user is club admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'club_admin') {
            return res.status(403).json({ message: 'Only club admins can create events' });
        }

        const event = new Event({
            title,
            description,
            date,
            time,
            venue,
            capacity,
            clubId: req.user.id
        });

        await event.save();
        res.status(201).json({ 
            message: 'Event created successfully', 
            event 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 2. List events (all users)
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('clubId', 'name email')
            .sort({ date: 1 }); // Sort by date ascending
        
        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 3. Get event details
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('clubId', 'name email');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.status(200).json({ event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 4. Update event (club admin only)
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is the club admin who created this event
        if (event.clubId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        const updates = req.body;
        Object.keys(updates).forEach(key => {
            event[key] = updates[key];
        });

        await event.save();
        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 5. Delete event (club admin only)
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is the club admin who created this event
        if (event.clubId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        // Also delete all registrations for this event
        await Registration.deleteMany({ event: req.params.id });

        await event.deleteOne();
        res.status(200).json({ message: 'Event and its registrations deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 6. Register for event (students only) - ✅ UPDATED with Registration model
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is student
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can register for events' });
        }

        // Check if already registered using Registration model
        const existingRegistration = await Registration.findOne({
            event: req.params.id,
            user: req.user.id
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        // Check capacity - count registrations
        const registeredCount = await Registration.countDocuments({ event: req.params.id });
        if (registeredCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Create registration
        const registration = new Registration({
            event: req.params.id,
            user: req.user.id,
            status: 'pending' // Default status
        });

        await registration.save();

        res.status(200).json({ 
            message: 'Registered for event successfully', 
            eventId: event._id,
            registrationId: registration._id,
            status: registration.status
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ========== DAY 3: ADMIN FUNCTIONS ==========

// 7. Get admin dashboard events with stats - ✅ UPDATED
exports.getAdminEvents = async (req, res) => {
  try {
    // Get events created by this club admin
    const events = await Event.find({ clubId: req.user.id })
      .populate('clubId', 'name email')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const stats = {
      totalEvents: events.length,
      totalRegistrations: 0,
      upcomingEvents: 0,
      pastEvents: 0
    };
    
    // Get registration counts for each event
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const eventObj = event.toObject();
      
      // Count registrations for this event
      const registeredCount = await Registration.countDocuments({ event: event._id });
      const confirmedCount = await Registration.countDocuments({ 
        event: event._id, 
        status: 'confirmed' 
      });
      
      eventObj.registrationCount = registeredCount;
      eventObj.confirmedCount = confirmedCount;
      eventObj.availableSpots = event.capacity - registeredCount;
      
      // Update overall stats
      stats.totalRegistrations += registeredCount;
      
      // Count upcoming vs past events
      const eventDate = new Date(event.date);
      const today = new Date();
      if (eventDate >= today) {
        stats.upcomingEvents++;
      } else {
        stats.pastEvents++;
      }
      
      return eventObj;
    }));
    
    // Calculate average registrations
    stats.averageRegistrations = stats.totalEvents > 0 
      ? (stats.totalRegistrations / stats.totalEvents).toFixed(1) 
      : 0;
    
    res.status(200).json({
      success: true,
      count: eventsWithStats.length,
      stats,
      data: eventsWithStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching admin events" 
    });
  }
};

// 8. Get event registrations (admin only) - ✅ UPDATED
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }
    
    // Check if user is the event's club admin
    if (event.clubId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view registrations for this event" 
      });
    }
    
    // Get registrations with user details
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email studentId avatar department')
      .sort({ registeredAt: -1 });
    
    // Registration statistics
    const registrationStats = {
      total: registrations.length,
      pending: registrations.filter(r => r.status === 'pending').length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      rejected: registrations.filter(r => r.status === 'rejected').length,
      capacity: event.capacity,
      availableSpots: event.capacity - registrations.length,
      fillPercentage: event.capacity > 0 
        ? Math.round((registrations.length / event.capacity) * 100) 
        : 0
    };
    
    // Format registration data for frontend
    const formattedRegistrations = registrations.map(reg => ({
      _id: reg._id,
      name: reg.user?.name || 'Unknown',
      email: reg.user?.email || 'No email',
      collegeId: reg.user?.studentId || 'N/A',
      department: reg.user?.department || 'Not specified',
      status: reg.status,
      registeredAt: reg.registeredAt,
      userId: reg.user?._id
    }));
    
    res.status(200).json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue
      },
      stats: registrationStats,
      count: formattedRegistrations.length,
      data: formattedRegistrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching registrations" 
    });
  }
};

// 9. Export registrations as CSV - ✅ UPDATED
exports.exportRegistrationsCSV = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }
    
    // Check if user is the event's club admin
    if (event.clubId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to export registrations" 
      });
    }
    
    // Get registrations
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email studentId');
    
    if (registrations.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No registrations to export" 
      });
    }
    
    // Create CSV content with status
    let csvContent = "Sr.No,Name,Email,Student ID,Status,Registered Date\n";
    
    registrations.forEach((reg, index) => {
      const row = [
        index + 1,
        `"${reg.user?.name || "N/A"}"`,
        `"${reg.user?.email || "N/A"}"`,
        `"${reg.user?.studentId || "N/A"}"`,
        `"${reg.status}"`,
        `"${new Date(reg.registeredAt).toLocaleDateString()}"`
      ].join(",");
      
      csvContent += row + "\n";
    });
    
    // Add event summary
    csvContent += `\nEvent Summary\n`;
    csvContent += `Event Title,"${event.title}"\n`;
    csvContent += `Date,"${new Date(event.date).toLocaleDateString()}"\n`;
    csvContent += `Venue,"${event.venue}"\n`;
    csvContent += `Total Registrations,${registrations.length}\n`;
    csvContent += `Capacity,${event.capacity}\n`;
    
    // Status breakdown
    const statusCounts = {};
    registrations.forEach(reg => {
      statusCounts[reg.status] = (statusCounts[reg.status] || 0) + 1;
    });
    
    csvContent += `\nStatus Breakdown\n`;
    Object.entries(statusCounts).forEach(([status, count]) => {
      csvContent += `${status.charAt(0).toUpperCase() + status.slice(1)},${count}\n`;
    });
    
    // Set headers for file download
    const filename = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-registrations.csv`;
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error exporting registrations" 
    });
  }
};

// 10. Update registration status (admin only) - ✅ NEW COMPLETE FUNCTION
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id: eventId, registrationId } = req.params; // Changed here
    const { status } = req.body;
    
    console.log('Updating registration status:', { eventId, registrationId, status });
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: pending, confirmed, or rejected' 
      });
    }

    // Find the registration
    const registration = await Registration.findOne({
      _id: registrationId,
      event: eventId
    }).populate('event');

    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    // Check if user is the event's club admin
    if (registration.event.clubId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this registration' 
      });
    }

    // Update status
    registration.status = status;
    await registration.save();

    res.status(200).json({
      success: true,
      message: `Registration status updated to ${status}`,
      data: {
        _id: registration._id,
        status: registration.status,
        user: registration.user,
        event: registration.event._id
      }
    });

  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating registration status' 
    });
  }
};