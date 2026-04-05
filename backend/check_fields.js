const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const doc = await db.collection('pincodes').findOne({});
    
    if (doc) {
      console.log('--- ALL KEYS ---');
      console.log(Object.keys(doc).join(', '));
      
      const commonFields = ['latitude', 'longitude', 'divisionName', 'regionName', 'circleName', 'officeName', 'pincode', 'Taluk', 'districtName', 'stateName'];
      console.log('--- FIELD CHECK ---');
      commonFields.forEach(f => {
        console.log(`${f}: ${doc[f] !== undefined ? 'EXISTS (' + typeof doc[f] + ')' : 'MISSING'}`);
      });
      console.log('--- FULL JSON ---');
      console.log(JSON.stringify(doc, null, 2));
    } else {
      console.log('No documents found in pincodes collection');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

check();
