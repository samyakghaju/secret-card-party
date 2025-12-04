import { useState, useCallback } from "react";
import { SetupScreen } from "@/components/game/SetupScreen";
import { RoleRevealScreen } from "@/components/game/RoleRevealScreen";
import { GameComplete } from "@/components/game/GameComplete";

type GamePhase = "setup" | "reveal" | "complete";

interface Player {
  name: string;
  role: "mafia" | "civilian";
}

const Index = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [mafiaCount, setMafiaCount] = useState(0);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartGame = useCallback((playerNames: string[], numMafia: number) => {
    // Create roles array
    const roles: ("mafia" | "civilian")[] = [
      ...Array(numMafia).fill("mafia"),
      ...Array(playerNames.length - numMafia).fill("civilian"),
    ];

    // Shuffle roles
    const shuffledRoles = shuffleArray(roles);

    // Shuffle player order for reveal
    const shuffledNames = shuffleArray(playerNames);

    // Assign roles to shuffled players
    const assignedPlayers: Player[] = shuffledNames.map((name, index) => ({
      name,
      role: shuffledRoles[index],
    }));

    setPlayers(assignedPlayers);
    setMafiaCount(numMafia);
    setGamePhase("reveal");
  }, []);

  const handleGameEnd = useCallback(() => {
    setGamePhase("complete");
  }, []);

  const handlePlayAgain = useCallback(() => {
    setPlayers([]);
    setMafiaCount(0);
    setGamePhase("setup");
  }, []);

  return (
    <main className="min-h-screen">
      {gamePhase === "setup" && (
        <SetupScreen onStartGame={handleStartGame} />
      )}
      {gamePhase === "reveal" && (
        <RoleRevealScreen players={players} onGameEnd={handleGameEnd} />
      )}
      {gamePhase === "complete" && (
        <GameComplete
          playerCount={players.length}
          mafiaCount={mafiaCount}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </main>
  );
};

export default Index;
