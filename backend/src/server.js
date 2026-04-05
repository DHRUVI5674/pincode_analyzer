const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/database');
const app = require('./app');
const Pincode = require('./models/pincode');

// Database connection status
let isDBConnected = false;

// Function to handle database initialization and index creation
const initializeApp = async () => {
  if (isDBConnected) return;

  try {
    await connectDB();
    isDBConnected = true;
    console.log('MongoDB connected successfully');

    // Verification of essential indexes
    try {
      await Pincode.collection.createIndex({ state: 1 });
      await Pincode.collection.createIndex({ pincode: 1 });
      console.log('✓ Database indexes verified');
    } catch (err) {
      console.log('Index check skipped or already exists');
    }
  } catch (err) {
    console.error('Failed to initialize app context:', err.message);
  }
};

// Add initialization middleware for Vercel functions
app.use(async (req, res, next) => {
  if (!isDBConnected) {
    await initializeApp();
  }
  next();
});

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
