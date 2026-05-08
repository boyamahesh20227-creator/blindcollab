import { useState, useEffect } from 'react';

export default function HomeScreen({ onCreateRoom, onJoinRoom, error, prefilledCode = '' }) {
  const [mode, setMode] = useState(prefilledCode ? 'join' : null);
  const [name, setName] = useState('');
  const [code, setCode] = useState(prefilledCode);

  useEffect(() => {
    if (prefilledCode) {
      setMode('join');
      setCode(prefilledCode);
    }
  }, [prefilledCode]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) onCreateRoom(name.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim() && code.trim()) onJoinRoom(code.trim().toUpperCase(), name.trim());
  };

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center p-6 font-body">
      {/* Logo */}
      <div className="text-center mb-10">
        <h1 className="font-mono text-4xl md:text-5xl font-bold text-game-accent tracking-tight mb-2">
          blind collab
        </h1>
        <p className="text-gray-400 text-base">
          draw blind · merge chaos · guess together
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-game-danger/10 border border-game-danger/40 text-game-danger text-sm font-mono max-w-sm w-full text-center">
          {error}
        </div>
      )}

      {!mode && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setMode('create')}
            className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all"
          >
            + create room
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full py-4 rounded-2xl bg-game-card border border-game-border text-white font-mono font-bold text-lg hover:border-game-accent transition-all active:scale-95"
          >
            join room →
          </button>
          <p className="text-center text-gray-600 text-xs font-mono mt-2">
            min 2 players · max 8 · free
          </p>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-4 w-full max-w-xs">
          <h2 className="font-mono text-game-accent text-lg font-bold text-center">create room</h2>
          <input
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-game-card border border-game-border text-white font-body focus:outline-none focus:border-game-accent placeholder-gray-600"
            placeholder="your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            create →
          </button>
          <button type="button" onClick={() => setMode(null)} className="text-gray-500 text-sm font-mono hover:text-white transition-colors">
            ← back
          </button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col gap-4 w-full max-w-xs">
          <h2 className="font-mono text-game-accent text-lg font-bold text-center">join room</h2>
          <input
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-game-card border border-game-border text-white font-body focus:outline-none focus:border-game-accent placeholder-gray-600"
            placeholder="your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
          <input
            className="w-full px-4 py-3 rounded-xl bg-game-card border border-game-border text-white font-mono text-xl tracking-widest uppercase focus:outline-none focus:border-game-accent placeholder-gray-600"
            placeholder="ROOM CODE"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
          <button
            type="submit"
            disabled={!name.trim() || code.trim().length < 3}
            className="w-full py-4 rounded-2xl bg-game-accent text-black font-mono font-bold text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
          >
            join →
          </button>
          <button type="button" onClick={() => setMode(null)} className="text-gray-500 text-sm font-mono hover:text-white transition-colors">
            ← back
          </button>
        </form>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 text-center text-gray-700 text-xs font-mono">
        blindcollab · draw blind · guess together
      </div>
    </div>
  );
}
