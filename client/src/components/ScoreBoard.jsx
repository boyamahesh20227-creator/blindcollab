export default function ScoreBoard({ scores, highlight = null }) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  const getRankEmoji = (i) => ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;

  return (
    <div className="flex flex-col gap-2 w-full">
      {sorted.map((player, index) => (
        <div
          key={player.name}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all
            ${index === 0 ? 'bg-game-accent/10 border-game-accent/40' : 'bg-game-card border-game-border'}
            ${highlight === player.name ? 'ring-2 ring-game-success' : ''}
          `}
        >
          <span className="text-xl w-8 text-center">{getRankEmoji(index)}</span>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold text-black flex-shrink-0"
            style={{ backgroundColor: player.color }}
          >
            {player.name.slice(0, 2).toUpperCase()}
          </div>

          <span className="flex-1 font-body font-semibold text-white truncate">
            {player.name}
          </span>

          <span className={`font-mono font-bold text-lg ${index === 0 ? 'text-game-accent' : 'text-white'}`}>
            {player.score}
          </span>
        </div>
      ))}
    </div>
  );
}
