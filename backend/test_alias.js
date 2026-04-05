const mongoose = require('mongoose');
const Pincode = require('./src/models/pincode');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const paddedStates = await Pincode.distinct("stateName                                               ");
  console.log('Padding Distinct:', paddedStates.slice(0, 5));
  
  const aliasStates = await Pincode.distinct('stateName');
  console.log('Alias Distinct:', aliasStates.slice(0, 5));
  
  const findPadded = await Pincode.find({}).select("stateName                                               ").limit(1).lean();
  console.log('Find Padded:', findPadded);
  
  const findAlias = await Pincode.find({}).select('stateName').limit(1).lean();
  console.log('Find Alias:', findAlias);

  await mongoose.disconnect();
}

test().catch(console.error);
