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
        console.log('room created');
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
            } else {
                socket.emit('room', 'ROOM TAKEN');
            }
        }
        // Listen for disconnection
        socket.on('disconnect', () => {
            io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
            console.log(`User: ${socket.id} disconnected from MAIN.`);
        });

    });

});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});