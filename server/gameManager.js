const { getRandomWord } = require('./wordBank');

const ROLES = ['BACKGROUND', 'CHARACTER', 'OBJECT', 'DETAIL', 'ATMOSPHERE'];
const MAX_PLAYERS = 8;
const MAX_ROUNDS = 5;
const DRAWING_DURATION_MS = 60000;
const GUESSING_DURATION_MS = 30000;
const REVEAL_LAYER_DELAY_MS = 900;
const COUNTDOWN_SECONDS = 5;

const PLAYER_COLORS = [
  '#c4b5fd', '#f472b6', '#60a5fa', '#4ade80',
  '#fbbf24', '#f87171', '#34d399', '#a78bfa',
];

const POINTS = {
  CORRECT_GUESS: 15,
  FIRST_CORRECT_BONUS: 5,
  MOST_HELPFUL_VOTE: 10,
  MOST_CHAOTIC_VOTE: 5,
  WORD_NOT_GUESSED: -3,
};

class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  _getUniqueCode() {
    let code;
    do {
      code = this._generateCode();
    } while (this.rooms.has(code));
    return code;
  }

  _colorForIndex(index) {
    return PLAYER_COLORS[index % PLAYER_COLORS.length];
  }

  _assignRoles(playerCount) {
    const roles = [];
    for (let i = 0; i < playerCount; i++) {
      roles.push(ROLES[i % ROLES.length]);
    }
    // Shuffle
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }
    return roles;
  }

  createRoom(socketId, playerName) {
    const code = this._getUniqueCode();
    const room = {
      code,
      host: socketId,
      phase: 'lobby',
      round: 0,
      word: null,
      players: [
        {
          id: socketId,
          name: playerName,
          color: this._colorForIndex(0),
          ready: false,
          score: 0,
          role: null,
        },
      ],
      drawings: {},
      guesses: [],
      correctGuessers: [],
      votes: {},
      phaseTimer: null,
      revealTimers: [],
    };
    this.rooms.set(code, room);
    return { code, room };
  }

  joinRoom(socketId, roomCode, playerName) {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };
    if (room.phase !== 'lobby') return { error: 'Game already in progress' };
    if (room.players.length >= MAX_PLAYERS) return { error: 'Room is full (max 8 players)' };
    if (room.players.find((p) => p.name === playerName)) {
      return { error: 'Name already taken in this room' };
    }

    const player = {
      id: socketId,
      name: playerName,
      color: this._colorForIndex(room.players.length),
      ready: false,
      score: 0,
      role: null,
    };
    room.players.push(player);
    return { room };
  }

  toggleReady(roomCode, socketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const player = room.players.find((p) => p.id === socketId);
    if (player) player.ready = !player.ready;
    return room;
  }

  canStart(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    return room.players.length >= 2;
  }

  startGame(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    this._startNewRound(room, io);
  }

  _startNewRound(room, io) {
    room.round += 1;
    room.word = getRandomWord();
    room.drawings = {};
    room.guesses = [];
    room.correctGuessers = [];
    room.votes = {};

    const roles = this._assignRoles(room.players.length);
    room.players.forEach((p, i) => {
      p.role = roles[i];
      p.ready = false;
    });

    room.phase = 'countdown';

    let count = COUNTDOWN_SECONDS;
    io.to(room.code).emit('game:phaseChange', { phase: 'countdown' });

    room.players.forEach((p) => {
      const socket = io.sockets.sockets.get(p.id);
      if (socket) {
        socket.emit('game:role', {
          role: p.role,
          word: room.word,
          countdown: COUNTDOWN_SECONDS,
          round: room.round,
          maxRounds: MAX_ROUNDS,
        });
      }
    });

    const tick = setInterval(() => {
      count -= 1;
      io.to(room.code).emit('countdown:tick', { count });
      if (count <= 0) {
        clearInterval(tick);
        this._startDrawingPhase(room, io);
      }
    }, 1000);
  }

  _startDrawingPhase(room, io) {
    room.phase = 'drawing';
    const endTime = Date.now() + DRAWING_DURATION_MS;

    io.to(room.code).emit('game:phaseChange', {
      phase: 'drawing',
      duration: DRAWING_DURATION_MS,
      endTime,
    });

    room.phaseTimer = setTimeout(() => {
      this._startRevealPhase(room, io);
    }, DRAWING_DURATION_MS);
  }

  submitDrawing(roomCode, socketId, imageBase64, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'drawing') return;

    const player = room.players.find((p) => p.id === socketId);
    if (!player) return;

    room.drawings[socketId] = { playerName: player.name, role: player.role, imageBase64 };

    if (Object.keys(room.drawings).length === room.players.length) {
      clearTimeout(room.phaseTimer);
      this._startRevealPhase(room, io);
    }
  }

  _startRevealPhase(room, io) {
    if (room.phase === 'reveal') return;
    room.phase = 'reveal';
    io.to(room.code).emit('game:phaseChange', { phase: 'reveal' });

    const roleOrder = ['BACKGROUND', 'CHARACTER', 'OBJECT', 'DETAIL', 'ATMOSPHERE'];

    const layers = room.players
      .slice()
      .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
      .map((p) => ({
        playerName: p.name,
        role: p.role,
        imageBase64: room.drawings[p.id]?.imageBase64 || null,
      }));

    layers.forEach((layer, index) => {
      const timer = setTimeout(() => {
        io.to(room.code).emit('reveal:layer', layer);
      }, index * REVEAL_LAYER_DELAY_MS);
      room.revealTimers.push(timer);
    });

    const totalRevealTime = layers.length * REVEAL_LAYER_DELAY_MS + 3000;
    const finalTimer = setTimeout(() => {
      this._startGuessingPhase(room, io);
    }, totalRevealTime);
    room.revealTimers.push(finalTimer);
  }

  _startGuessingPhase(room, io) {
    room.phase = 'guessing';
    const endTime = Date.now() + GUESSING_DURATION_MS;

    io.to(room.code).emit('game:phaseChange', {
      phase: 'guessing',
      duration: GUESSING_DURATION_MS,
      endTime,
    });

    room.phaseTimer = setTimeout(() => {
      this._endGuessing(room, io);
    }, GUESSING_DURATION_MS);
  }

  submitGuess(roomCode, socketId, guess, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'guessing') return;

    const player = room.players.find((p) => p.id === socketId);
    if (!player) return;
    if (room.correctGuessers.includes(socketId)) return;

    const guessClean = guess.trim().toLowerCase();
    room.guesses.push({ playerName: player.name, guess });
    io.to(room.code).emit('guess:incoming', { guess, playerName: player.name });

    const wordClean = room.word.toLowerCase();
    if (guessClean === wordClean || wordClean.includes(guessClean) || guessClean.includes(wordClean)) {
      room.correctGuessers.push(socketId);
      const isFirst = room.correctGuessers.length === 1;
      const points = POINTS.CORRECT_GUESS + (isFirst ? POINTS.FIRST_CORRECT_BONUS : 0);
      player.score += points;

      io.to(room.code).emit('guess:correct', {
        playerName: player.name,
        word: room.word,
        isFirst,
        points,
      });

      if (room.correctGuessers.length === room.players.length) {
        clearTimeout(room.phaseTimer);
        this._startVotingPhase(room, io);
      }
    }
  }

  _endGuessing(room, io) {
    if (room.correctGuessers.length === 0) {
      room.players.forEach((p) => {
        p.score += POINTS.WORD_NOT_GUESSED;
      });
      io.to(room.code).emit('guess:timeUp', { word: room.word });
    }
    this._startVotingPhase(room, io);
  }

  _startVotingPhase(room, io) {
    if (room.phase === 'voting') return;
    room.phase = 'voting';
    io.to(room.code).emit('game:phaseChange', {
      phase: 'voting',
      players: room.players.map((p) => ({ name: p.name, role: p.role })),
    });
  }

  submitVote(roomCode, socketId, helpfulPlayer, chaoticPlayer) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'voting') return null;

    room.votes[socketId] = { helpfulPlayer, chaoticPlayer };

    if (Object.keys(room.votes).length === room.players.length) {
      return this._tallyVotes(room);
    }
    return null;
  }

  _tallyVotes(room) {
    const helpfulCounts = {};
    const chaoticCounts = {};

    Object.values(room.votes).forEach(({ helpfulPlayer, chaoticPlayer }) => {
      helpfulCounts[helpfulPlayer] = (helpfulCounts[helpfulPlayer] || 0) + 1;
      chaoticCounts[chaoticPlayer] = (chaoticCounts[chaoticPlayer] || 0) + 1;
    });

    const helpful = Object.entries(helpfulCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const chaotic = Object.entries(chaoticCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    room.players.forEach((p) => {
      if (p.name === helpful) p.score += POINTS.MOST_HELPFUL_VOTE;
      if (p.name === chaotic) p.score += POINTS.MOST_CHAOTIC_VOTE;
    });

    return { helpful, chaotic };
  }

  advanceAfterVote(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const scores = room.players.map((p) => ({ name: p.name, score: p.score, color: p.color }));
    io.to(room.code).emit('score:update', { scores, round: room.round, maxRounds: MAX_ROUNDS });

    room.phase = 'scores';
    io.to(room.code).emit('game:phaseChange', { phase: 'scores' });

    if (room.round >= MAX_ROUNDS) {
      setTimeout(() => this._endGame(room, io), 4000);
    }
  }

  startNextRound(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    if (room.round >= MAX_ROUNDS) {
      this._endGame(room, io);
      return;
    }
    this._startNewRound(room, io);
  }

  _endGame(room, io) {
    room.phase = 'ended';
    const finalScores = room.players
      .map((p) => ({ name: p.name, score: p.score, color: p.color }))
      .sort((a, b) => b.score - a.score);
    const winner = finalScores[0];

    io.to(room.code).emit('game:end', { winner, finalScores });
    io.to(room.code).emit('game:phaseChange', { phase: 'ended' });

    // Clean up room after 10 minutes
    setTimeout(() => this.rooms.delete(room.code), 600000);
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const index = room.players.findIndex((p) => p.id === socketId);
      if (index === -1) continue;

      const player = room.players[index];
      room.players.splice(index, 1);

      if (room.players.length === 0) {
        clearTimeout(room.phaseTimer);
        room.revealTimers.forEach(clearTimeout);
        this.rooms.delete(code);
        return { code, playerName: player.name, room: null };
      }

      if (room.host === socketId && room.players.length > 0) {
        room.host = room.players[0].id;
      }

      return { code, playerName: player.name, room };
    }
    return null;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  getPublicPlayers(room) {
    return room.players.map((p) => ({
      name: p.name,
      color: p.color,
      ready: p.ready,
      score: p.score,
      isHost: p.id === room.host,
    }));
  }
}

module.exports = new GameManager();
