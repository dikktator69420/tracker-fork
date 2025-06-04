const express = require('express');
const cors = require('cors');
const config = require('config');
const { userRouter } = require('./routes/user-routes');
const http = require('http');

const app = express();
const port = config.get('appConfig.port');

// Fix CORS - allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add /users prefix to match frontend expectations
app.use('/users', userRouter);

// Health check endpoint
app.get('/health', (req, res) => {
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
server.listen(port, () => {
  console.log(`Location Tracker API listening on port ${port}`);
});