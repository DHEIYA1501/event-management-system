const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Club ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  posterUrl: {
    type: String,
    default: ''
  },
  // ✅ ADD THIS LINE - Registered users array
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);