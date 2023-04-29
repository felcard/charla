const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "https://wordiness.netlify.app/", credentials: true } });



io.on('connection', (socket) => {
    console.log('a user connected MAIN');

    socket.on('room', room => {
        if (!io.sockets.adapter.rooms.has(room.name)) {
            socket.emit('room', `room created: ${room.name}`);
            socket.join(room.name);
            socket.emit('joined', 'joined room');
            const roomData = io.sockets.adapter.rooms.get(room.name);
            roomData.data = room;
            socket.on('message', (data) => {
                console.log('Message received:', data);
                io.to(room.name).emit('message', data);
            });
        } else {
            const roomData = io.sockets.adapter.rooms.get(room.name);
            if (room.code === roomData.data.code) {
                console.log('otherUSer');
                socket.join(roomData.data.name);
                console.log(`other user joined ${room.name}`);
                socket.on('message', (data) => {
                    console.log('Message received:', data);
                    io.to(room.name).emit('message', data);
                });
            } else {
                socket.emit('room', 'ROOM TAKEN');
            }
        }

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