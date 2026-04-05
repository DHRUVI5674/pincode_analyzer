const mongoose = require('mongoose');
const Pincode = require('./src/models/pincode');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to:', mongoose.connection.name);
  
  const count = await Pincode.countDocuments();
  console.log('Document count in Pincode model:', count);
  
  const sample = await Pincode.findOne({});
  console.log('Sample Document:', JSON.stringify(sample, null, 2));
  
  const states = await Pincode.distinct('stateName');
  console.log('Distinct stateName:', states);
  
  await mongoose.disconnect();
}

test().catch(console.error);
