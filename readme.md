# Device Notification API

This API enables user-device registration, real-time WebSocket communication, and notification delivery to registered devices. Below is a detailed description of the available endpoints, including their functionality, input requirements, and example responses.

---

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Endpoints](#endpoints)
   - [Register Device](#register-device)
   - [Send Notification](#send-notification)
4. [WebSocket Support](#websocket-support)
5. [License](#license)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/device-notification-api.git
   cd device-notification-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

---

## Configuration

The application uses environment variables. Create a `.env` file in the root directory with the following:

```env
PORT=3000
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

---

## Endpoints

### 1. **Register Device**
Register a device to a user or update the device ID for an existing user.

**URL:** `/api/devices/register`  
**Method:** `POST`  

**Request Body:**
```json
{
  "deviceID": "string",
  "userID": "string"
}
```

**Responses:**
- **200 OK (Device Registered):**
  ```json
  {
    "message": "Device registered successfully."
  }
  ```
- **200 OK (Device Updated):**
  ```json
  {
    "message": "Device updated successfully."
  }
  ```
- **400 Bad Request:**
  ```json
  {
    "error": "Device ID and User ID are required."
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "error": "Error saving device."
  }
  ```

---

### 2. **Send Notification**
Send a real-time notification to a device associated with a user.

**URL:** `/api/devices/send-notification`  
**Method:** `POST`

**Request Body:**
```json
{
  "userID": "string",
  "message": "string"
}
```

**Responses:**
- **200 OK (Notification Sent):**
  ```json
  {
    "message": "Notification sent!",
    "deviceID": "device123"
  }
  ```
- **404 Not Found (User Not Registered):**
  ```json
  {
    "error": "User not registered with any device."
  }
  ```
- **404 Not Found (Device Not Connected):**
  ```json
  {
    "error": "Device not connected.",
    "deviceID": "device123"
  }
  ```
- **400 Bad Request:**
  ```json
  {
    "error": "User ID and message are required."
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "error": "Error sending notification."
  }
  ```

---

## WebSocket Support

WebSocket connections are established for real-time communication. Devices connect using their `deviceID` as a query parameter:

**WebSocket URL:**
```
ws://<server-url>?id=<deviceID>
```

- **On Connection:** Logs `Device connected: <deviceID>`.
- **On Disconnection:** Logs `Device disconnected: <deviceID>` and removes the client from the connection pool.

### WebSocket Client Map
The `connectedClients` map stores active WebSocket connections:
```javascript
connectedClients = {
  "device123": WebSocketInstance
}
```

---

## License

This project is licensed under the MIT License. Feel free to use and modify.

---

### Prompt Notes for AI Understanding

- The API consists of two primary REST endpoints: **device registration** and **notification sending**.
- Device registration updates or inserts a record associating a `deviceID` with a `userID`.
- Notifications are sent in real-time to connected devices via WebSockets.
- If a device is not connected, an appropriate error response is returned.
- Ensure the WebSocket server and REST API work seamlessly together, using the `connectedClients` map to track active connections.