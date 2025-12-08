import { useState, useCallback } from "react";
import { ModeSelectScreen } from "@/components/game/ModeSelectScreen";
import { SetupScreen } from "@/components/game/SetupScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { RoleRevealScreen } from "@/components/game/RoleRevealScreen";
import { NightIntro } from "@/components/game/NightIntro";
import { NightPhase } from "@/components/game/NightPhase";
import { DayPhase } from "@/components/game/DayPhase";
import { VotingPhase } from "@/components/game/VotingPhase";
import { GameWinner } from "@/components/game/GameWinner";
import { GameHistory } from "@/components/game/GameHistory";
import { saveGame } from "@/lib/gameHistory";
import { soundManager } from "@/lib/sounds";
import { Player, GameMode, GamePhase, Role, isMafiaRole, AdvancedRole, PLAYER_AVATARS } from "@/lib/gameTypes";
import { GamePlayer } from "@/hooks/useMultiplayer";

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
  const [timerMinutes, setTimerMinutes] = useState(3);

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

  const handleMultiplayer = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setGamePhase("lobby");
  }, []);

  const handleStartMultiplayerGame = useCallback((gamePlayers: GamePlayer[], numMafia: number, timerMins: number) => {
    // Convert GamePlayer to Player with role assignment
    let roles: Role[];
    
    if (gameMode === "advanced") {
      const advancedRoles: AdvancedRole[] = [];
      advancedRoles.push("godfather");
      for (let i = 1; i < numMafia; i++) {
        advancedRoles.push("mafioso");
      }
      advancedRoles.push("doctor");
      advancedRoles.push("detective");
      const remainingSlots = gamePlayers.length - advancedRoles.length;
      for (let i = 0; i < remainingSlots; i++) {
        advancedRoles.push("civilian");
      }
      roles = advancedRoles;
    } else {
      roles = [
        ...Array(numMafia).fill("mafia"),
        ...Array(gamePlayers.length - numMafia).fill("civilian"),
      ];
    }

    const shuffledRoles = shuffleArray(roles);

    const assignedPlayers: Player[] = gamePlayers.map((gp, index) => ({
      name: gp.player_name,
      role: shuffledRoles[index],
      isAlive: true,
      avatar: gp.avatar,
    }));

    setPlayers(assignedPlayers);
    setMafiaCount(numMafia);
    setTimerMinutes(timerMins);
    setRoundNumber(1);
    setNightResult(null);
    setGamePhase("reveal");
  }, [gameMode, shuffleArray]);

  const handleStartGame = useCallback((playerNames: string[], numMafia: number, timerMins: number, avatars: string[]) => {
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
    const shuffledIndices = shuffleArray(playerNames.map((_, i) => i));

    const assignedPlayers: Player[] = shuffledIndices.map((originalIndex, newIndex) => ({
      name: playerNames[originalIndex],
      role: shuffledRoles[newIndex],
      isAlive: true,
      avatar: avatars[originalIndex] || PLAYER_AVATARS[originalIndex % PLAYER_AVATARS.length],
    }));

    setPlayers(assignedPlayers);
    setMafiaCount(numMafia);
    setTimerMinutes(timerMins);
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
      // Simple mode goes straight to voting (no night phase)
      setGamePhase("voting");
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
      // Continue to next round
      setRoundNumber(r => r + 1);
      setNightResult(null);
      // Simple mode: go straight to voting, Advanced mode: go to night-intro
      if (gameMode === "simple") {
        setGamePhase("voting");
      } else {
        setGamePhase("night-intro");
      }
    }
  }, [players, gameMode]);

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
          onMultiplayer={handleMultiplayer}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
      {gamePhase === "lobby" && (
        <LobbyScreen
          gameMode={gameMode}
          onStartGame={handleStartMultiplayerGame}
          onBack={handleBackToModeSelect}
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
          timerMinutes={timerMinutes}
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
