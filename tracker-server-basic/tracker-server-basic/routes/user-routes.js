const express = require('express');
const { pool } = require('../config/db');
const { Loc } = require('../model/location');

const userRouter = express.Router();

// Save location endpoint
userRouter.post('/location', (req, res, next) => {
  const { userid, latitude, longitude } = req.body;

  console.log('📍 Saving location request:', { userid, latitude, longitude });

  // Validate input
  if (!userid) {
    return res.status(400).json({ 
      error: 'Missing required field: userid' 
    });
  }

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

  // Auth0 user IDs can be long, so we'll use VARCHAR instead of INT
  const sql = "INSERT INTO location (userid, latitude, longitude, time) VALUES (?, ?, ?, ?)";
  const currentTime = new Date();
  
  pool.query(sql, [userid, latitude, longitude, currentTime], (err, result) => {
    if (err) {
      console.error('❌ Database error saving location:', err);
      
      // Handle specific database errors
      if (err.code === 'ER_DATA_TOO_LONG') {
        return res.status(400).json({ 
          error: 'User ID is too long for database field' 
        });
      }
      
      return next(err);
    }
    
    const location = new Loc(result.insertId, userid, latitude, longitude, currentTime);
    console.log('✅ Location saved successfully:', location);
    res.status(200).json(location);
  });
});

// Get locations endpoint  
userRouter.get('/locations/:userId', (req, res, next) => {
  const userId = decodeURIComponent(req.params.userId);
  
  console.log('📋 Getting locations for user:', userId);

  // Validate user ID
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
    console.log('✅ Found locations:', locations.length);
    res.status(200).json(locations);
  });
});

module.exports = { userRouter };