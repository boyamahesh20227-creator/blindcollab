import { useState } from 'react';
import PlayerLobby from '../components/PlayerLobby';

export default function LobbyScreen({ roomCode, players, isHost, playerName, onReady, onStart, error }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/join/${roomCode}`;
  const me = players.find((p) => p.name === playerName);
  const canStart = players.length >= 2;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex flex-col p-4 font-body max-w-md mx-auto">
      <div className="pt-6 pb-4 text-center">
        <p className="text-gray-500 text-sm font-mono mb-1">room code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-4xl font-bold text-game-accent tracking-widest">
            {roomCode}
          </span>
          <button
            onClick={copyCode}
            className="px-3 py-2 rounded-xl bg-game-card border border-game-border text-sm font-mono hover:border-game-accent transition-all active:scale-95 min-w-[44px] min-h-[44px]"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-2 font-mono">share link to invite friends</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-game-danger/10 border border-game-danger/40 text-game-danger text-sm font-mono text-center">
          {error}
        </div>
      )}

      {/* Players */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-white font-bold">players ({players.length}/8)</h2>
          <span className="text-xs font-mono text-gray-500">min 2 to start</span>
        </div>
        <PlayerLobby players={players} myName={playerName} />
      </div>

      {/* Actions */}
      <div className="pt-4 pb-safe flex flex-col gap-3">
        {isHost ? (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            {canStart ? 'start game →' : `need ${2 - players.length} more player${2 - players.length !== 1 ? 's' : ''}`}
          </button>
        ) : (
          <button
            onClick={onReady}
            className={`w-full py-4 rounded-2xl font-mono font-bold text-lg transition-all active:scale-95 ${
              me?.ready
                ? 'bg-game-success text-black'
                : 'bg-game-card border border-game-border text-white hover:border-game-accent'
            }`}
          >
            {me?.ready ? '✓ ready!' : 'mark ready'}
          </button>
        )}

        <p className="text-center text-gray-600 text-xs font-mono">
          {isHost ? 'you are the host' : 'waiting for host to start'}
        </p>
      </div>
    </div>
  );
}
