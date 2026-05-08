// React Native compatible: YES
import { useMemo } from 'react';

export function usePlayers(players, playerName) {
  const me = useMemo(
    () => players.find((p) => p.name === playerName),
    [players, playerName]
  );

  const others = useMemo(
    () => players.filter((p) => p.name !== playerName),
    [players, playerName]
  );

  const sortedByScore = useMemo(
    () => [...players].sort((a, b) => b.score - a.score),
    [players]
  );

  return { me, others, sortedByScore };
}
