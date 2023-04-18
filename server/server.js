const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "https://beautiful-tarsier-8e762a.netlify.app" } });

///////////////////MONGO/////////////added second
// const mongoose = require('mongoose');
// require('dotenv').config({
//     path: `${__dirname}/mongo.env`
// });
// const mongoPath = process.env.ATLAS_URI;
// mongoose.connect(mongoPath, {
//     useNewUrlParser: true, useUnifiedTopology: true,
// });
// const Code = mongoose.model('code', {
//     id: { type: String, default: "codigo" },
//     session: { type: String },
//     duration: { type: String, default: "1h" }
// });

//if using the following method to retrieve collections where we dont specified schema: const Code = mongoose.model('code', {});
//we then need to use the  method lean() as in: 
//Code.find().then(data => console.log(data[0].id));
//above turns mongoose document into a javascript object. at first sight they look the same but they dont work the same way
////////////////////////


io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for incoming messages
    socket.on('message', (data) => {
        console.log('Message received:', data);
        socket.emit('message', data);
    });

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected from chat namespace.');
    });


});
const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});