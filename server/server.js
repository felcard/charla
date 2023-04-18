const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "https://beautiful-tarsier-8e762a.netlify.app", credentials: true } });

const auth = require('./middleware');


const login = io.of('/login');
login.use(auth);

login.on('connection', async (socket) => {
    console.log('a user connected LOGIN');
    // Listen for incoming messages
    socket.emit('code', 'EXITO');

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected from LOGIN.');
    });


});

io.on('connection', (socket) => {
    console.log('a user connected MAIN');

    // Listen for incoming messages
    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.emit('message', data);
    });

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected from MAIN.');
    });


});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});