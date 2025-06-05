const express = require('express');
const { pool } = require('../config/db');
const { Loc } = require('../model/location');
const { authenticateToken } = require('../middleware/auth');

const userRouter = express.Router();

// Apply authentication middleware to protected routes
// Note: We'll apply it selectively to avoid issues during development

// Health check endpoint (no auth needed)
userRouter.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'User API is working',
    timestamp: new Date().toISOString()
  });
});

// Save location endpoint - WITH authentication
userRouter.post('/location', authenticateToken, (req, res, next) => {
  const { latitude, longitude } = req.body;
  
  // Get user ID from verified JWT token instead of request body
  const userid = req.user.sub; // Auth0 user ID from JWT

  console.log('📍 Saving location request:', { userid, latitude, longitude });

  // Validate input
  if (!latitude || !longitude) {
    return res.status(400).json({ 
      error: 'Missing required fields: latitude and longitude' 
    });
  }

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ 
      error: 'Latitude and longitude must be numbers' 
    });
  }

  const sql = "INSERT INTO location (userid, latitude, longitude, time) VALUES (?, ?, ?, ?)";
  const currentTime = new Date();
  
  pool.query(sql, [userid, latitude, longitude, currentTime], (err, result) => {
    if (err) {
      console.error('❌ Database error saving location:', err);
      return next(err);
    }
    
    const location = new Loc(result.insertId, userid, latitude, longitude, currentTime);
    console.log('✅ Location saved successfully:', location);
    res.status(200).json(location);
  });
});

// Get locations endpoint - WITH authentication
userRouter.get('/locations', authenticateToken, (req, res, next) => {
  // Get user ID from verified JWT token
  const userId = req.user.sub;
  
  console.log('📋 Getting locations for authenticated user:', userId);

  const sql = "SELECT * FROM location WHERE userid = ? ORDER BY time DESC";
  
  pool.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Database error getting locations:', err);
      return next(err);
    }
    
    const locations = rows.map(row => 
      new Loc(row.id, row.userid, row.latitude, row.longitude, row.time)
    );
    console.log('✅ Found locations:', locations.length);
    res.status(200).json(locations);
  });
});

// BACKWARD COMPATIBILITY: Keep old endpoint for now (can remove later)
userRouter.get('/locations/:userId', (req, res, next) => {
  const userId = decodeURIComponent(req.params.userId);
  
  console.log('⚠️  Using deprecated endpoint - locations by user ID:', userId);
  console.log('⚠️  Consider updating frontend to use /locations instead');

  if (!userId || userId === 'undefined' || userId === 'null') {
    return res.status(400).json({ 
      error: 'Invalid user ID' 
    });
  }

  const sql = "SELECT * FROM location WHERE userid = ? ORDER BY time DESC";
  
  pool.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ Database error getting locations:', err);
      return next(err);
    }
    
    const locations = rows.map(row => 
      new Loc(row.id, row.userid, row.latitude, row.longitude, row.time)
    );
    console.log('✅ Found locations (deprecated endpoint):', locations.length);
    res.status(200).json(locations);
  });
});

module.exports = { userRouter };