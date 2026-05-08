export default function PlayerLobby({ players, myName }) {
  return (
    <div className="flex flex-col gap-2">
      {players.map((player) => (
        <div
          key={player.name}
          className="flex items-center gap-3 p-3 rounded-xl bg-game-card border border-game-border"
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold text-black flex-shrink-0"
            style={{ backgroundColor: player.color }}
          >
            {player.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <span className="font-body font-semibold text-white truncate block">
              {player.name}
              {player.name === myName && (
                <span className="ml-2 text-xs text-game-accent font-mono">(you)</span>
              )}
            </span>
            {player.isHost && (
              <span className="text-xs font-mono text-game-warning">host</span>
            )}
          </div>

          {/* Ready badge */}
          <div
            className={`px-2 py-1 rounded-lg text-xs font-mono transition-all ${
              player.ready
                ? 'bg-game-success/20 text-game-success border border-game-success/40'
                : 'bg-game-card text-gray-500 border border-game-border'
            }`}
          >
            {player.ready ? '✓ ready' : 'waiting'}
          </div>
        </div>
      ))}
    </div>
  );
}
