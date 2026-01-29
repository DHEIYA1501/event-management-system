const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: '14:30'
  },
  venue: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 50
  },
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'published'
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

/* ✅ CORRECT pre-save hook (NO next misuse) */
EventSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Event', EventSchema);
