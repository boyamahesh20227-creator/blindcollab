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
});

io.on('connection', (socket) => {
  console.log(`[connect] ${socket.id}`);

  socket.on('room:create', ({ playerName }) => {
    if (!playerName?.trim()) return socket.emit('error', { message: 'Name required' });
    const { code, room } = gameManager.createRoom(socket.id, playerName.trim());
    socket.join(code);
    socket.emit('room:created', { roomCode: code });
    socket.emit('room:updated', {
      players: gameManager.getPublicPlayers(room),
      isHost: true,
      roomCode: code,
    });
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    if (!playerName?.trim()) return socket.emit('error', { message: 'Name required' });
    if (!roomCode?.trim()) return socket.emit('error', { message: 'Room code required' });

    const result = gameManager.joinRoom(socket.id, roomCode.toUpperCase().trim(), playerName.trim());
    if (result.error) return socket.emit('error', { message: result.error });

    socket.join(roomCode.toUpperCase().trim());
    socket.emit('room:joined', { roomCode: roomCode.toUpperCase().trim() });

    const room = result.room;
    const players = gameManager.getPublicPlayers(room);
    const hostPlayer = room.players.find((p) => p.id === room.host);

    io.to(room.code).emit('room:updated', {
      players,
      roomCode: room.code,
    });

    socket.emit('room:updated', {
      players,
      isHost: false,
      roomCode: room.code,
    });
  });

  socket.on('player:ready', ({ roomCode }) => {
    const room = gameManager.toggleReady(roomCode, socket.id);
    if (!room) return;
    io.to(roomCode).emit('room:updated', {
      players: gameManager.getPublicPlayers(room),
      roomCode,
    });
  });

  socket.on('game:start', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) return socket.emit('error', { message: 'Room not found' });
    if (room.host !== socket.id) return socket.emit('error', { message: 'Only host can start' });
    if (!gameManager.canStart(roomCode)) {
      return socket.emit('error', { message: 'Need at least 2 players' });
    }
    gameManager.startGame(roomCode, io);
  });

  socket.on('drawing:submit', ({ roomCode, imageBase64 }) => {
    gameManager.submitDrawing(roomCode, socket.id, imageBase64, io);
  });

  socket.on('guess:submit', ({ roomCode, guess }) => {
    if (!guess?.trim()) return;
    gameManager.submitGuess(roomCode, socket.id, guess.trim(), io);
  });

  socket.on('vote:submit', ({ roomCode, helpfulPlayer, chaoticPlayer }) => {
    const result = gameManager.submitVote(roomCode, socket.id, helpfulPlayer, chaoticPlayer);
    if (result) {
      io.to(roomCode).emit('vote:results', result);
      setTimeout(() => gameManager.advanceAfterVote(roomCode, io), 2000);
    }
  });

  socket.on('game:nextRound', ({ roomCode }) => {
    const room = gameManager.getRoom(roomCode);
    if (!room) return;
    if (room.host !== socket.id) return;
    gameManager.startNextRound(roomCode, io);
  });

  socket.on('disconnect', () => {
    console.log(`[disconnect] ${socket.id}`);
    const result = gameManager.removePlayer(socket.id);
    if (!result) return;

    if (result.room) {
      io.to(result.code).emit('player:disconnected', { playerName: result.playerName });
      io.to(result.code).emit('room:updated', {
        players: gameManager.getPublicPlayers(result.room),
        roomCode: result.code,
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Blind Collab server running on port ${PORT}`);
  console.log(`Accepting connections from: ${CLIENT_URL}`);
});
