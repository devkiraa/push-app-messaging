const express = require('express');
const WebSocket = require('ws');
const dotenv = require("dotenv");
const deviceRoutes = require('./routes/devices'); // Import the devices routes
const db = require('./models/db'); // Import the database connection from db.js

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env or fallback to 3000

// Middleware for parsing JSON
app.use(express.json());

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });
let connectedClients = {};

// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  const deviceID = request.url.split('?id=')[1]; // Extract device ID from query
  connectedClients[deviceID] = ws;

  console.log(`Device connected: ${deviceID}`);

  ws.on('close', () => {
    console.log(`Device disconnected: ${deviceID}`);
    delete connectedClients[deviceID];
  });
});

// API to send notifications
app.post('/send-notification', async (req, res) => {
  const { userID, message } = req.body;

  if (!userID || !message) {
    return res.status(400).send('User ID and message are required.');
  }

  try {
    // Query the database for the latest device associated with the userID
    const [rows] = await db.execute(
      'SELECT device_id FROM devices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userID]
    );

    if (rows.length === 0) {
      console.error(`No devices found for user: ${userID}`);
      return res.status(404).send('No devices found for this user.');
    }

    const deviceID = rows[0].device_id;

    // Check if the device is connected
    if (connectedClients[deviceID]) {
      connectedClients[deviceID].send(message); // Send message to the WebSocket client
      console.log(`Notification sent to device ${deviceID}: ${message}`);
      res.status(200).send('Notification sent!');
    } else {
      console.error(`Device not connected: ${deviceID}`);
      res.status(404).send('Device not connected.');
    }
  } catch (err) {
    console.error('Error sending notification:', err.message);
    res.status(500).send('Error sending notification.');
  }
});

// Register device routes (handles device registration)
app.use('/api/devices', deviceRoutes); // Use the device routes for registering devices

// WebSocket Upgrade
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
