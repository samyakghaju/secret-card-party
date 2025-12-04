export interface GameRecord {
  id: string;
  date: string;
  players: {
    name: string;
    role: "mafia" | "civilian";
  }[];
  mafiaCount: number;
  civilianCount: number;
}

export interface PlayerStats {
  name: string;
  gamesPlayed: number;
  timesMafia: number;
  timesCivilian: number;
}

const STORAGE_KEY = "secret-mafia-history";

export const getGameHistory = (): GameRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveGame = (
  players: { name: string; role: "mafia" | "civilian" }[]
): GameRecord => {
  const history = getGameHistory();
  
  const newRecord: GameRecord = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    players,
    mafiaCount: players.filter((p) => p.role === "mafia").length,
    civilianCount: players.filter((p) => p.role === "civilian").length,
  };

  const updatedHistory = [newRecord, ...history].slice(0, 50); // Keep last 50 games
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  
  return newRecord;
};

export const getPlayerStats = (): PlayerStats[] => {
  const history = getGameHistory();
  const statsMap = new Map<string, PlayerStats>();

  history.forEach((game) => {
    game.players.forEach((player) => {
      const existing = statsMap.get(player.name.toLowerCase()) || {
        name: player.name,
        gamesPlayed: 0,
        timesMafia: 0,
        timesCivilian: 0,
      };

      existing.gamesPlayed++;
      if (player.role === "mafia") {
        existing.timesMafia++;
      } else {
        existing.timesCivilian++;
      }

      statsMap.set(player.name.toLowerCase(), existing);
    });
  });

  return Array.from(statsMap.values()).sort(
    (a, b) => b.gamesPlayed - a.gamesPlayed
  );
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
