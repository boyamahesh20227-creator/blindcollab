import { useRef } from 'react';
import { useGameState } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';

import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import WordSelectScreen from './screens/WordSelectScreen';
import DrawingScreen from './screens/DrawingScreen';
import GuessWatchScreen from './screens/GuessWatchScreen';
import RevealScreen from './screens/RevealScreen';
import ResultsScreen from './screens/ResultsScreen';

export default function App() {
  const { state, actions } = useGameState();
  const isHostRef = useRef(false);
  const pendingPlayerName = useRef('');

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
      actions.joinLobby({ roomCode, playerName: pendingPlayerName.current, isHost: true, screen: 'lobby', phase: 'lobby' });
    },
    'room:joined': ({ roomCode }) => {
      actions.joinLobby({ roomCode, playerName: pendingPlayerName.current, isHost: false, screen: 'lobby', phase: 'lobby' });
    },
    'room:updated': ({ players, isHost, roomCode }) => {
      actions.updatePlayers({ players, isHost: isHost ?? isHostRef.current, roomCode });
    },

    // Role assignment — includes sentence (for drawers) or just role (for guesser)
    'game:assigned': (data) => {
      actions.gameAssigned({
        role: data.role,
        sentence: data.sentence ?? null,
        words: data.words ?? [],
        totalWords: data.totalWords,
        guesserName: data.guesserName,
        round: data.round,
        maxRounds: data.maxRounds,
      });
    },

    'game:phaseChange': (data) => {
      actions.setPhase(data);
    },

    'word:claimed': ({ claimedWords }) => {
      actions.wordClaimed({ claimedWords });
    },

    // Server auto-assigned a word (timeout fallback)
    'word:autoAssigned': (data) => {
      actions.wordAssigned(data);
    },

    // Server confirms which word this drawer got
    'drawing:wordAssigned': (data) => {
      actions.wordAssigned(data);
    },

    // Live canvas update for guesser
    'canvas:live': (data) => {
      actions.canvasLive(data);
    },

    'drawing:progress': (data) => {
      actions.drawingProgress(data);
    },

    // Guesser gets feedback on their guess
    'sentence:guessed': (data) => {
      actions.addGuess(data);
    },

    // Reveal all drawings + sentence
    'game:reveal': (data) => {
      actions.setReveal(data);
    },

    'score:update': (data) => {
      actions.updateScores(data);
    },

    'game:end': (data) => {
      actions.gameEnd(data);
    },

    'player:disconnected': ({ playerName }) => {
      console.log(`${playerName} left`);
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

  const handleCanvasUpdate = (imageBase64) => {
    emit('canvas:update', { roomCode: state.roomCode, imageBase64 });
  };

  const { phase, role } = state;

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (!state.roomCode) {
    return <HomeScreen onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} error={state.error} prefilledCode={urlJoinCode} />;
  }

  if (phase === 'lobby') {
    return (
      <LobbyScreen
        roomCode={state.roomCode}
        players={state.players}
        isHost={state.isHost}
        playerName={state.playerName}
        onReady={() => emit('player:ready', { roomCode: state.roomCode })}
        onStart={() => emit('game:start', { roomCode: state.roomCode })}
        error={state.error}
      />
    );
  }

  // ── Role reveal / countdown ────────────────────────────────────────────────
  if (phase === 'roleReveal') {
    return (
      <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6 font-body text-center">
        <p className="text-gray-400 text-sm font-mono mb-3">round {state.round} of {state.maxRounds}</p>
        <div className={`px-6 py-3 rounded-2xl font-mono text-3xl font-bold mb-4 ${role === 'guesser' ? 'bg-game-accent/20 text-game-accent border-2 border-game-accent/40' : 'bg-blue-500/20 text-blue-300 border-2 border-blue-500/40'}`}>
          {role === 'guesser' ? '👁️ you guess!' : '✏️ you draw!'}
        </div>
        <p className="text-gray-400 text-sm">
          {role === 'guesser'
            ? `Watch the drawings and guess the sentence`
            : `You'll draw one word — ${state.guesserName} will guess the sentence`}
        </p>
        <div className="mt-8 flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-game-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
      </div>
    );
  }

  // ── Word selection ─────────────────────────────────────────────────────────
  if (phase === 'wordSelect') {
    return (
      <WordSelectScreen
        role={role}
        sentence={state.sentence}
        words={state.words}
        guesserName={state.guesserName}
        claimedWords={state.claimedWords}
        onClaim={(wordIndex) => emit('word:claim', { roomCode: state.roomCode, wordIndex })}
        phaseEndTime={state.phaseEndTime}
        phaseDuration={state.phaseDuration}
        myName={state.playerName}
      />
    );
  }

  // ── Drawing phase ──────────────────────────────────────────────────────────
  if (phase === 'drawing') {
    if (role === 'guesser') {
      return (
        <GuessWatchScreen
          liveCanvases={state.liveCanvases}
          totalWords={state.totalWords}
          guesses={state.guesses}
          drawingProgress={state.drawingProgress}
          phaseEndTime={state.phaseEndTime}
          phaseDuration={state.phaseDuration}
          onSubmitGuess={(guess) => emit('sentence:guess', { roomCode: state.roomCode, guess })}
        />
      );
    }
    return (
      <DrawingScreen
        assignedWord={state.assignedWord}
        assignedWordIndex={state.assignedWordIndex}
        totalWords={state.totalWords}
        phaseEndTime={state.phaseEndTime}
        phaseDuration={state.phaseDuration}
        onSubmit={(base64) => emit('drawing:submit', { roomCode: state.roomCode, imageBase64: base64 })}
        onCanvasUpdate={handleCanvasUpdate}
      />
    );
  }

  // ── Reveal ─────────────────────────────────────────────────────────────────
  if (phase === 'reveal') {
    return <RevealScreen revealData={state.revealData} />;
  }

  // ── Scores / Game over ─────────────────────────────────────────────────────
  if (phase === 'scores' || phase === 'ended') {
    return (
      <ResultsScreen
        scores={state.scores}
        winner={state.winner}
        finalScores={state.finalScores}
        round={state.round}
        maxRounds={state.maxRounds}
        isHost={state.isHost}
        isGameOver={phase === 'ended'}
        onNextRound={() => emit('game:nextRound', { roomCode: state.roomCode })}
        onPlayAgain={() => actions.reset()}
        playerName={state.playerName}
      />
    );
  }

  return null;
}
