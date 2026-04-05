const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: Number,
    required: true,
    index: true
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
  /* 
     NOTICE: The MongoDB Atlas database has field names with a massive number of trailing spaces. 
     Fields like stateName are exactly 48 chars long. These must match perfectly.
  */
  /* 
     NOTICE: The MongoDB Atlas database has field names with a massive number of trailing spaces. 
     Fields like stateName are exactly 48 chars long. These must match perfectly.
  */
  taluk: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  districtName: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  "stateName                                       ": {
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
pincodeSchema.index({ "stateName                                       ": 1, districtName: 1 });
pincodeSchema.index({ "stateName                                       ": 1, districtName: 1, taluk: 1 });
pincodeSchema.index({ officeName: 'text', taluk: 'text', districtName: 'text' });

module.exports = mongoose.model('Pincode', pincodeSchema);