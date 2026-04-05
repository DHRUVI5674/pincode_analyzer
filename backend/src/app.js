const express = require('express');
const cors = require('cors');
const pincodeRoutes = require('./routes/pincodeRoutes');

const app = express();

// Allow both local dev and production origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pincode-analyzer-7.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(null, true); // allow all for now; restrict in production
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', pincodeRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Pincode Analyzer API',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'Running'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
