const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: { origin: "https://cleanchat.netlify.app/", credentials: true },
    //pingInterval: 30000,
    //pingTimeout: 120000,
});

io.on('connection', (socket) => {
    console.log(`user: ${socket.id} connected to MAIN`);
    socket.on('room', room => {
        if (!io.sockets.adapter.rooms.has(room.name)) {
            socket.emit('room', `room created: ${room.name}`);
            socket.join(room.name);
            socket.emit('joined', 'joined room');
            const roomData = io.sockets.adapter.rooms.get(room.name);//roomData references the created room
            roomData.data = room;
            socket.on('message', (data) => {
                console.log(`user: ${socket.id} sent a message`);
                io.to(room.name).emit('message', { msg: data, user: room.user });
            });
            socket.on('disconnect', () => {
                io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
                console.log(`User: ${socket.id} disconnected from MAIN.`);
                socket.offAny();
            });
        } else {
            const roomData = io.sockets.adapter.rooms.get(room.name);
            if (room.code === roomData.data.code) {
                socket.join(roomData.data.name);
                console.log(`user: ${socket.id} joined room`);
                io.to(room.name).emit('message', { msg: ' IS IN THE ROOM 👋', user: room.user });
                socket.on('message', (data) => {
                    console.log(`user: ${socket.id} sent a message`);
                    io.to(room.name).emit('message', { msg: data, user: room.user });
                });
                socket.on('disconnect', () => {
                    io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
                    console.log(`User: ${socket.id} disconnected from MAIN.`);
                    socket.offAny();
                });
            } else {
                socket.emit('room', 'ROOM TAKEN');
            }
        }
    });
    //this listens for disconnection event from a socket that has not joind a room, whereas the other two inside if or else block will listen those two different socket paths
    socket.on('disconnect', () => {
        console.log(`user: ${socket.id} DISCONNECTED`);
    });
});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});