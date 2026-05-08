import ScoreBoard from '../components/ScoreBoard';

const showAds = false;

export default function ResultsScreen({ scores, winner, finalScores, round, maxRounds, isHost, isGameOver, onNextRound, onPlayAgain, playerName }) {
  const display = isGameOver ? finalScores : scores;
  const nextGuesserIdx = round % (scores.length || 1);
  const nextGuesser = scores[nextGuesserIdx]?.name;

  return (
    <div className="min-h-screen bg-game-bg flex flex-col p-4 font-body max-w-md mx-auto">
      <div className="text-center py-6">
        {isGameOver ? (
          <>
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="font-mono text-game-accent text-3xl font-bold">game over!</h2>
            {winner && (
              <div className="mt-3 px-4 py-2 rounded-2xl bg-game-accent/10 border border-game-accent/40 inline-block">
                <span className="font-mono text-game-accent">
                  {winner.name === playerName ? 'you win! 🎉' : `${winner.name} wins!`}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="font-mono text-white text-2xl font-bold">round {round} done!</h2>
            {!isGameOver && nextGuesser && (
              <p className="text-gray-400 text-sm mt-2 font-mono">
                next round: <span className="text-game-accent font-bold">{nextGuesser === playerName ? 'YOU' : nextGuesser}</span> guesses
              </p>
            )}
            <p className="text-gray-600 text-xs mt-1 font-mono">{maxRounds - round} round{maxRounds - round !== 1 ? 's' : ''} left</p>
          </>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-mono text-gray-400 text-sm mb-3">{isGameOver ? 'final standings' : 'standings'}</h3>
        <ScoreBoard scores={display} highlight={winner?.name} />
      </div>

      {showAds && (
        <div className="mb-4 h-16 rounded-xl bg-game-card border border-game-border flex items-center justify-center">
          <span className="text-gray-600 text-xs font-mono">ad slot</span>
        </div>
      )}

      <div className="flex flex-col gap-3 pb-safe">
        {isGameOver ? (
          <>
            <button onClick={onPlayAgain} className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all">
              play again →
            </button>
            <button
              onClick={() => navigator.share?.({ title: 'Blind Collab', url: window.location.origin }) || navigator.clipboard.writeText(window.location.origin)}
              className="w-full py-3 rounded-2xl bg-game-card border border-game-border text-white font-mono hover:border-game-accent transition-all active:scale-95"
            >
              share with friends
            </button>
          </>
        ) : isHost ? (
          <button onClick={onNextRound} className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all">
            next round →
          </button>
        ) : (
          <div className="text-center py-3">
            <p className="text-gray-500 font-mono text-sm">waiting for host to continue…</p>
          </div>
        )}
      </div>
    </div>
  );
}
