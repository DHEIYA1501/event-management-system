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
    default: '14:30'
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    default: 50
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Club ID is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published'  // ✅ FIX: Changed from 'pending' to 'published'
  },
  category: {
    type: String,
    enum: ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Seminar'],
    default: 'Technical'
  },
  posterUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
EventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', EventSchema);