const express = require('express');
const cors = require('cors');
const pincodeRoutes = require('./routes/pincodeRoutes');

const app = express();

// Allow both local dev and production origins
app.use(cors({
  origin: true, // During transition, let's allow all. Can be restricted later.
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
