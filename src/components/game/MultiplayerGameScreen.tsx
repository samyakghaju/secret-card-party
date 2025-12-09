import { useState, useEffect, useCallback } from "react";
import { GamePlayer, GameRoom } from "@/hooks/useMultiplayer";
import { HidePhonesCountdown } from "./HidePhonesCountdown";
import { MultiplayerRoleReveal } from "./MultiplayerRoleReveal";
import { MultiplayerVotingPhase } from "./MultiplayerVotingPhase";
import { NightIntro } from "./NightIntro";
import { NightPhase } from "./NightPhase";
import { DayPhase } from "./DayPhase";
import { GameWinner } from "./GameWinner";
import { supabase } from "@/integrations/supabase/client";
import { Player, GameMode, isMafiaRole, Role } from "@/lib/gameTypes";
import { Json } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type MultiplayerPhase = 
  | "hide-phones" 
  | "role-reveal" 
  | "waiting-for-players"
  | "night-intro" 
  | "night" 
  | "day" 
  | "voting" 
  | "complete";

interface GameState {
  phase: MultiplayerPhase;
  roundNumber: number;
  nightResult?: {
    eliminated: string | null;
    saved: boolean;
  };
  mafiaTarget?: string | null;
  doctorTarget?: string | null;
  detectiveTarget?: string | null;
  votes?: Record<string, string>;
  playersReady?: string[];
  winner?: "mafia" | "town";
}

interface MultiplayerGameScreenProps {
  room: GameRoom;
  players: GamePlayer[];
  currentPlayer: GamePlayer;
  isHost: boolean;
  onGameEnd: () => void;
}

export const MultiplayerGameScreen = ({
  room,
  players,
  currentPlayer,
  isHost,
  onGameEnd,
}: MultiplayerGameScreenProps) => {
  const [localPhase, setLocalPhase] = useState<MultiplayerPhase>("hide-phones");
  const [hasSeenRole, setHasSeenRole] = useState(false);

  const rawGameState = room.game_state as Record<string, unknown> | null;
  const gameState: GameState = {
    phase: (rawGameState?.phase as MultiplayerPhase) || "hide-phones",
    roundNumber: (rawGameState?.roundNumber as number) || 1,
    playersReady: (rawGameState?.playersReady as string[]) || [],
    nightResult: rawGameState?.nightResult as GameState["nightResult"],
    votes: rawGameState?.votes as Record<string, string>,
    winner: rawGameState?.winner as "mafia" | "town" | undefined,
  };

  const gameMode = room.game_mode as GameMode;
  const timerMinutes = room.timer_minutes;

  // Convert GamePlayer to Player for existing components
  const gamePlayers: Player[] = players.map((p) => ({
    name: p.player_name,
    role: (p.role as Role) || "civilian",
    isAlive: p.is_alive,
    avatar: p.avatar,
  }));

  const updateGameState = useCallback(async (updates: Partial<GameState>) => {
    const newState = { ...gameState, ...updates };
    await supabase
      .from("game_rooms")
      .update({ game_state: newState as unknown as Json })
      .eq("id", room.id);
  }, [room.id, gameState]);

  const markPlayerReady = useCallback(async () => {
    const currentReady = gameState.playersReady || [];
    if (!currentReady.includes(currentPlayer.id)) {
      await updateGameState({
        playersReady: [...currentReady, currentPlayer.id],
      });
    }
  }, [currentPlayer.id, gameState.playersReady, updateGameState]);

  // Check if all players are ready
  const allPlayersReady = (gameState.playersReady?.length || 0) >= players.length;

  // Sync phase from room state
  useEffect(() => {
    if (gameState.phase) {
      setLocalPhase(gameState.phase);
    }
  }, [gameState.phase]);

  // Host: Check if all players are ready and advance phase
  useEffect(() => {
    if (!isHost) return;

    if (gameState.phase === "waiting-for-players" && allPlayersReady) {
      // All players have seen their roles, proceed to next phase
      if (gameMode === "advanced") {
        updateGameState({ phase: "night-intro", playersReady: [] });
      } else {
        updateGameState({ phase: "voting", playersReady: [] });
      }
    }
  }, [isHost, gameState.phase, allPlayersReady, gameMode, updateGameState]);

  const handleHidePhonesComplete = useCallback(() => {
    setLocalPhase("role-reveal");
  }, []);

  const handleRoleRevealComplete = useCallback(async () => {
    setHasSeenRole(true);
    await markPlayerReady();
    setLocalPhase("waiting-for-players");
    
    // Host updates the global phase
    if (isHost) {
      await updateGameState({ phase: "waiting-for-players" });
    }
  }, [isHost, markPlayerReady, updateGameState]);

  const handleNightIntroEnd = useCallback(async () => {
    if (isHost) {
      await updateGameState({ phase: "night" });
    }
  }, [isHost, updateGameState]);

  const handleNightEnd = useCallback(async (
    mafiaTarget: string | null,
    doctorTarget: string | null,
    detectiveTarget: string | null
  ) => {
    // Process night results
    let eliminated: string | null = null;
    let saved = false;

    if (mafiaTarget) {
      if (doctorTarget === mafiaTarget) {
        saved = true;
      } else {
        eliminated = mafiaTarget;
        // Update player in database
        const targetPlayer = players.find(p => p.player_name === mafiaTarget);
        if (targetPlayer) {
          await supabase
            .from("game_players")
            .update({ is_alive: false })
            .eq("id", targetPlayer.id);
        }
      }
    }

    // Check win conditions
    const alivePlayers = players.filter(p => p.is_alive && p.player_name !== eliminated);
    const aliveMafia = alivePlayers.filter(p => isMafiaRole(p.role as Role)).length;
    const aliveTown = alivePlayers.length - aliveMafia;

    if (aliveMafia === 0) {
      await updateGameState({ phase: "complete", winner: "town" });
    } else if (aliveMafia >= aliveTown) {
      await updateGameState({ phase: "complete", winner: "mafia" });
    } else {
      await updateGameState({
        phase: "day",
        nightResult: { eliminated, saved },
      });
    }
  }, [players, updateGameState]);

  const handleStartVoting = useCallback(async () => {
    if (isHost) {
      await updateGameState({ phase: "voting", votes: {}, playersReady: [] });
    }
  }, [isHost, updateGameState]);

  const handleVoteSubmit = useCallback(async (vote: string | null) => {
    const currentVotes = gameState.votes || {};
    const newVotes = { ...currentVotes };
    
    if (vote) {
      newVotes[currentPlayer.id] = vote;
    }
    
    await updateGameState({ votes: newVotes });
    await markPlayerReady();
  }, [currentPlayer.id, gameState.votes, markPlayerReady, updateGameState]);

  const handleVoteComplete = useCallback(async (eliminatedPlayer: string | null) => {
    if (eliminatedPlayer) {
      const targetPlayer = players.find(p => p.player_name === eliminatedPlayer);
      if (targetPlayer) {
        await supabase
          .from("game_players")
          .update({ is_alive: false })
          .eq("id", targetPlayer.id);
      }
    }

    // Check win conditions
    const alivePlayers = players.filter(p => p.is_alive && p.player_name !== eliminatedPlayer);
    const aliveMafia = alivePlayers.filter(p => isMafiaRole(p.role as Role)).length;
    const aliveTown = alivePlayers.length - aliveMafia;

    if (aliveMafia === 0) {
      await updateGameState({ phase: "complete", winner: "town" });
    } else if (aliveMafia >= aliveTown) {
      await updateGameState({ phase: "complete", winner: "mafia" });
    } else {
      const nextRound = (gameState.roundNumber || 1) + 1;
      if (gameMode === "simple") {
        await updateGameState({ 
          phase: "voting", 
          roundNumber: nextRound, 
          votes: {}, 
          playersReady: [] 
        });
      } else {
        await updateGameState({ 
          phase: "night-intro", 
          roundNumber: nextRound, 
          nightResult: undefined,
          playersReady: [] 
        });
      }
    }
  }, [players, gameMode, gameState.roundNumber, updateGameState]);

  // Render based on local phase (allows countdown to work independently)
  if (localPhase === "hide-phones") {
    return <HidePhonesCountdown onComplete={handleHidePhonesComplete} />;
  }

  if (localPhase === "role-reveal" || (localPhase === "waiting-for-players" && !hasSeenRole)) {
    return (
      <MultiplayerRoleReveal
        currentPlayer={currentPlayer}
        onContinue={handleRoleRevealComplete}
      />
    );
  }

  if (localPhase === "waiting-for-players") {
    const readyCount = gameState.playersReady?.length || 0;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
        <div className="text-center space-y-6 animate-slide-up">
          <Loader2 size={48} className="mx-auto text-primary animate-spin" />
          <h2 className="font-display text-2xl font-bold text-foreground">
            Waiting for Others
          </h2>
          <p className="text-muted-foreground">
            {readyCount} of {players.length} players ready
          </p>
          <div className="h-2 bg-secondary rounded-full overflow-hidden w-48 mx-auto">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(readyCount / players.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (localPhase === "night-intro") {
    return <NightIntro onContinue={handleNightIntroEnd} gameMode={gameMode} />;
  }

  if (localPhase === "night") {
    return (
      <NightPhase
        players={gamePlayers}
        gameMode={gameMode}
        onNightEnd={handleNightEnd}
      />
    );
  }

  if (localPhase === "day") {
    return (
      <DayPhase
        players={gamePlayers}
        nightResult={gameState.nightResult || null}
        roundNumber={gameState.roundNumber || 1}
        timerMinutes={timerMinutes}
        onStartVoting={handleStartVoting}
      />
    );
  }

  if (localPhase === "voting") {
    const hasVoted = gameState.playersReady?.includes(currentPlayer.id);
    
    return (
      <MultiplayerVotingPhase
        players={gamePlayers}
        currentPlayer={currentPlayer}
        votes={gameState.votes || {}}
        playersReady={gameState.playersReady || []}
        allPlayers={players}
        hasVoted={hasVoted || false}
        isHost={isHost}
        onVoteSubmit={handleVoteSubmit}
        onVoteComplete={handleVoteComplete}
      />
    );
  }

  if (localPhase === "complete") {
    return (
      <GameWinner
        winner={gameState.winner || "town"}
        players={gamePlayers}
        onPlayAgain={onGameEnd}
      />
    );
  }

  return null;
};
