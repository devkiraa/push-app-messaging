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
app.post('/send-notification', (req, res) => {
  const { deviceID, message } = req.body;

  if (connectedClients[deviceID]) {
    connectedClients[deviceID].send(message); // Send message to WebSocket client
    console.log(`Notification sent to device ${deviceID}: ${message}`);
    res.status(200).send('Notification sent!');
  } else {
    console.error(`Device not connected: ${deviceID}`);
    res.status(404).send('Device not connected.');
  }
});

// Register device routes
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
