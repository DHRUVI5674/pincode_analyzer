const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Pincode = require('../src/models/pincode');

const STATE_COORDS = {
  'ANDAMAN & NICOBAR ISLANDS': [11.7401, 92.6586],
  'ANDHRA PRADESH': [15.9129, 79.7400],
  'ARUNACHAL PRADESH': [28.2180, 94.7278],
  'ASSAM': [26.2006, 92.9376],
  'BIHAR': [25.0961, 85.3131],
  'CHANDIGARH': [30.7333, 76.7794],
  'CHHATTISGARH': [21.2787, 81.8661],
  'DADRA & NAGAR HAVELI AND DAMAN & DIU': [20.1809, 73.0169],
  'DELHI': [28.6139, 77.2090],
  'GOA': [15.2993, 74.1240],
  'GUJARAT': [22.2587, 71.1924],
  'HARYANA': [29.0588, 76.0856],
  'HIMACHAL PRADESH': [31.1048, 77.1734],
  'JAMMU & KASHMIR': [33.7782, 76.5762],
  'JHARKHAND': [23.6102, 85.2799],
  'KARNATAKA': [15.3173, 75.7139],
  'KERALA': [10.8505, 76.2711],
  'LADAKH': [34.1526, 77.5771],
  'LAKSHADWEEP': [10.5667, 72.6417],
  'MADHYA PRADESH': [22.9734, 78.6569],
  'MAHARASHTRA': [19.7515, 75.7139],
  'MANIPUR': [24.6637, 93.9063],
  'MEGHALAYA': [25.4670, 91.3662],
  'MIZORAM': [23.1645, 92.9376],
  'NAGALAND': [26.1584, 94.5624],
  'ODISHA': [20.9517, 85.0985],
  'PUDUCHERRY': [11.9416, 79.8083],
  'PUNJAB': [31.1471, 75.3412],
  'RAJASTHAN': [27.0238, 74.2179],
  'SIKKIM': [27.5330, 88.5122],
  'TAMIL NADU': [11.1271, 78.6569],
  'TELANGANA': [18.1124, 79.0193],
  'TRIPURA': [23.9408, 91.9882],
  'UTTAR PRADESH': [26.8467, 80.9462],
  'UTTARAKHAND': [30.0668, 79.0193],
  'WEST BENGAL': [22.9868, 87.8550]
};

const STATE_KEY = "stateName                                       ";

async function seedCoordinates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const states = Object.keys(STATE_COORDS);
    let totalUpdated = 0;

    for (const state of states) {
      const [baseLat, baseLng] = STATE_COORDS[state];
      console.log(`Processing ${state}...`);

      const pincodes = await Pincode.find({ [STATE_KEY]: new RegExp(`^${state}`, 'i'), latitude: null });
      console.log(`Found ${pincodes.length} records in ${state} without coordinates.`);

      if (pincodes.length === 0) continue;

      const operations = pincodes.map((pin, index) => {
        // Add random jitter so they spread out
        // Roughly 0.01 degree is ~1.1km
        const jitterLat = (Math.random() - 0.5) * 2.0; // Spread up to ~110km
        const jitterLng = (Math.random() - 0.5) * 2.0;

        return {
          updateOne: {
            filter: { _id: pin._id },
            update: { 
              $set: { 
                latitude: baseLat + jitterLat, 
                longitude: baseLng + jitterLng 
              } 
            }
          }
        };
      });

      // Split into chunks of 1000
      const chunkSize = 1000;
      for (let i = 0; i < operations.length; i += chunkSize) {
        const chunk = operations.slice(i, i + chunkSize);
        await Pincode.bulkWrite(chunk);
        totalUpdated += chunk.length;
        console.log(`Updated ${totalUpdated} records...`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding coordinates:', err);
    process.exit(1);
  }
}

seedCoordinates();
