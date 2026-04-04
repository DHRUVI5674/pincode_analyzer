const mongoose = require('mongoose');

const alertThresholdSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  thresholdType: {
    type: String,
    enum: ['count-drop', 'search-volume', 'delivery-ratio'],
    default: 'count-drop'
  },
  value: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastTriggeredAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AlertThreshold', alertThresholdSchema);
