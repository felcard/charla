const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: { origin: "https://cleanchat.netlify.app/", credentials: true },
    //pingInterval: 30000,
    //pingTimeout: 120000,
});

io.on('connection', (socket) => {
    const guests = {};
    console.log(`user: ${socket.id} connected to MAIN`);
    socket.on('room', room => {
        if (!io.sockets.adapter.rooms.has(room.name)) {
            guests[room.user] = (guests[room.user] || 0) + 1;
            socket.emit('room', `room created: ${room.name}`);
            socket.join(room.name);
            socket.emit('joined', 'joined room');
            const roomData = io.sockets.adapter.rooms.get(room.name);//roomData references the created room
            roomData.data = room;
            socket.on('message', (data) => {
                console.log(`user: ${socket.id} sent a message`);
                io.to(room.name).emit('message', { msg: data, user: room.user });
            });
            socket.on('disconnecting', () => {
                //this avoids sending delayed disconnected message after the user has re-joined
                if (guests[room.user] === 1) {
                    io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
                    delete guests[room.user];
                } else {
                    guests[room.user] -= 1;
                }
                console.log(`User: ${socket.id} disconnected from MAIN.`);
            });
        } else {
            const roomData = io.sockets.adapter.rooms.get(room.name);
            if (room.code === roomData.data.code) {
                guests[room.user] = (guests[room.user] || 0) + 1;
                socket.join(roomData.data.name);
                console.log(`user: ${socket.id} joined room`);
                io.to(room.name).emit('message', { msg: ' IS IN THE ROOM 👋', user: room.user });
                socket.on('message', (data) => {
                    console.log(`user: ${socket.id} sent a message`);
                    io.to(room.name).emit('message', { msg: data, user: room.user });
                });
                socket.on('disconnecting', () => {
                    if (guests[room.user] === 1) {
                        io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
                        delete guests[room.user];
                    } else {
                        guests[room.user] -= 1;
                    }
                    console.log(`User: ${socket.id} disconnected from MAIN.`);
                });
            } else {
                socket.emit('room', 'ROOM TAKEN');
            }
        }
    });
    //this listens for disconnection event from a socket that has not joind a room, whereas the other two inside if or else block will listen those two different socket paths

    // socket.on('disconnecting', () => {
    //     //very usefull so it listens to the socket when it starts to disconnect
    //     //but hasnt fukky disconnected yet so it gives time to run some logic before
    //     //socket.on('disconnect') happens
    //     //'disconnecting' event may be usefull to check when a client loses internet connection and 
    //     //gets removed from a room but the socket connection is not fully disconnected
    //     if ([...socket.rooms][1]) {//this is the second argument of a javascript set
    //         //returns by the socket.rooms method, where the second element is the room
    //         //the socket belongs to...not sure if it was joined to several rooms
    //         console.log('socket was in room: ', [...socket.rooms][1]);
    //     } else {
    //         console.log('socket did not join any room');
    //     }
    // });
    socket.on('disconnect', () => {
        console.log(`user: ${socket.id} DISCONNECTED`);
    });
});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});