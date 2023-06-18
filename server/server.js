const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: { origin: "https://cleanchat.netlify.app/", credentials: true },
    //pingInterval: 30000,
    //pingTimeout: 120000,
});
//guests object to monitor user connections for cases when the user disconnects and the disconnection event
//arrives after the user's socket has re-connected and avoid sending disconnection message
//object is outside io connection since for each connection there is a new instance and if the
//object was inside it will only be able to be used inside the unique connection instance
//every time a client socket connects to the server via port being listened, io creates an individual
//socket connection for that socket, although a room is 'shared' among instances so when a room
//is created in one instance, if a different socket on another connection instance connects to the
//room with same name it will be connecting to the same unique room  
const guests = {};
io.on('connection', (socket) => {
    console.log(`user: ${socket.id} connected to MAIN`);
    socket.on('room', room => {
        //check if room exists in main socket's adapter object, create it if not
        if (!io.sockets.adapter.rooms.has(room.name)) {
            socket.join(room.name);
            socket.emit('room', `room created: ${room.name}`);
            //create roomData var and stored a ref to the created room
            const roomData = io.sockets.adapter.rooms.get(room.name);
            //store created room deatails in the data property of the room
            roomData.data = room;
        } else {//if room already exists check room code
            const roomData = io.sockets.adapter.rooms.get(room.name);
            if (room.code === roomData.data.code) {
                socket.join(room.name);
                io.to(room.name).emit('message', { msg: ' IS IN THE ROOM 👋', user: room.user });

            } else {
                socket.emit('room', 'ROOM TAKEN');
                socket.emit('message', { msg: 'INCORRECT ROOM CODE : Reload page and try again', user: room.user });
                socket.disconnect();
            }
        }
        socket.emit('joined', 'joined room');
        //create object for each room name containing all user objects with counter number 
        //nullish coalescing operator (??) is used to provide default values ({} and 0) in case the nested properties are null or undefined
        guests[room.name] = guests[room.name] ?? {};
        guests[room.name][room.user] = (guests[room.name][room.user] ?? 0) + 1;
        socket.emit('playersInRoom', Object.keys(guests[room.name]).length);
        //guests[room.user] = (guests[room.user] || 0) + 1;
        // socket.join(room.name);
        // socket.emit('joined', 'joined room');
        socket.on('message', (data) => {
            console.log(`user: ${socket.id} sent a message`);
            io.to(room.name).emit('message', { msg: data, user: room.user });
        });
        socket.on('playerMove', move => {
            if (Object.keys(guests[room.name]).length > 1) {
                io.to(room.name).emit('playerMove', move);
                playerTurn = socket.id;
            }
        });
        socket.on('colChange', col => {
            if (Object.keys(guests[room.name]).length > 1) {
                io.to(room.name).emit('colChange', col);
            }
        });
        socket.on('winLineChange', winLine => {
            if (Object.keys(guests[room.name]).length > 1) {
                io.to(room.name).emit('winLineChange', winLine);
            }
        });
        socket.on('disconnecting', () => {
            //if user disconnection is one of the first two (who can play)then reset game
            if (Object.keys(guests[room.name]).indexOf(room.user) < 2) io.to(room.name).emit('colChange', 3);
            //this avoids sending delayed disconnected message after the user has re-joined
            if (guests[room.name][room.user] === 1) {
                io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
                delete guests[room.name][room.user];
            } else {
                guests[room.name][room.user] -= 1;
            }
            console.log(`User: ${socket.id} disconnected from MAIN.`);
            console.log('Room Guests: ', guests);
        });
    });
    // socket.on('disconnecting', () => {
    //     //very usefull so it listens to the socket when it starts to disconnect but hasnt fully disconnected yet so it gives time to run some logic before socket.on('disconnect') happens
    //     //'disconnecting' event may be usefull to check when a client loses internet connection and gets removed from a room but the socket connection is not fully disconnected
    //     if ([...socket.rooms][1]) {//this is the second argument of a javascript set
    //         //returns by the socket.rooms method, where the second element is the room
    //         //the socket belongs to...not sure if it was joined to several rooms
    //         console.log('socket was in room: ', [...socket.rooms][1]);
    //     } else {
    //         console.log('socket did not join any room');
    //     }
    // });
    socket.on('disconnect', () => {//this listens for disconnection event from a socket that has not joind a room
        console.log(`user: ${socket.id} DISCONNECTED`);
    });
});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});