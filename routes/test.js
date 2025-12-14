const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date(),
    status: 'OK'
  });
});

router.get('/db-test', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    dbState: mongoose.connection.readyState,
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    dbName: mongoose.connection.name
  });
});

module.exports = router;