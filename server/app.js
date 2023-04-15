const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, { cors: true });


// Set up a namespace for Socket.io
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
    console.log('User connected to chat namespace.');

    // Listen for incoming messages
    socket.on('message', (data) => {
        console.log('Message received:', data);
        chatNamespace.emit('message', data);
    });

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected from chat namespace.');
    });
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});