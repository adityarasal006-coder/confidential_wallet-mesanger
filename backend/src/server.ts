import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import userRoutes from './routes/users';
import messageRoutes from './routes/messages';
import authRoutes from './routes/auth';
import Conversation from './models/Conversation';
import Message from './models/Message';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

import { MongoMemoryServer } from 'mongodb-memory-server';

// DB connection
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log('No MONGODB_URI provided, starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }
    await mongoose.connect(uri);
    console.log(`MongoDB connected to: ${uri}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io JWT Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    (socket as any).userAddress = decoded.address.toLowerCase();
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.io Real-time messaging
io.on('connection', (socket) => {
  const userAddress = (socket as any).userAddress;
  console.log('User connected via JWT:', socket.id, 'Wallet:', userAddress);

  // Automatically join their personal room upon successful connection
  socket.join(userAddress);
  console.log(`Address ${userAddress} joined room`);

  socket.on('sendMessage', async (data) => {
    const { sender, recipient, encryptedPayload, type, txHash } = data;
    const senderLower = sender.toLowerCase();
    const recipientLower = recipient.toLowerCase();
    
    // Prevent spoofing sender
    if (senderLower !== userAddress) {
       console.warn(`Spoofing attempt by ${userAddress} claiming to be ${senderLower}`);
       return;
    }

    try {
      // Find or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderLower, recipientLower] }
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderLower, recipientLower]
        });
      }

      // Save message
      const newMessage = await Message.create({
        conversationId: conversation._id,
        sender: senderLower,
        recipient: recipientLower,
        encryptedPayload,
        type: type || 'TEXT',
        txHash
      });

      conversation.lastMessageAt = newMessage.timestamp;
      await conversation.save();

      // Emit to recipient
      io.to(recipientLower).emit('newMessage', newMessage);
      // Emit to sender (so other tabs sync)
      io.to(senderLower).emit('newMessage', newMessage);

    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
