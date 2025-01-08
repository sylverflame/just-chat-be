const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const chatDB = require("./db/db");

// Create an Express application
const app = express();

// Create a basic HTTP server using Express
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Middleware to serve a simple route
app.get("/", (req, res) => {
  res.send("WebSocket server is running!");
});

// Function to stringify JSON objects
const jsonStringify = (id, type, content) => {
  return JSON.stringify({ id, type, content });
};

// Send data to all clients
const sendToAllClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("A client connected");
  // Send a message to the connected client
  ws.send(
    jsonStringify("welcome-text", "string", "Welcome to the WebSocket server!")
  );
  ws.send(jsonStringify("chatdb", "array", chatDB));
  sendToAllClients(
    jsonStringify("clients-connected", "number", wss.clients.size)
  );

  // Handle incoming messages from the client
  ws.on("message", (message) => {
    chatDB.length >= 50 && chatDB.shift();
    chatDB.push(JSON.parse(message));
    sendToAllClients(jsonStringify("chatdb", "array", chatDB));
  });

  // Handle WebSocket closure
  ws.on("close", () => {
    console.log("A client disconnected");
    sendToAllClients(
      jsonStringify("clients-connected", "number", wss.clients.size)
    );
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
