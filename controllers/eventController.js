// controllers/eventController.js
const Event = require('../models/event');
const User = require('../models/user');

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

        await event.deleteOne();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 6. Register for event (students only) - ✅ ADDED
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

        // Check if already registered
        if (event.registeredUsers && event.registeredUsers.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already registered for this event' });
        }

        // Check capacity
        const registeredCount = event.registeredUsers ? event.registeredUsers.length : 0;
        if (registeredCount >= event.capacity) {
            return res.status(400).json({ message: 'Event is full' });
        }

        // Initialize registeredUsers array if not exists
        if (!event.registeredUsers) {
            event.registeredUsers = [];
        }

        // Register user
        event.registeredUsers.push(req.user.id);
        await event.save();

        res.status(200).json({ 
            message: 'Registered for event successfully', 
            eventId: event._id,
            registeredCount: event.registeredUsers.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ========== DAY 3: ADMIN FUNCTIONS ==========

// 7. Get admin dashboard events with stats
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
    
    // Add registration count to each event
    const eventsWithStats = events.map(event => {
      const eventObj = event.toObject();
      const registeredCount = event.registeredUsers ? event.registeredUsers.length : 0;
      
      eventObj.registrationCount = registeredCount;
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
    });
    
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

// 8. Get event registrations (admin only)
exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name email')
      .populate('registeredUsers', 'name email studentId avatar');
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Event not found" 
      });
    }
    
    // Check if user is the event's club admin
    if (event.clubId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view registrations for this event" 
      });
    }
    
    const registeredUsers = event.registeredUsers || [];
    
    // Registration statistics
    const registrationStats = {
      total: registeredUsers.length,
      capacity: event.capacity,
      availableSpots: event.capacity - registeredUsers.length,
      fillPercentage: event.capacity > 0 
        ? Math.round((registeredUsers.length / event.capacity) * 100) 
        : 0
    };
    
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
      count: registeredUsers.length,
      data: registeredUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Server error fetching registrations" 
    });
  }
};

// 9. Export registrations as CSV
exports.exportRegistrationsCSV = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registeredUsers', 'name email studentId');
    
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
    
    const registeredUsers = event.registeredUsers || [];
    
    if (registeredUsers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No registrations to export" 
      });
    }
    
    // Create CSV content
    let csvContent = "Sr.No,Name,Email,Student ID\n";
    
    registeredUsers.forEach((user, index) => {
      const row = [
        index + 1,
        `"${user.name || "N/A"}"`,
        `"${user.email || "N/A"}"`,
        `"${user.studentId || "N/A"}"`
      ].join(",");
      
      csvContent += row + "\n";
    });
    
    // Add event summary
    csvContent += `\nEvent Summary\n`;
    csvContent += `Event Title,"${event.title}"\n`;
    csvContent += `Date,"${new Date(event.date).toLocaleDateString()}"\n`;
    csvContent += `Venue,"${event.venue}"\n`;
    csvContent += `Total Registrations,${registeredUsers.length}\n`;
    csvContent += `Capacity,${event.capacity}\n`;
    
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