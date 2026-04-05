const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PATH = require('path');

dotenv.config({ path: PATH.join(__dirname, '.env') });

const URI = process.env.MONGODB_URI;

async function checkData() {
  if (!URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(URI);
    const countWithCoords = await mongoose.connection.db.collection('pincodes').countDocuments({ 
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    });
    const totalCount = await mongoose.connection.db.collection('pincodes').countDocuments();
    
    console.log(`TOTAL_COUNT: ${totalCount}`);
    console.log(`COORDS_COUNT: ${countWithCoords}`);
    
    if (countWithCoords > 0) {
        const sample = await mongoose.connection.db.collection('pincodes').findOne({ latitude: { $ne: null } });
        console.log('SAMPLE_COORD:', sample.latitude, sample.longitude);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
