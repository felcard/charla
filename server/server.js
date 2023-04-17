// const io = require('./connection');
// //const auth = require('./middleware');
// const { loginSpace, mainSpace } = require('./namespaces');

// const login = io.of('/login');

// //login.use(auth);

// login.on('connection', loginSpace);

// io.on('connection', mainSpace);

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: '*' } });


const login = io.of('/login');

login.on('connection', socket => {
    console.log('LOGIN connection ON');

    socket.on('code', data => {
        console.log('DOS', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from LOGIN');
    });
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for incoming messages
    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.emit('message', data);
    });

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected from MAIN');
    });


});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});