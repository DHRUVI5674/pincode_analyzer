const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const doc = await mongoose.connection.db.collection('pincodes').findOne({});
  console.log('Doc _id:', doc._id);
  console.log('Doc keys:', Object.keys(doc));
  console.log('Doc stateName value:', doc.stateName, doc['stateName '], doc.state);
  
  const states = await mongoose.connection.db.collection('pincodes').distinct('stateName');
  console.log('Distinct stateName:', states.slice(0, 5));
  
  const states2 = await mongoose.connection.db.collection('pincodes').distinct('state');
  console.log('Distinct state:', states2.slice(0, 5));

  await mongoose.disconnect();
}

test().catch(console.error);
