const Code = require('./mongo');

module.exports = async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Token unavailable'));
    }
    const word = await Code.find();
    if (word[0].id !== token) {
        return next(new Error('Token unavailable'));
    }
    next();
};