const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function checkFields() {
  await mongoose.connect(process.env.MONGODB_URI);
  const doc = await mongoose.connection.db.collection('pincodes').findOne();
  console.log('FIELDS:', JSON.stringify(Object.keys(doc)));
  console.log('SAMPLE_DOC:', JSON.stringify(doc, null, 2));
  process.exit(0);
}

checkFields();
