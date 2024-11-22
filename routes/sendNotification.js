const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Import the database connection
const connectedClients = require('../connectedClients'); // Import connected clients map

// API to send notifications
router.post('/', async (req, res) => {
  const { userID, message } = req.body;

  // Validate inputs
  if (!userID || !message) {
    return res.status(400).send('User ID and message are required.');
  }

  try {
    // Fetch the device ID associated with the user ID from the database
    const [rows] = await db.execute('SELECT device_id FROM devices WHERE user_id = ?', [userID]);

    if (rows.length === 0) {
      console.error(`No device found for User ID: ${userID}`);
      return res.status(404).send('User not registered with any device.');
    }

    const deviceID = rows[0].device_id;

    // Check if the device is connected via WebSocket
    if (connectedClients[deviceID]) {
      // Send the message to the WebSocket client
      connectedClients[deviceID].send(message);
      console.log(`Notification sent to User ${userID} (Device: ${deviceID}): ${message}`);
      return res.status(200).send('Notification sent!');
    } else {
      console.error(`Device not connected for User ID: ${userID}`);
      return res.status(404).send('Device not connected.');
    }
  } catch (err) {
    console.error('Error sending notification:', err.message);
    return res.status(500).send('Error sending notification.');
  }
});

module.exports = router;
