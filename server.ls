#!/usr/bin/env lsc

require! { http, \socket.io : io }

server = http.create-server!

io = io server

io.on \connection (socket) !->
  socket.emit \uid socket.id

  socket.on \sdp (data) !->
    return unless data.to?
    data.from = socket.id
    socket.broadcast.to(data.to).emit \sdp data

  socket.on \ice (data) !->
    return unless data.to?
    data.from = socket.id
    socket.broadcast.to(data.to).emit \ice data

  socket.on \join (data) !->
    return unless data.rid?
    socket.join data.rid
    data.uid = socket.id
    socket.broadcast.to data.rid .emit \join data

  socket.on \hail (data) !->
    return unless data.to? and data.rid?
    data.from = socket.id
    socket.broadcast.to(data.to).emit \hail data

  socket.on \leave (data) !->
    return unless data.rid?
    socket.leave data.rid
    data.uid = socket.id
    socket.broadcast.emit \leave data

  socket.on \disconnect !-> socket.broadcast.emit \leave uid: socket.id

server.listen 9987
