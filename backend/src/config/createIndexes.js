/**
 * MongoDB Indexes Setup Script
 * 
 * This file contains the MongoDB commands to create indexes for optimal performance.
 * 
 * HOW TO RUN:
 * 1. Make sure MongoDB is running (port 27017)
 * 2. Open MongoDB Shell (mongosh)
 * 3. Connect to your database: use city_pincode (or your database name)
 * 4. Copy and paste each command below into the MongoDB Shell
 * 5. Or run this file directly using: mongosh < backend/config/createIndexes.js
 * 
 * COMMANDS:
 */

// Switch to the database (run this first in mongosh)
// use city_pincode

// Index 1: State index - for faster state filtering
db.pincodes.createIndex({ state: 1 });
console.log('✓ Created index on state field');

// Index 2: State + District composite index - for faster district filtering by state
db.pincodes.createIndex({ state: 1, district: 1 });
console.log('✓ Created composite index on state and district fields');

// Index 3: State + District + Taluk composite index - for fastest filtering by all three
db.pincodes.createIndex({ state: 1, district: 1, taluk: 1 });
console.log('✓ Created composite index on state, district, and taluk fields');

// Index 4: Pincode index - for fast pincode lookups
db.pincodes.createIndex({ pincode: 1 });
console.log('✓ Created index on pincode field');

// Index 5: Office name index - for fast search/autocomplete
db.pincodes.createIndex({ officeName: 1 });
console.log('✓ Created index on officeName field');

// Index 6: Delivery status index - for filtering by delivery status
db.pincodes.createIndex({ deliveryStatus: 1 });
console.log('✓ Created index on deliveryStatus field');

// Index 7: Text index for full-text search (optional, for advanced search)
db.pincodes.createIndex({ 
  pincode: 'text', 
  officeName: 'text', 
  district: 'text', 
  state: 'text' 
});
console.log('✓ Created text index for full-text search');

console.log('\n✓ All indexes created successfully!');
console.log('\nTo verify indexes, run: db.pincodes.getIndexes()');

/**
 * ALTERNATIVE: If you want to run this file automatically
 * 
 * 1. Save this as backend/config/createIndexes.js
 * 2. Create a separate Node.js script to connect and run:
 * 
 * const mongoose = require('mongoose');
 * require('dotenv').config();
 * 
 * mongoose.connect(process.env.MONGODB_URI, {
 *   useNewUrlParser: true,
 *   useUnifiedTopology: true,
 * }).then(async () => {
 *   const db = mongoose.connection.db;
 *   
 *   try {
 *     await db.collection('pincodes').createIndex({ state: 1 });
 *     await db.collection('pincodes').createIndex({ state: 1, district: 1 });
 *     await db.collection('pincodes').createIndex({ state: 1, district: 1, taluk: 1 });
 *     await db.collection('pincodes').createIndex({ pincode: 1 });
 *     await db.collection('pincodes').createIndex({ officeName: 1 });
 *     await db.collection('pincodes').createIndex({ deliveryStatus: 1 });
 *     
 *     console.log('✓ All indexes created successfully!');
 *     process.exit(0);
 *   } catch (error) {
 *     console.error('Error creating indexes:', error);
 *     process.exit(1);
 *   }
 * }).catch(err => {
 *   console.error('MongoDB connection error:', err);
 *   process.exit(1);
 * });
 * 
 * 3. Run: node backend/config/createIndexes.js
 */
