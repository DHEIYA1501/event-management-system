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