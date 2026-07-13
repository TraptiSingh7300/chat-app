// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite's default dev server URL
    methods: ["GET", "POST"]
  }
});

// In-memory array acting as our temporary database
let messageHistory = [];

// REST API: Fetch all past messages on app refresh
app.get('/api/messages', (req, res) => {
  try {
    res.status(200).json(messageHistory);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// REST API: Save a newly sent message
app.post('/api/messages', (req, res) => {
  try {
    const { username, text, timestamp } = req.body;
    if (!username || !text) {
      return res.status(400).json({ error: "Username and text are required" });
    }

    const newMessage = { id: Date.now().toString(), username, text, timestamp };
    messageHistory.push(newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Real-Time Socket.io Pipeline
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Listen for new messages and broadcast to everyone
  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  // 2. Listen for typing events and broadcast to everyone ELSE
  socket.on('typing', (username) => {
    socket.broadcast.emit('user_typing', username);
  });

  // 3. Listen for stop typing events and broadcast to everyone ELSE
  socket.on('stop_typing', () => {
    socket.broadcast.emit('user_stop_typing');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});