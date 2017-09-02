const http   = require('http');
const server = http.createServer();
const io     = require('socket.io')(server);

io.on('connection', socket => {

	socket.emit('uid', socket.id);

	// Unicast SDP
	socket.on('sdp', data => {
		if (data.to == null)
			return;

		data.from = socket.id;
		socket.broadcast.to(data.to).emit('sdp', data);
	});

	// Unicast ICE
	socket.on('ice', data => {
		if (data.to == null)
			return;

		data.from = socket.id;
		socket.broadcast.to(data.to).emit('ice', data);
	});

	// Join room
	socket.on('join', data => {
		if (data.rid == null)
			return;

		socket.join(data.rid);
		data.uid = socket.id;
		socket.broadcast.to(data.rid).emit('join', data);
	});

	// Unicast hail
	socket.on('hail', data => {
		if (data.to == null || data.rid == null)
			return;

		data.from = socket.id;
		socket.broadcast.to(data.to).emit('hail', data);
	});

	// Broadcast leave
	socket.on('leave', data => {
		if (data.rid == null)
			return;

		socket.leave(data.rid);
		data.uid = socket.id;
		socket.broadcast.emit('leave', data);
	});

	// Broadcast disconnect
	socket.on('disconnect', () => {
		socket.broadcast.emit('leave', {
			uid: socket.id
		});
	});

});

server.listen(process.env.PORT || 8081);
