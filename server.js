var server = require('http').createServer(),
    io = require('socket.io')(server),
    jwt = require('jsonwebtoken'),
    port = 3000;
var token_key = "YOUR_JWT_SECRET_KEY";
io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, token_key, function (err, decoded) {
            if (err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
            socket.jwtToken = socket.handshake.query.token;
            socket.member_id = socket.decoded.sub;
            next();
        });
    } else {
        next(new Error('Authentication error'));
    }
})
    .on('connection', function (socket) {
        console.log(socket.member_id);

        // Join User Room(Channel)
        socket.join('member_' + socket.member_id);

        /*
        * Listen to events
        */

        // Send new message
        socket.on('sendMessage', function (message) {
            message.from_member_id = socket.member_id;
            // console.log(message);

            // Save Message History code
            // HERE YOU CAN STORE MESSAGES HISTORY WITH YOUR DB

            // Send message to two members
            const channels = ['member_' + message.member_id, 'member_' + message.from_member_id];
            channels.forEach((roomID) => {
                console.log(roomID);
                if (io.sockets.adapter.rooms[roomID].length > 0) {
                    io.sockets.in(roomID).emit('receiveMessage', message)
                }
            });

        });


    });
server.listen(port);
