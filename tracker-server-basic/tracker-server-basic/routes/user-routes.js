const express = require('express');
const { pool } = require('../config/db');
const { Loc } = require('../model/location');

const userRouter = express.Router();

// NO authentication middleware

// Save location endpoint
userRouter.post('/location', (req, res, next) => {
  const userId = req.body.userid || 'test-user';
  const { latitude, longitude } = req.body;

  console.log('Saving location:', { userId, latitude, longitude }); // Debug log

  const sql = "INSERT INTO location (userid, latitude, longitude, time) VALUES (?,?,?,?)";
  
  pool.query(sql, [userId, latitude, longitude, new Date()], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return next(err);
    }
    
    const location = new Loc(result.insertId, userId, latitude, longitude, new Date());
    console.log('Location saved:', location); // Debug log
    res.status(200).json(location);
  });
});

// Get locations endpoint  
userRouter.get('/locations/:userId', (req, res, next) => {
  const userId = req.params.userId;
  
  console.log('Getting locations for user:', userId); // Debug log

  const sql = "SELECT * FROM location WHERE userid = ? ORDER BY time DESC";
  
  pool.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return next(err);
    }
    
    const locations = rows.map(row => 
      new Loc(row.id, row.userid, row.latitude, row.longitude, row.time)
    );
    console.log('Found locations:', locations.length); // Debug log
    res.status(200).json(locations);
  });
});

module.exports = { userRouter };