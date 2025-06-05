const express = require('express');
const cors = require('cors');
const config = require('config');
const { userRouter } = require('./routes/user-routes');
const http = require('http');

const app = express();
const port = config.get('appConfig.port');

// ENHANCED CORS Configuration for Docker
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://host.docker.internal:4200',
    'http://10.0.2.2:4200'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // Support legacy browsers
}));

// Additional CORS headers for preflight requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('🔍 Handling OPTIONS preflight request for:', req.url);
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`📥 Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`📥 User-Agent: ${req.headers['user-agent'] || 'No user-agent'}`);
  if (req.headers.authorization) {
    console.log(`📥 Auth header present: ${req.headers.authorization.substring(0, 20)}...`);
  }
  next();
});

// Add /users prefix to match frontend expectations
app.use('/users', userRouter);

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Location Tracker API is running',
    timestamp: new Date().toISOString(),
    port: port,
    env: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Location Tracker API',
    version: '1.0.0',
    endpoints: [
      'GET /health',
      'GET /users/health', 
      'GET /users/locations',
      'POST /users/location'
    ]
  });
});

// Enhanced error handler
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  
  console.error("🚨 Error occurred:");
  console.error("🚨 URL:", req.url);
  console.error("🚨 Method:", req.method);
  console.error("🚨 Error:", err);
  console.error("🚨 Stack:", err.stack);
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString()
  });
}
app.use(errorHandler);

const server = http.createServer(app);

// Listen on all interfaces (important for Docker)
server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Location Tracker API listening on http://0.0.0.0:${port}`);
  console.log(`🚀 Health check: http://localhost:${port}/health`);
  console.log(`🚀 Users API: http://localhost:${port}/users/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});