const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const doc = await mongoose.connection.db.collection('pincodes').findOne({});
  const keys = Object.keys(doc);
  const result = {
    keys: keys,
    stateClean: await mongoose.connection.db.collection('pincodes').distinct('stateName'),
    stateMess: await mongoose.connection.db.collection('pincodes').distinct('stateName                                               '),
    stateNative: await mongoose.connection.db.collection('pincodes').distinct('state')
  };

  fs.writeFileSync('db_keys_dump.json', JSON.stringify(result, null, 2));

  await mongoose.disconnect();
}

test().catch(console.error);
