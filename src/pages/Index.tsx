import { useState, useCallback } from "react";
import { ModeSelectScreen } from "@/components/game/ModeSelectScreen";
import { SetupScreen } from "@/components/game/SetupScreen";
import { RoleRevealScreen } from "@/components/game/RoleRevealScreen";
import { NightIntro } from "@/components/game/NightIntro";
import { NightPhase } from "@/components/game/NightPhase";
import { DayPhase } from "@/components/game/DayPhase";
import { VotingPhase } from "@/components/game/VotingPhase";
import { GameWinner } from "@/components/game/GameWinner";
import { GameHistory } from "@/components/game/GameHistory";
import { saveGame } from "@/lib/gameHistory";
import { soundManager } from "@/lib/sounds";
import { Player, GameMode, GamePhase, Role, isMafiaRole, AdvancedRole } from "@/lib/gameTypes";

interface NightResult {
  eliminated: string | null;
  saved: boolean;
}

const Index = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>("mode-select");
  const [players, setPlayers] = useState<Player[]>([]);
  const [mafiaCount, setMafiaCount] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>("simple");
  const [roundNumber, setRoundNumber] = useState(1);
  const [nightResult, setNightResult] = useState<NightResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setGamePhase("setup");
  }, []);

  const handleToggleSound = useCallback(() => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
    if (newState) {
      soundManager.playClick();
    }
  }, [soundEnabled]);

  const handleBackToModeSelect = useCallback(() => {
    setGamePhase("mode-select");
  }, []);

  const handleStartGame = useCallback((playerNames: string[], numMafia: number) => {
    let roles: Role[];
    
    if (gameMode === "advanced") {
      // Advanced mode: Godfather, Mafioso(s), Doctor, Detective, Civilians
      const advancedRoles: AdvancedRole[] = [];
      
      // Add Godfather
      advancedRoles.push("godfather");
      
      // Add Mafiosos for remaining mafia slots
      for (let i = 1; i < numMafia; i++) {
        advancedRoles.push("mafioso");
      }
      
      // Add Doctor and Detective
      advancedRoles.push("doctor");
      advancedRoles.push("detective");
      
      // Fill rest with civilians
      const remainingSlots = playerNames.length - advancedRoles.length;
      for (let i = 0; i < remainingSlots; i++) {
        advancedRoles.push("civilian");
      }
      
      roles = advancedRoles;
    } else {
      // Simple mode: Mafia vs Civilians
      roles = [
        ...Array(numMafia).fill("mafia"),
        ...Array(playerNames.length - numMafia).fill("civilian"),
      ];
    }

    const shuffledRoles = shuffleArray(roles);
    const shuffledNames = shuffleArray(playerNames);

    const assignedPlayers: Player[] = shuffledNames.map((name, index) => ({
      name,
      role: shuffledRoles[index],
      isAlive: true,
    }));

    setPlayers(assignedPlayers);
    setMafiaCount(numMafia);
    setRoundNumber(1);
    setNightResult(null);
    setGamePhase("reveal");
  }, [gameMode]);

  const handleRoleRevealEnd = useCallback(() => {
    // Save game to history
    saveGame(players);
    // Go to night intro
    setGamePhase("night-intro");
  }, [players]);

  const handleNightIntroEnd = useCallback(() => {
    if (gameMode === "advanced") {
      setGamePhase("night");
    } else {
      // Simple mode goes straight to day/voting
      setGamePhase("day");
    }
  }, [gameMode]);

  const handleNightEnd = useCallback((mafiaTarget: string | null, doctorTarget: string | null, detectiveTarget: string | null) => {
    const updatedPlayers = [...players];
    let result: NightResult = {
      eliminated: null,
      saved: false,
    };

    // Process mafia kill
    if (mafiaTarget) {
      const targetPlayer = updatedPlayers.find(p => p.name === mafiaTarget);
      if (targetPlayer) {
        // Check if saved by doctor
        if (doctorTarget === mafiaTarget) {
          result.saved = true;
        } else {
          targetPlayer.isAlive = false;
          result.eliminated = mafiaTarget;
        }
      }
    }


    setPlayers(updatedPlayers);
    setNightResult(result);
    
    // Check win conditions
    const alivePlayers = updatedPlayers.filter(p => p.isAlive);
    const aliveMafia = alivePlayers.filter(p => isMafiaRole(p.role)).length;
    const aliveTown = alivePlayers.length - aliveMafia;

    if (aliveMafia === 0 || aliveMafia >= aliveTown) {
      setGamePhase("complete");
    } else {
      setGamePhase("day");
    }
  }, [players]);

  const handleStartVoting = useCallback(() => {
    setGamePhase("voting");
  }, []);

  const handleVoteComplete = useCallback((eliminatedPlayer: string | null) => {
    const updatedPlayers = [...players];
    
    if (eliminatedPlayer) {
      const targetPlayer = updatedPlayers.find(p => p.name === eliminatedPlayer);
      if (targetPlayer) {
        targetPlayer.isAlive = false;
      }
    }

    setPlayers(updatedPlayers);

    // Check win conditions
    const alivePlayers = updatedPlayers.filter(p => p.isAlive);
    const aliveMafia = alivePlayers.filter(p => isMafiaRole(p.role)).length;
    const aliveTown = alivePlayers.length - aliveMafia;

    if (aliveMafia === 0 || aliveMafia >= aliveTown) {
      setGamePhase("complete");
    } else {
      // Continue to next night
      setRoundNumber(r => r + 1);
      setNightResult(null);
      setGamePhase("night-intro");
    }
  }, [players]);

  const handlePlayAgain = useCallback(() => {
    setPlayers([]);
    setMafiaCount(0);
    setRoundNumber(1);
    setNightResult(null);
    setGamePhase("mode-select");
  }, []);

  const handleShowHistory = useCallback(() => {
    setGamePhase("history");
  }, []);

  const handleCloseHistory = useCallback(() => {
    setGamePhase("mode-select");
  }, []);

  return (
    <main className="min-h-screen">
      {gamePhase === "mode-select" && (
        <ModeSelectScreen 
          onSelectMode={handleSelectMode} 
          onShowHistory={handleShowHistory}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gamePhase === "setup" && (
        <SetupScreen 
          gameMode={gameMode} 
          onStartGame={handleStartGame} 
          onBack={handleBackToModeSelect} 
        />
      )}
      {gamePhase === "reveal" && (
        <RoleRevealScreen players={players} onGameEnd={handleRoleRevealEnd} />
      )}
      {gamePhase === "night-intro" && (
        <NightIntro onContinue={handleNightIntroEnd} gameMode={gameMode} />
      )}
      {gamePhase === "night" && (
        <NightPhase 
          players={players} 
          gameMode={gameMode}
          onNightEnd={handleNightEnd} 
        />
      )}
      {gamePhase === "day" && (
        <DayPhase 
          players={players} 
          nightResult={nightResult} 
          roundNumber={roundNumber}
          onStartVoting={handleStartVoting}
        />
      )}
      {gamePhase === "voting" && (
        <VotingPhase 
          players={players} 
          onVoteComplete={handleVoteComplete}
          onSkipVote={() => handleVoteComplete(null)}
        />
      )}
      {gamePhase === "complete" && (
        <GameWinner
          winner={players.filter(p => p.isAlive && isMafiaRole(p.role)).length === 0 ? "town" : "mafia"}
          players={players}
          onPlayAgain={handlePlayAgain}
        />
      )}
      {gamePhase === "history" && (
        <GameHistory onClose={handleCloseHistory} />
      )}
    </main>
  );
};

export default Index;
