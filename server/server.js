const io = require('./connection');
const auth = require('./middleware');
const { loginSpace, mainSpace } = require('./namespaces');

const login = io.of('/login');

login.use(auth);

login.on('connection', loginSpace);

io.on('connection', mainSpace);
