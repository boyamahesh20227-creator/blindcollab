// React Native compatible: YES
import { useReducer, useCallback } from 'react';

const init = {
  screen: 'home',
  roomCode: '',
  playerName: '',
  isHost: false,
  players: [],
  connected: false,
  error: null,
  // round
  phase: 'lobby',
  round: 0,
  maxRounds: 0,
  // role
  role: null,           // 'drawer' | 'guesser'
  sentence: null,       // shown to drawers
  words: [],            // all words in sentence
  totalWords: 0,
  guesserName: null,
  // word select
  claimedWords: {},     // wordIndex -> { playerName, playerColor }
  assignedWordIndex: null,
  assignedWord: null,
  phaseEndTime: null,
  phaseDuration: null,
  // drawing
  drawingProgress: { submitted: 0, total: 0 },
  // guesser watch
  liveCanvases: {},     // wordIndex -> imageBase64
  guesses: [],          // { guess, isCorrect, score }
  // reveal
  revealData: null,     // { revealLayers, sentence, bestGuess, score, ... }
  // scores
  scores: [],
  winner: null,
  finalScores: [],
};

function reducer(state, { type, payload }) {
  switch (type) {
    case 'SET_CONNECTED': return { ...state, connected: payload };
    case 'SET_ERROR':     return { ...state, error: payload };
    case 'CLEAR_ERROR':   return { ...state, error: null };
    case 'JOIN_LOBBY':    return { ...state, ...payload, error: null };
    case 'UPDATE_PLAYERS': return { ...state, players: payload.players, isHost: payload.isHost ?? state.isHost, roomCode: payload.roomCode ?? state.roomCode };
    case 'SET_PHASE':     return { ...state, phase: payload.phase, phaseEndTime: payload.endTime ?? null, phaseDuration: payload.duration ?? null };
    case 'GAME_ASSIGNED': return { ...state, ...payload, liveCanvases: {}, guesses: [], claimedWords: {}, revealData: null };
    case 'WORD_CLAIMED':  return { ...state, claimedWords: payload.claimedWords };
    case 'WORD_ASSIGNED': return { ...state, assignedWord: payload.word, assignedWordIndex: payload.wordIndex, totalWords: payload.totalWords };
    case 'CANVAS_LIVE':   return { ...state, liveCanvases: { ...state.liveCanvases, [payload.wordIndex]: payload.imageBase64 } };
    case 'DRAWING_PROGRESS': return { ...state, drawingProgress: payload };
    case 'ADD_GUESS':     return { ...state, guesses: [...state.guesses, payload] };
    case 'SET_REVEAL':    return { ...state, revealData: payload };
    case 'UPDATE_SCORES': return { ...state, scores: payload.scores, round: payload.round };
    case 'GAME_END':      return { ...state, winner: payload.winner, finalScores: payload.finalScores };
    case 'RESET':         return { ...init, connected: state.connected, playerName: state.playerName };
    default: return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, init);

  const actions = {
    setConnected:      useCallback((v) => dispatch({ type: 'SET_CONNECTED', payload: v }), []),
    setError:          useCallback((m) => dispatch({ type: 'SET_ERROR', payload: m }), []),
    clearError:        useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []),
    joinLobby:         useCallback((d) => dispatch({ type: 'JOIN_LOBBY', payload: d }), []),
    updatePlayers:     useCallback((d) => dispatch({ type: 'UPDATE_PLAYERS', payload: d }), []),
    setPhase:          useCallback((d) => dispatch({ type: 'SET_PHASE', payload: d }), []),
    gameAssigned:      useCallback((d) => dispatch({ type: 'GAME_ASSIGNED', payload: d }), []),
    wordClaimed:       useCallback((d) => dispatch({ type: 'WORD_CLAIMED', payload: d }), []),
    wordAssigned:      useCallback((d) => dispatch({ type: 'WORD_ASSIGNED', payload: d }), []),
    canvasLive:        useCallback((d) => dispatch({ type: 'CANVAS_LIVE', payload: d }), []),
    drawingProgress:   useCallback((d) => dispatch({ type: 'DRAWING_PROGRESS', payload: d }), []),
    addGuess:          useCallback((d) => dispatch({ type: 'ADD_GUESS', payload: d }), []),
    setReveal:         useCallback((d) => dispatch({ type: 'SET_REVEAL', payload: d }), []),
    updateScores:      useCallback((d) => dispatch({ type: 'UPDATE_SCORES', payload: d }), []),
    gameEnd:           useCallback((d) => dispatch({ type: 'GAME_END', payload: d }), []),
    reset:             useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return { state, actions };
}
