const callErrorHandler = require('../utils/callErrorHandler');

let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer);
        return io;
    },
    getIO: () => {
        if(!io) {
            callErrorHandler.synchronous('Socket.io not initialized', 500);
        }
        return io;
    }
};