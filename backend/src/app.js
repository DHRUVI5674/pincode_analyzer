const express = require('express');
const cors = require('cors');
const pincodeRoutes = require('./routes/pincodeRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', pincodeRoutes);

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
