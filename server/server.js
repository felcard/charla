const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: { origin: "https://powerchat.netlify.app/", credentials: true },
    //pingInterval: 30000,
    //pingTimeout: 120000,
});
const crawler = require('./crawler');
const { isSize, isFullBoard, isMove } = require('./validate');
//guests object to monitor user connections for cases when the user disconnects and the disconnection event
//arrives after the user's socket has re-connected and avoid sending disconnection message.
//guests object is outside io connection since for each connection there is a new instance and if the
//object was inside it will only be able to be used inside the unique connection instance
//every time a client socket connects to the server via port being listened, io creates an individual
//socket connection for that socket, although a room is 'shared' among instances so when a room
//is created in one instance, if a different socket on another connection instance connects to the
//room with same name it will be connecting to the same unique room  
let guests = {};
io.on('connection', (socket) => {
    console.log(`user: ${socket.id} connected to MAIN`);
    socket.on('room', room => {
        //ignore malformed join requests instead of crashing on them
        if (!room || typeof room.name !== 'string' || typeof room.user !== 'string' ||
            !room.name.trim() || !room.user.trim()) return;
        //a socket joins one room only; joining again would register every listener twice
        if (socket.data.room) return;
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
                //stop here: a rejected user must not be counted as a guest or get room listeners
                return;
            }
        }
        socket.data.room = room.name;
        socket.emit('joined', 'joined room');
        //create object for each room name containing all user objects with counter number 
        //nullish coalescing operator (??) is used to provide default values ({} and 0) in case the nested properties are null or undefined
        guests[room.name] = guests[room.name] ?? {};
        guests[room.name][room.user] = (guests[room.name][room.user] ?? 0) + 1;
        io.to(room.name).emit('playersInRoom', Object.keys(guests[room.name]).length);
        //guests[room.user] = (guests[room.user] || 0) + 1;
        // socket.join(room.name);
        // socket.emit('joined', 'joined room');
        socket.on('message', (data) => {
            console.log(`user: ${socket.id} sent a message`);
            io.to(room.name).emit('message', { msg: data, user: room.user });
        });
        socket.on('playerMove', move => {
            if (!isMove(move)) return;
            if (Object.keys(guests[room.name]).length > 1) {
                const { rowInd, colInd, item, id } = move;
                io.to(room.name).emit('playerMove', { rowInd, colInd, item, id });
            }
        });
        socket.on('colChange', col => {
            if (!isSize(col)) return;
            if (Object.keys(guests[room.name]).length > 1) {
                io.to(room.name).emit('colChange', Number(col));
            }
        });
        socket.on('winLineChange', winLine => {
            if (!isSize(winLine)) return;
            if (Object.keys(guests[room.name]).length > 1) {
                io.to(room.name).emit('winLineChange', Number(winLine));
            }
        });
        socket.on('arr2crawl', payload => {
            const { winLine, arr } = payload || {};
            if (!isFullBoard(arr) || !isSize(winLine) || Number(winLine) > arr.length) return;
            try {
                io.to(room.name).emit('arr2crawl', crawler(Number(winLine), arr));
            } catch (err) {
                // never let one bad game take the whole server down
                console.error('Scoring failed:', err);
            }
        });
        socket.on('disconnecting', () => {
            //this avoids sending delayed disconnected message after the user has re-joined
            if (guests[room.name][room.user] === 1) {
                io.to(room.name).emit('message', { msg: 'k@t@n@', user: room.user });
                delete guests[room.name][room.user];
            } else {
                guests[room.name][room.user] -= 1;
            }
            io.to(room.name).emit('playersInRoom', Object.keys(guests[room.name]).length);
            //if user disconnection is one of the first two (who can play)then reset game
            if (Object.keys(guests[room.name]).indexOf(room.user) < 2) io.to(room.name).emit('colChange', 3);
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
        if (io.sockets.sockets.size === 0) guests = {};//io.sockets.sockets return a Map object and method size returns the number of properties
        console.log('Number of clients connected to Main Socket', io.sockets.sockets.size);
    });
});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});