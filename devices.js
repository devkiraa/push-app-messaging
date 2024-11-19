const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the database connection from db.js

// Register Device Endpoint
router.post('/register', async (req, res) => {
  const { deviceID, userID } = req.body;

  // Validate inputs
  if (!deviceID || !userID) {
    return res.status(400).send('Device ID and User ID are required.');
  }

  try {
    // Insert the device ID and user ID into the database
    await db.execute('INSERT INTO devices (device_id, user_id) VALUES (?, ?)', [deviceID, userID]);
    console.log(`Device registered: ${deviceID}, User: ${userID}`);
    res.status(200).send('Device registered successfully.');
  } catch (err) {
    console.error('Error saving device:', err.message);
    res.status(500).send('Error saving device.');
  }
});

module.exports = router;
