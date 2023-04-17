const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
app.use(cors());
const server = http.createServer(app);
//const io = new Server(server);

const { PORT = 8000 } = process.env;
server.listen(PORT, () => {
    console.log('listening on *:8000');
});

module.exports = new Server(server,
    //     {
    //     cors: {
    //         origin: true,
    //         allowedHeaders: ['Content-Type', 'Authorization']
    //     }
    // }
);