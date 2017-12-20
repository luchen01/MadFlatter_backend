var express = require('express');
var router = express.Router();
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(socket) {
  let currentName = '';
  console.log('connected to sockets');
  io.emit('message', 'here');
  socket.on('join room', (roomName)=>{
    console.log('submitted join room request for: ', roomName);
    currentName = roomName;
    socket.join(roomName);
    io.in(roomName).clients((err, clients)=>{
      console.log(clients);
    });
    io.to(roomName).emit('message', `someone successfully joined ${roomName}!`);
    // socket.on('update', (contentState)=>{
    //   io.to(roomName).emit('update', contentState);
    // });

  });
  socket.on('leave room', (roomName)=>{
    console.log(`leaving ${roomName}`);
    socket.leave(roomName);
  });

  socket.on('update', message => {
    console.log('receieved update request');
    io.to(currentName).emit('update', message);
  });
});

module.exports = router;
