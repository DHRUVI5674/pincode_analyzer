const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const result = {
    states: await mongoose.connection.db.collection('pincodes').distinct('stateName                                       '),
    districts: await mongoose.connection.db.collection('pincodes').distinct('districtName'),
    taluks: await mongoose.connection.db.collection('pincodes').distinct('taluk'),
  };

  fs.writeFileSync('db_keys_check.json', JSON.stringify({
    stateLen: result.states.length,
    districtLen: result.districts.length,
    talukLen: result.taluks.length,
    sampleStates: result.states.slice(0, 3)
  }, null, 2));

  await mongoose.disconnect();
}

test().catch(console.error);
