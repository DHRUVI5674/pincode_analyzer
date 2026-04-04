const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  searchTerm: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  pincode: {
    type: String,
    trim: true,
    index: true,
    default: null
  },
  ip: {
    type: String,
    trim: true,
    default: null
  },
  userAgent: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

searchLogSchema.index({ searchTerm: 1, createdAt: -1 });
searchLogSchema.index({ pincode: 1, createdAt: -1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);
