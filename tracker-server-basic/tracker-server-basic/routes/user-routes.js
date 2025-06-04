const express = require('express');
const { pool } = require('../config/db');
const { Loc } = require('../model/location');
const { authenticateToken } = require('../middleware/auth');

const userRouter = express.Router();

// Apply auth middleware to protected routes
userRouter.use('/location', authenticateToken);
userRouter.use('/locations', authenticateToken);

// Save location endpoint
userRouter.post('/location', (req, res, next) => {
  const userId = req.user.sub; // Auth0 user ID
  const { latitude, longitude } = req.body;

  const sql = "INSERT INTO location (userid, latitude, longitude, time) VALUES (?,?,?,?)";
  
  pool.query(sql, [userId, latitude, longitude, new Date()], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return next(err);
    }
    
    const location = new Loc(result.insertId, userId, latitude, longitude, new Date());
    res.status(200).json(location);
  });
});

// Get locations endpoint
userRouter.get('/locations/:userId', (req, res, next) => {
  const userId = req.params.userId;
  
  // Ensure user can only access their own locations
  if (userId !== req.user.sub) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const sql = "SELECT * FROM location WHERE userid = ? ORDER BY time DESC";
  
  pool.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return next(err);
    }
    
    const locations = rows.map(row => 
      new Loc(row.id, row.userid, row.latitude, row.longitude, row.time)
    );
    res.status(200).json(locations);
  });
});

module.exports = { userRouter };