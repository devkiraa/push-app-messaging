const express = require('express');
const registerRoute = require('./register');
const sendNotificationRoute = require('./sendNotification');

const router = express.Router();

// Register the sub-routes
router.use('/register', registerRoute);
router.use('/send-notification', sendNotificationRoute);

module.exports = router;
