const express = require('express');
const cors = require('cors');
const config = require('config');
const { userRouter } = require('./routes/user-routes');
const http = require('http');

const app = express();
const port = config.get('appConfig.port');
const origin = config.get('appConfig.origin');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: origin }));

// Add /api prefix to match frontend expectations
app.use('/api/users', userRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Location Tracker API is running' });
});

// Error handler
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Error:", err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
}
app.use(errorHandler);

const server = http.createServer(app);
server.listen(port, "localhost", () => {
  console.log(`Location Tracker API listening on port ${port}`);
});