const dotenv = require('dotenv');
dotenv.config(); // Must be first — loads MONGODB_URI before anything else

const connectDB = require('./config/database');
const app = require('./app');
const Pincode = require('./models/pincode');

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');

    try {
      console.log('Creating MongoDB indexes...');
      await Pincode.collection.createIndex({ state: 1 });
      console.log('✓ Created index on state field');
      await Pincode.collection.createIndex({ state: 1, district: 1 });
      console.log('✓ Created composite index on state and district fields');
      await Pincode.collection.createIndex({ state: 1, district: 1, taluk: 1 });
      console.log('✓ Created composite index on state, district, and taluk fields');
      await Pincode.collection.createIndex({ pincode: 1 });
      console.log('✓ Created index on pincode field');
      await Pincode.collection.createIndex({ officeName: 1 });
      console.log('✓ Created index on officeName field');
      console.log('All indexes created successfully!');
    } catch (error) {
      console.error('Error creating indexes:', error.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
