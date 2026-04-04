// This wrapper is required for deployment platforms that expect backend/server.js
// The actual application entrypoint is under src/server.js.
module.exports = require('./src/server');
