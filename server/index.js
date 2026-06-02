import express from 'express';
import dotenv from 'dotenv/config';
import mongoDBConnect from './mongoDB/connection.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import messageRoutes from './routes/message.js';
import * as Server from 'socket.io';
import userModel from './models/userModel.js';

const app = express();
const corsConfig = {
  origin: process.env.BASE_URL,
  credentials: true,
};
const PORT=process.env.PORT || 8000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsConfig));
app.use('/', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
mongoose.set('strictQuery', false);
mongoDBConnect();
const server = app.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});
const io = new Server.Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.BASE_URL || '*',
  },
});
app.set('socketio', io);
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('setup', async (userData) => {
    socket.join(userData.id);
    socket.emit('connected');
    
    // Track online status
    onlineUsers.set(socket.id, userData.id);
    await userModel.findByIdAndUpdate(userData.id, { isOnline: true });
    socket.broadcast.emit('user online', userData.id);
  });
  
  socket.on('join room', (room) => {
    socket.join(room);
  });
  
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieve) => {
    var chat = newMessageRecieve.chatId;
    if (!chat.users) console.log('chats.users is not defined');
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieve.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessageRecieve);
    });
  });

  socket.on('disconnect', async () => {
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      await userModel.findByIdAndUpdate(userId, { isOnline: false, lastSeen: Date.now() });
      socket.broadcast.emit('user offline', userId);
      onlineUsers.delete(socket.id);
    }
  });
});
