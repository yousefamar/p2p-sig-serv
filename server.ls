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
    return unless data.rid
    socket.join data.rid
    socket.broadcast.to data.rid .emit \join socket.id

  socket.on \part       !-> socket.broadcast.emit \part socket.id

  socket.on \disconnect !-> socket.broadcast.emit \part socket.id

server.listen 9980
