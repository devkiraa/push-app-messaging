const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the database connection

// Register Device Endpoint
router.post('/', async (req, res) => {
  const { deviceID, userID } = req.body;

  // Validate inputs
  if (!deviceID || !userID) {
    return res.status(400).send('Device ID and User ID are required.');
  }

  try {
    // Check if the user ID already exists in the database
    const [rows] = await db.execute('SELECT * FROM devices WHERE user_id = ?', [userID]);

    if (rows.length > 0) {
      // User ID exists, update the device ID
      await db.execute('UPDATE devices SET device_id = ? WHERE user_id = ?', [deviceID, userID]);
      console.log(`Device updated: ${deviceID}, User: ${userID}`);
      return res.status(200).send('Device updated successfully.');
    } else {
      // User ID does not exist, insert a new record
      await db.execute('INSERT INTO devices (device_id, user_id) VALUES (?, ?)', [deviceID, userID]);
      console.log(`Device registered: ${deviceID}, User: ${userID}`);
      return res.status(200).send('Device registered successfully.');
    }
  } catch (err) {
    console.error('Error saving device:', err.message);
    res.status(500).send('Error saving device.');
  }
});

module.exports = router;
