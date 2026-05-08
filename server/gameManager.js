const { getSentence } = require('./sentenceBank');

const MAX_PLAYERS = 8;
const WORD_SELECT_MS = 30000;
const DRAWING_MS = 90000;

const PLAYER_COLORS = [
  '#c4b5fd', '#f472b6', '#60a5fa', '#4ade80',
  '#fbbf24', '#f87171', '#34d399', '#a78bfa',
];

// ── Fuzzy sentence matching ──────────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (j === 0 ? i : 0))
  );
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const STOP = new Set([
  'is', 'in', 'the', 'a', 'an', 'on', 'at', 'to', 'of', 'and', 'or', 'with',
  'are', 'was', 'be', 'by', 'as', 'that', 'this', 'it', 'its', 'for', 'from',
  'not', 'also', 'into', 'he', 'she', 'they', 'we', 'you', 'i', 'its',
]);

function matchSentence(guess, sentence) {
  if (!guess || !sentence) return { isCorrect: false, score: 0 };

  const norm = (s) => s.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const guessNorm = norm(guess);
  const sentNorm = norm(sentence);

  if (guessNorm === sentNorm) return { isCorrect: true, score: 1.0 };

  const keyWords = sentNorm.split(' ').filter((w) => !STOP.has(w) && w.length > 1);
  const guessWords = guessNorm.split(' ');

  if (keyWords.length === 0) return { isCorrect: false, score: 0 };

  let matched = 0;
  keyWords.forEach((kw) => {
    const found = guessWords.some((gw) => {
      if (gw === kw) return true;
      if (gw.includes(kw) || kw.includes(gw)) return true;
      return levenshtein(kw, gw) <= Math.floor(kw.length / 3) + 1;
    });
    if (found) matched++;
  });

  const score = matched / keyWords.length;
  return { isCorrect: score >= 0.8, score: Math.round(score * 100) / 100 };
}

// ── GameManager ──────────────────────────────────────────────────────────────

class GameManager {
  constructor() {
    this.rooms = new Map();
  }

  _generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  _uniqueCode() {
    let code;
    do { code = this._generateCode(); } while (this.rooms.has(code));
    return code;
  }

  createRoom(socketId, playerName) {
    const code = this._uniqueCode();
    const room = {
      code,
      host: socketId,
      phase: 'lobby',
      round: 0,
      maxRounds: null,
      players: [{
        id: socketId, name: playerName,
        color: PLAYER_COLORS[0], ready: false, score: 0, role: null,
        assignedWordIndex: null, submitted: false,
      }],
      sentence: null,
      words: [],
      claimedWords: {},
      claimedByPlayer: {},
      drawings: {},
      liveCanvases: {},
      guesses: [],
      bestGuess: null,
      bestGuessScore: 0,
      phaseTimer: null,
    };
    this.rooms.set(code, room);
    return { code, room };
  }

  joinRoom(socketId, roomCode, playerName) {
    const room = this.rooms.get(roomCode);
    if (!room) return { error: 'Room not found' };
    if (room.phase !== 'lobby') return { error: 'Game already in progress' };
    if (room.players.length >= MAX_PLAYERS) return { error: 'Room is full (max 8)' };
    if (room.players.find((p) => p.name === playerName)) return { error: 'Name already taken' };

    room.players.push({
      id: socketId, name: playerName,
      color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
      ready: false, score: 0, role: null,
      assignedWordIndex: null, submitted: false,
    });
    return { room };
  }

  toggleReady(roomCode, socketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    const p = room.players.find((p) => p.id === socketId);
    if (p) p.ready = !p.ready;
    return room;
  }

  canStart(roomCode) {
    const room = this.rooms.get(roomCode);
    return room ? room.players.length >= 2 : false;
  }

  startGame(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    room.maxRounds = room.players.length;
    this._startNewRound(room, io);
  }

  _startNewRound(room, io) {
    room.round += 1;
    const guesserIdx = (room.round - 1) % room.players.length;

    // Reset round state
    room.claimedWords = {};
    room.claimedByPlayer = {};
    room.drawings = {};
    room.liveCanvases = {};
    room.guesses = [];
    room.bestGuess = null;
    room.bestGuessScore = 0;

    const guesser = room.players[guesserIdx];
    const drawers = room.players.filter((_, i) => i !== guesserIdx);
    const drawerCount = drawers.length;

    // Pick sentence: 2-player → 2 words (single drawer draws full phrase)
    let words;
    if (drawerCount === 1) {
      room.sentence = getSentence(2);
      words = [room.sentence]; // single slot, drawer draws the full phrase
    } else {
      room.sentence = getSentence(Math.min(drawerCount, 7));
      words = room.sentence.split(' ').slice(0, drawerCount);
      // Pad if sentence shorter than drawer count (shouldn't happen with our bank)
      while (words.length < drawerCount) words.push(words[words.length - 1]);
    }
    room.words = words;

    room.players.forEach((p, i) => {
      p.role = i === guesserIdx ? 'guesser' : 'drawer';
      p.assignedWordIndex = null;
      p.submitted = false;
      p.ready = false;
    });

    // Announce roles
    io.to(room.code).emit('game:phaseChange', { phase: 'roleReveal' });

    room.players.forEach((p) => {
      const sock = io.sockets.sockets.get(p.id);
      if (!sock) return;
      if (p.role === 'guesser') {
        sock.emit('game:assigned', {
          role: 'guesser',
          guesserName: guesser.name,
          totalWords: words.length,
          round: room.round,
          maxRounds: room.maxRounds,
        });
      } else {
        sock.emit('game:assigned', {
          role: 'drawer',
          sentence: room.sentence,
          words: room.words,
          guesserName: guesser.name,
          totalWords: words.length,
          round: room.round,
          maxRounds: room.maxRounds,
        });
      }
    });

    // 2-player: skip word-select, go straight to drawing
    if (drawerCount === 1) {
      drawers[0].assignedWordIndex = 0;
      setTimeout(() => this._startDrawingPhase(room, io), 3000);
    } else {
      setTimeout(() => this._startWordSelectPhase(room, io), 3000);
    }
  }

  _startWordSelectPhase(room, io) {
    room.phase = 'wordSelect';
    const endTime = Date.now() + WORD_SELECT_MS;
    io.to(room.code).emit('game:phaseChange', {
      phase: 'wordSelect',
      duration: WORD_SELECT_MS,
      endTime,
      claimedWords: {},
    });

    room.phaseTimer = setTimeout(() => {
      this._autoAssignWords(room, io);
      this._startDrawingPhase(room, io);
    }, WORD_SELECT_MS);
  }

  _autoAssignWords(room, io) {
    const drawers = room.players.filter((p) => p.role === 'drawer');
    const allIndices = room.words.map((_, i) => i);
    const taken = new Set(Object.keys(room.claimedWords).map(Number));
    let free = allIndices.filter((i) => !taken.has(i));

    drawers
      .filter((p) => room.claimedByPlayer[p.id] === undefined)
      .forEach((p) => {
        if (free.length === 0) return;
        const idx = free.shift();
        room.claimedWords[idx] = p.id;
        room.claimedByPlayer[p.id] = idx;
        p.assignedWordIndex = idx;
        io.sockets.sockets.get(p.id)?.emit('word:autoAssigned', { wordIndex: idx, word: room.words[idx] });
      });
  }

  claimWord(roomCode, socketId, wordIndex, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'wordSelect') return;
    if (room.claimedWords[wordIndex] !== undefined) {
      io.sockets.sockets.get(socketId)?.emit('error', { message: 'Word already taken — pick another!' });
      return;
    }
    if (room.claimedByPlayer[socketId] !== undefined) {
      io.sockets.sockets.get(socketId)?.emit('error', { message: 'You already have a word' });
      return;
    }
    const player = room.players.find((p) => p.id === socketId);
    if (!player || player.role !== 'drawer') return;

    room.claimedWords[wordIndex] = socketId;
    room.claimedByPlayer[socketId] = wordIndex;
    player.assignedWordIndex = wordIndex;

    io.to(roomCode).emit('word:claimed', {
      wordIndex,
      playerName: player.name,
      playerColor: player.color,
      claimedWords: Object.fromEntries(
        Object.entries(room.claimedWords).map(([i, id]) => [
          i,
          { playerName: room.players.find((p) => p.id === id)?.name, playerColor: room.players.find((p) => p.id === id)?.color },
        ])
      ),
    });

    // All drawers claimed → start drawing immediately
    const drawers = room.players.filter((p) => p.role === 'drawer');
    if (Object.keys(room.claimedWords).length === drawers.length) {
      clearTimeout(room.phaseTimer);
      this._startDrawingPhase(room, io);
    }
  }

  _startDrawingPhase(room, io) {
    room.phase = 'drawing';
    const endTime = Date.now() + DRAWING_MS;

    // Tell each drawer their word
    room.players
      .filter((p) => p.role === 'drawer')
      .forEach((p) => {
        const wi = p.assignedWordIndex ?? 0;
        io.sockets.sockets.get(p.id)?.emit('drawing:wordAssigned', {
          word: room.words[wi],
          wordIndex: wi,
          totalWords: room.words.length,
        });
      });

    io.to(room.code).emit('game:phaseChange', {
      phase: 'drawing',
      duration: DRAWING_MS,
      endTime,
      totalWords: room.words.length,
    });

    room.phaseTimer = setTimeout(() => this._startRevealPhase(room, io), DRAWING_MS);
  }

  updateCanvas(roomCode, socketId, imageBase64, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'drawing') return;
    const player = room.players.find((p) => p.id === socketId);
    if (!player) return;
    const wi = player.assignedWordIndex ?? 0;
    room.liveCanvases[wi] = imageBase64;

    // Only send to the guesser
    const guesserIdx = (room.round - 1) % room.players.length;
    const guesser = room.players[guesserIdx];
    io.sockets.sockets.get(guesser.id)?.emit('canvas:live', {
      wordIndex: wi,
      imageBase64,
    });
  }

  submitDrawing(roomCode, socketId, imageBase64, io) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'drawing') return;
    const player = room.players.find((p) => p.id === socketId);
    if (!player || player.role !== 'drawer' || player.submitted) return;

    player.submitted = true;
    const wi = player.assignedWordIndex ?? 0;
    room.drawings[wi] = { playerName: player.name, imageBase64 };
    room.liveCanvases[wi] = imageBase64;

    // Relay final to guesser
    const guesserIdx = (room.round - 1) % room.players.length;
    io.sockets.sockets.get(room.players[guesserIdx].id)?.emit('canvas:live', {
      wordIndex: wi,
      imageBase64,
      submitted: true,
    });

    io.to(roomCode).emit('drawing:progress', {
      submitted: room.players.filter((p) => p.role === 'drawer' && p.submitted).length,
      total: room.players.filter((p) => p.role === 'drawer').length,
    });

    const allDone = room.players.filter((p) => p.role === 'drawer').every((p) => p.submitted);
    if (allDone) {
      clearTimeout(room.phaseTimer);
      this._startRevealPhase(room, io);
    }
  }

  submitGuess(roomCode, socketId, guess, io) {
    const room = this.rooms.get(roomCode);
    if (!room || (room.phase !== 'drawing' && room.phase !== 'reveal')) return;
    const player = room.players.find((p) => p.id === socketId);
    if (!player || player.role !== 'guesser') return;

    const { isCorrect, score } = matchSentence(guess, room.sentence);

    if (score > room.bestGuessScore) {
      room.bestGuessScore = score;
      room.bestGuess = guess;
    }
    room.guesses.push({ guess, isCorrect, score, ts: Date.now() });

    io.to(roomCode).emit('sentence:guessed', { guess, isCorrect, score });

    if (isCorrect && room.phase === 'drawing') {
      clearTimeout(room.phaseTimer);
      this._startRevealPhase(room, io);
    }
  }

  _startRevealPhase(room, io) {
    if (room.phase === 'reveal') return;
    room.phase = 'reveal';

    const guesserIdx = (room.round - 1) % room.players.length;
    const guesser = room.players[guesserIdx];
    const drawers = room.players.filter((p) => p.role === 'drawer');

    const { score } = matchSentence(room.bestGuess || '', room.sentence);
    let guesserPts = 0, drawerPts = 0;
    if (score >= 1.0)       { guesserPts = 20; drawerPts = 5; }
    else if (score >= 0.8)  { guesserPts = 15; drawerPts = 4; }
    else if (score >= 0.6)  { guesserPts = 10; drawerPts = 2; }
    else if (score >= 0.4)  { guesserPts = 5;  drawerPts = 1; }

    guesser.score += guesserPts;
    drawers.forEach((p) => { p.score += drawerPts; });

    const revealLayers = room.words.map((word, i) => ({
      wordIndex: i,
      word,
      playerName: room.drawings[i]?.playerName || '(no drawing)',
      imageBase64: room.drawings[i]?.imageBase64 || null,
    }));

    io.to(room.code).emit('game:reveal', {
      revealLayers,
      sentence: room.sentence,
      bestGuess: room.bestGuess,
      score,
      guesserName: guesser.name,
      guesserPts,
      drawerPts,
    });
    io.to(room.code).emit('game:phaseChange', { phase: 'reveal' });

    setTimeout(() => this._showScores(room, io), 8000);
  }

  _showScores(room, io) {
    room.phase = 'scores';
    const scores = room.players.map((p) => ({ name: p.name, score: p.score, color: p.color }));
    io.to(room.code).emit('score:update', { scores, round: room.round, maxRounds: room.maxRounds });
    io.to(room.code).emit('game:phaseChange', { phase: 'scores' });
    if (room.round >= room.maxRounds) setTimeout(() => this._endGame(room, io), 4000);
  }

  startNextRound(roomCode, io) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    if (room.round >= room.maxRounds) { this._endGame(room, io); return; }
    this._startNewRound(room, io);
  }

  _endGame(room, io) {
    room.phase = 'ended';
    const finalScores = room.players
      .map((p) => ({ name: p.name, score: p.score, color: p.color }))
      .sort((a, b) => b.score - a.score);
    io.to(room.code).emit('game:end', { winner: finalScores[0], finalScores });
    io.to(room.code).emit('game:phaseChange', { phase: 'ended' });
    setTimeout(() => this.rooms.delete(room.code), 600000);
  }

  removePlayer(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const idx = room.players.findIndex((p) => p.id === socketId);
      if (idx === -1) continue;
      const player = room.players[idx];
      room.players.splice(idx, 1);
      if (room.players.length === 0) {
        clearTimeout(room.phaseTimer);
        this.rooms.delete(code);
        return { code, playerName: player.name, room: null };
      }
      if (room.host === socketId) room.host = room.players[0].id;
      return { code, playerName: player.name, room };
    }
    return null;
  }

  getRoom(roomCode) { return this.rooms.get(roomCode); }

  getPublicPlayers(room) {
    return room.players.map((p) => ({
      name: p.name, color: p.color, ready: p.ready,
      score: p.score, isHost: p.id === room.host,
    }));
  }
}

module.exports = new GameManager();
