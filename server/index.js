require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameManager = require('./gameManager');

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok', rooms: gameManager.rooms.size }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'https://blindcollab.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 5e6, // 5MB for canvas data
});

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on('room:create', ({ playerName }) => {
    if (!playerName?.trim()) return socket.emit('error', { message: 'Name required' });
    const { code, room } = gameManager.createRoom(socket.id, playerName.trim());
    socket.join(code);
    socket.emit('room:created', { roomCode: code });
    socket.emit('room:updated', { players: gameManager.getPublicPlayers(room), isHost: true, roomCode: code });
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    if (!playerName?.trim()) return socket.emit('error', { message: 'Name required' });
    if (!roomCode?.trim()) return socket.emit('error', { message: 'Room code required' });
    const result = gameManager.joinRoom(socket.id, roomCode.toUpperCase().trim(), playerName.trim());
    if (result.error) return socket.emit('error', { message: result.error });
    const room = result.room;
    socket.join(room.code);
    socket.emit('room:joined', { roomCode: room.code });
    io.to(room.code).emit('room:updated', { players: gameManager.getPublicPlayers(room), roomCode: room.code });
    socket.emit('room:updated', { players: gameManager.getPublicPlayers(room), isHost: false, roomCode: room.code });
  });

  socket.on('player:ready', ({ roomCode }) => {
    const room = gameManager.toggleReady(roomCode, socket.id);
    if (!room) return;
    io.to(roomCode).emit('room:updated', { players: gameManager.getPublicPlayers(room), roomCode });
  });

  socket.on('game:start', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) return socket.emit('error', { message: 'Room not found' });
    if (room.host !== socket.id) return socket.emit('error', { message: 'Only host can start' });
    if (!gameManager.canStart(roomCode)) return socket.emit('error', { message: 'Need at least 2 players' });
    gameManager.startGame(roomCode, io);
  });

  // Drawer claims a word from the sentence
  socket.on('word:claim', ({ roomCode, wordIndex }) => {
    gameManager.claimWord(roomCode, socket.id, wordIndex, io);
  });

  // Drawer streams live canvas to guesser (every ~2s)
  socket.on('canvas:update', ({ roomCode, imageBase64 }) => {
    gameManager.updateCanvas(roomCode, socket.id, imageBase64, io);
  });

  // Drawer submits final drawing
  socket.on('drawing:submit', ({ roomCode, imageBase64 }) => {
    gameManager.submitDrawing(roomCode, socket.id, imageBase64, io);
  });

  // Guesser submits a sentence guess
  socket.on('sentence:guess', ({ roomCode, guess }) => {
    if (!guess?.trim()) return;
    gameManager.submitGuess(roomCode, socket.id, guess.trim(), io);
  });

  socket.on('game:nextRound', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (!room || room.host !== socket.id) return;
    gameManager.startNextRound(roomCode, io);
  });

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
    const result = gameManager.removePlayer(socket.id);
    if (!result) return;
    if (result.room) {
      io.to(result.code).emit('player:disconnected', { playerName: result.playerName });
      io.to(result.code).emit('room:updated', { players: gameManager.getPublicPlayers(result.room), roomCode: result.code });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Blind Collab server on port ${PORT} | accepting: ${CLIENT_URL}`);
});
