const io = require('./connection');
const auth = require('./middleware');

const login = io.of('/login');

login.use(auth);

login.on('connection', socket => {
    console.log('LOGIN connection ON');

    socket.emit('code', 'YOU DID IT!!');

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
