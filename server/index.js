const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); 

const app = express();
app.use(cors()); 
const server = http.createServer(app);
const io =  socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Server is running.');
});

const rooms = {};

io.on('connection', socket => {
    console.log("user connected")
    socket.on('join-room', (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
  
      socket.on('disconnect', () => {
        console.log("user disconnected")
        socket.to(roomId).emit('user-disconnected', userId);
      });
    });
  });
  


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});