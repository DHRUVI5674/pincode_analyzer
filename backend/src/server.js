const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/database');
const app = require('./app');
const Pincode = require('./models/pincode');

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
