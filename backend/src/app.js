const express = require('express');
const cors = require('cors');
const pincodeRoutes = require('./routes/pincodeRoutes');

const mongoose = require('mongoose');
const connectDB = require('./config/database');

const app = express();

// Database initialization middleware for serverless compatibility
let isDBConnected = false;
const initDb = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
      console.log('✓ MongoDB connected for request');
    } catch (err) {
      console.error('Database connection error:', err.message);
      return res.status(500).json({ message: 'Database connection failed' });
    }
  }
  next();
};

// Allow both local dev and production origins
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach database connection middleware BEFORE routes
app.use(initDb);

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
