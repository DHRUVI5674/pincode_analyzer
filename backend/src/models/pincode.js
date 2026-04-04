const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  officeName: {
    type: String,
    required: true,
    trim: true
  },
  officeType: {
    type: String,
    enum: ['Delivery', 'Non-Delivery', 'Sub Office', 'Branch Office', 'Head Office'],
    default: 'Delivery'
  },
  deliveryStatus: {
    type: String,
    enum: ['Delivery', 'Non-Delivery'],
    required: true
  },
  divisionName: {
    type: String,
    trim: true
  },
  regionName: {
    type: String,
    trim: true
  },
  circleName: {
    type: String,
    trim: true
  },
  taluk: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  country: {
    type: String,
    default: 'INDIA',
    trim: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for faster queries
pincodeSchema.index({ state: 1, district: 1 });
pincodeSchema.index({ state: 1, district: 1, taluk: 1 });
pincodeSchema.index({ officeName: 'text', taluk: 'text', district: 'text' });

module.exports = mongoose.model('Pincode', pincodeSchema);