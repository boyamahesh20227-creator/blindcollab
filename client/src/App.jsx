import { useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';

import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import RoleScreen from './screens/RoleScreen';
import DrawingScreen from './screens/DrawingScreen';
import RevealScreen from './screens/RevealScreen';
import GuessScreen from './screens/GuessScreen';
import VoteScreen from './screens/VoteScreen';
import ResultsScreen from './screens/ResultsScreen';

export default function App() {
  const { state, actions } = useGameState();
  const isHostRef = useRef(false);
  // Ref keeps the pending playerName accessible inside socket handler closures
  const pendingPlayerName = useRef('');

  // Extract join code from URL (e.g. /join/ABC123)
  const urlJoinCode = (() => {
    const m = window.location.pathname.match(/^\/join\/([A-Z0-9]{4,8})$/i);
    return m ? m[1].toUpperCase() : '';
  })();

  const socketHandlers = {
    onConnect: () => actions.setConnected(true),
    onDisconnect: () => actions.setConnected(false),
    onError: (msg) => actions.setError(msg),

    'error': ({ message }) => actions.setError(message),

    'room:created': ({ roomCode }) => {
      isHostRef.current = true;
      actions.joinLobby({ roomCode, playerName: pendingPlayerName.current, isHost: true });
    },

    'room:joined': ({ roomCode }) => {
      actions.joinLobby({ roomCode, playerName: pendingPlayerName.current, isHost: false });
    },

    'room:updated': ({ players, isHost, roomCode }) => {
      actions.updatePlayers({ players, isHost: isHost ?? isHostRef.current, roomCode });
    },

    'game:role': (data) => {
      actions.setRole(data);
    },

    'countdown:tick': ({ count }) => {
      actions.setCountdown(count);
    },

    'game:phaseChange': (data) => {
      actions.setPhase(data);
    },

    'reveal:layer': (layer) => {
      actions.addLayer(layer);
    },

    'guess:incoming': ({ guess, playerName }) => {
      actions.addGuess({ guess, playerName, isCorrect: false });
    },

    'guess:correct': (data) => {
      actions.setCorrectGuess(data);
      actions.addGuess({ guess: data.word, playerName: data.playerName, isCorrect: true });
    },

    'guess:timeUp': () => {},

    'vote:results': (data) => {
      actions.setVoteResults(data);
    },

    'score:update': (data) => {
      actions.updateScores(data);
    },

    'game:end': (data) => {
      actions.gameEnd(data);
    },

    'player:disconnected': ({ playerName }) => {
      console.log(`${playerName} disconnected`);
    },
  };

  const { emit } = useSocket(socketHandlers);

  const handleCreateRoom = (playerName) => {
    actions.clearError();
    pendingPlayerName.current = playerName;
    isHostRef.current = true;
    emit('room:create', { playerName });
  };

  const handleJoinRoom = (roomCode, playerName) => {
    actions.clearError();
    pendingPlayerName.current = playerName;
    isHostRef.current = false;
    emit('room:join', { roomCode, playerName });
  };

  const handleReady = () => {
    emit('player:ready', { roomCode: state.roomCode });
  };

  const handleStart = () => {
    emit('game:start', { roomCode: state.roomCode });
  };

  const handleDrawingSubmit = (imageBase64) => {
    emit('drawing:submit', { roomCode: state.roomCode, imageBase64 });
  };

  const handleGuessSubmit = (guess) => {
    emit('guess:submit', { roomCode: state.roomCode, guess });
  };

  const handleVote = (helpfulPlayer, chaoticPlayer) => {
    emit('vote:submit', { roomCode: state.roomCode, helpfulPlayer, chaoticPlayer });
  };

  const handleNextRound = () => {
    emit('game:nextRound', { roomCode: state.roomCode });
  };

  const handlePlayAgain = () => {
    actions.reset();
  };

  const { phase, screen } = state;

  // Screen routing
  if (!state.roomCode || screen === 'home') {
    return (
      <HomeScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        error={state.error}
        prefilledCode={urlJoinCode}
      />
    );
  }

  if (phase === 'lobby') {
    return (
      <LobbyScreen
        roomCode={state.roomCode}
        players={state.players}
        isHost={state.isHost}
        playerName={state.playerName}
        onReady={handleReady}
        onStart={handleStart}
        error={state.error}
      />
    );
  }

  if (phase === 'countdown' || phase === 'role') {
    return (
      <RoleScreen
        role={state.role}
        word={state.word}
        countdown={state.countdown}
        round={state.round}
        maxRounds={state.maxRounds}
      />
    );
  }

  if (phase === 'drawing') {
    return (
      <DrawingScreen
        role={state.role}
        word={state.word}
        phaseEndTime={state.phaseEndTime}
        phaseDuration={state.phaseDuration}
        onSubmit={handleDrawingSubmit}
      />
    );
  }

  if (phase === 'reveal') {
    return (
      <RevealScreen
        layers={state.layers}
        word={state.word}
      />
    );
  }

  if (phase === 'guessing') {
    return (
      <GuessScreen
        layers={state.layers}
        guesses={state.guesses}
        correctGuess={state.correctGuess}
        phaseEndTime={state.phaseEndTime}
        phaseDuration={state.phaseDuration}
        onSubmitGuess={handleGuessSubmit}
        playerName={state.playerName}
      />
    );
  }

  if (phase === 'voting') {
    return (
      <VoteScreen
        votePlayers={state.votePlayers ?? state.players}
        playerName={state.playerName}
        onVote={handleVote}
      />
    );
  }

  if (phase === 'scores' || phase === 'ended') {
    return (
      <ResultsScreen
        scores={state.scores}
        voteResults={state.voteResults}
        winner={state.winner}
        finalScores={state.finalScores}
        round={state.round}
        maxRounds={state.maxRounds}
        isHost={state.isHost}
        isGameOver={phase === 'ended'}
        onNextRound={handleNextRound}
        onPlayAgain={handlePlayAgain}
        playerName={state.playerName}
      />
    );
  }

  return null;
}
