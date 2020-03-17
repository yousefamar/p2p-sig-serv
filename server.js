const express = require('express');
const app     = express();
const server  = require('http').Server(app);
const io      = require('socket.io')(server);

app.use('/', express['static']('static'));
app.get('/*', function(req, res){
	res.sendFile('static/index.html', {
		root: './'
	});
});

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

	// Multicast join
	socket.on('join', data => {
		if (data.rid == null)
			return;

		data.uid = socket.id;
		socket.join(data.rid);
		console.log(data.uid, 'joined', data.rid);
		socket.broadcast.to(data.rid).emit('join', data);
	});

	// Multicast message
	socket.on('roomcast', data => {
		if (data.rid == null)
			return;

		data.uid = socket.id;

		console.log(data.uid, 'roomcasted', data);

		socket.broadcast.to(data.rid).emit('roomcast', data);
	});

	// Unicast hail
	socket.on('hail', data => {
		if (data.to == null)
			return;

		data.from = socket.id;

		console.log(data.from, 'hailed', data.to);

		socket.broadcast.to(data.to).emit('hail', data);
	});

	// Multicast leave
	socket.on('leave', data => {
		if (data.rid == null)
			return;

		socket.leave(data.rid);
		data.uid = socket.id;

		console.log(data.uid, 'left', data.rid);

		socket.broadcast.to(data.rid).emit('leave', data);
	});

	// Multicast disconnect
	socket.on('disconnecting', () => {
		Object.keys(socket.rooms).forEach(room => {
			console.log(socket.id, 'left', room);

			socket.broadcast.to(room).emit('leave', {
				uid: socket.id
			});
		});
	});

});

server.listen(process.env.PORT || 8090);
