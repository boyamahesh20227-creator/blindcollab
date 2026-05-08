// React Native compatible: YES
import { useReducer, useCallback } from 'react';

const initialState = {
  screen: 'home',
  roomCode: '',
  playerName: '',
  isHost: false,
  players: [],
  phase: 'lobby',
  role: null,
  word: null,
  round: 0,
  maxRounds: 5,
  countdown: 5,
  phaseEndTime: null,
  phaseDuration: null,
  layers: [],
  guesses: [],
  correctGuess: null,
  scores: [],
  voteResults: null,
  winner: null,
  finalScores: [],
  error: null,
  connected: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'JOIN_LOBBY':
      return {
        ...state,
        screen: 'lobby',
        roomCode: action.payload.roomCode,
        playerName: action.payload.playerName,
        isHost: action.payload.isHost ?? state.isHost,
        error: null,
      };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        players: action.payload.players,
        isHost: action.payload.isHost ?? state.isHost,
        roomCode: action.payload.roomCode ?? state.roomCode,
      };
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload.role,
        word: action.payload.word,
        round: action.payload.round,
        maxRounds: action.payload.maxRounds,
        countdown: action.payload.countdown,
      };
    case 'SET_COUNTDOWN':
      return { ...state, countdown: action.payload };
    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload.phase,
        phaseEndTime: action.payload.endTime ?? null,
        phaseDuration: action.payload.duration ?? null,
        ...(action.payload.phase === 'reveal' ? { layers: [], guesses: [], correctGuess: null } : {}),
        ...(action.payload.phase === 'voting' ? { votePlayers: action.payload.players } : {}),
      };
    case 'ADD_LAYER':
      return { ...state, layers: [...state.layers, action.payload] };
    case 'ADD_GUESS':
      return { ...state, guesses: [...state.guesses, action.payload] };
    case 'SET_CORRECT_GUESS':
      return { ...state, correctGuess: action.payload };
    case 'SET_VOTE_RESULTS':
      return { ...state, voteResults: action.payload };
    case 'UPDATE_SCORES':
      return { ...state, scores: action.payload.scores, round: action.payload.round };
    case 'GAME_END':
      return { ...state, winner: action.payload.winner, finalScores: action.payload.finalScores };
    case 'RESET':
      return { ...initialState, connected: state.connected, playerName: state.playerName };
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setConnected: useCallback((v) => dispatch({ type: 'SET_CONNECTED', payload: v }), []),
    setError: useCallback((msg) => dispatch({ type: 'SET_ERROR', payload: msg }), []),
    clearError: useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []),
    setScreen: useCallback((s) => dispatch({ type: 'SET_SCREEN', payload: s }), []),
    joinLobby: useCallback((data) => dispatch({ type: 'JOIN_LOBBY', payload: data }), []),
    updatePlayers: useCallback((data) => dispatch({ type: 'UPDATE_PLAYERS', payload: data }), []),
    setRole: useCallback((data) => dispatch({ type: 'SET_ROLE', payload: data }), []),
    setCountdown: useCallback((n) => dispatch({ type: 'SET_COUNTDOWN', payload: n }), []),
    setPhase: useCallback((data) => dispatch({ type: 'SET_PHASE', payload: data }), []),
    addLayer: useCallback((layer) => dispatch({ type: 'ADD_LAYER', payload: layer }), []),
    addGuess: useCallback((guess) => dispatch({ type: 'ADD_GUESS', payload: guess }), []),
    setCorrectGuess: useCallback((data) => dispatch({ type: 'SET_CORRECT_GUESS', payload: data }), []),
    setVoteResults: useCallback((data) => dispatch({ type: 'SET_VOTE_RESULTS', payload: data }), []),
    updateScores: useCallback((data) => dispatch({ type: 'UPDATE_SCORES', payload: data }), []),
    gameEnd: useCallback((data) => dispatch({ type: 'GAME_END', payload: data }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };

  return { state, actions };
}
