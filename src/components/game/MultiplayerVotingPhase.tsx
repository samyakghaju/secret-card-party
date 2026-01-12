import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Vote, Check, AlertCircle, Loader2, Skull, X, Moon } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, isMafiaRole } from "@/lib/gameTypes";
import { GamePlayer } from "@/hooks/useMultiplayer";
import { Countdown } from "./Countdown";

interface MultiplayerVotingPhaseProps {
  players: Player[];
  currentPlayer: GamePlayer;
  votes: Record<string, string>;
  playersReady: string[];
  allPlayers: GamePlayer[];
  hasVoted: boolean;
  isHost: boolean;
  roundNumber: number;
  onVoteSubmit: (vote: string | null) => void;
  onVoteComplete: (eliminatedPlayer: string | null) => void;
}

type VotingStep = "voting" | "confirm" | "waiting" | "results" | "countdown" | "reveal";

export const MultiplayerVotingPhase = ({
  players,
  currentPlayer,
  votes,
  playersReady,
  allPlayers,
  hasVoted,
  isHost,
  roundNumber,
  onVoteSubmit,
  onVoteComplete,
}: MultiplayerVotingPhaseProps) => {
  const [step, setStep] = useState<VotingStep>(hasVoted ? "waiting" : "voting");
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);

  // Reset state when round changes (new voting phase)
  useEffect(() => {
    setStep(hasVoted ? "waiting" : "voting");
    setSelectedVote(null);
    setEliminatedPlayer(null);
  }, [roundNumber, hasVoted]);

  const alivePlayers = players.filter((p) => p.isAlive);
  const allVoted = playersReady.length >= alivePlayers.length;

  const handleSelectVote = (targetName: string | null) => {
    soundManager.playClick();
    setSelectedVote(targetName);
    setStep("confirm");
  };

  const handleConfirmVote = () => {
    soundManager.playClick();
    onVoteSubmit(selectedVote);
    setStep("waiting");
  };

  const handleCancelVote = () => {
    soundManager.playClick();
    setSelectedVote(null);
    setStep("voting");
  };

  const calculateResults = useCallback(() => {
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach((target) => {
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    });

    let maxVotes = 0;
    let eliminated: string | null = null;
    let tie = false;

    Object.entries(voteCounts).forEach(([name, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminated = name;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    const threshold = Math.floor(alivePlayers.length / 2) + 1;
    if (tie || maxVotes < threshold) {
      return { eliminated: null, voteCounts, reason: tie ? "Tie vote" : "No majority" };
    }

    return { eliminated, voteCounts, reason: null };
  }, [votes, alivePlayers.length]);

  const handleShowResults = () => {
    soundManager.playClick();
    setStep("results");
  };

  const handleConfirmResults = () => {
    soundManager.playClick();
    const results = calculateResults();

    if (results.eliminated) {
      const player = players.find((p) => p.name === results.eliminated);
      if (player) {
        setEliminatedPlayer(player);
        setStep("countdown");
        return;
      }
    }

    onVoteComplete(null);
  };

  const handleCountdownComplete = useCallback(() => {
    setStep("reveal");
  }, []);

  const handleRevealComplete = () => {
    soundManager.playClick();
    if (eliminatedPlayer) {
      onVoteComplete(eliminatedPlayer.name);
    }
  };

  // Countdown before role reveal
  if (step === "countdown") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
        <div className="text-center space-y-6 animate-slide-up">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Skull size={48} className="text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {eliminatedPlayer?.name} has been eliminated!
          </h2>
          <p className="text-muted-foreground">Role reveal in...</p>
        </div>
        <div className="mt-8">
          <Countdown seconds={3} onComplete={handleCountdownComplete} />
        </div>
      </div>
    );
  }

  // Role reveal
  if (step === "reveal" && eliminatedPlayer) {
    const isMafia = isMafiaRole(eliminatedPlayer.role);

    return (
      <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 w-full animate-slide-up">
            <div
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse-glow ${
                isMafia ? "bg-primary/30" : "bg-emerald-500/30"
              }`}
            >
              <Skull size={64} className={isMafia ? "text-primary" : "text-emerald-400"} />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {eliminatedPlayer.name}
              </h2>
              <p
                className={`text-xl font-display capitalize ${
                  isMafia ? "text-primary" : "text-emerald-400"
                }`}
              >
                was a {eliminatedPlayer.role}
              </p>
            </div>

            <p className="text-muted-foreground">
              {isMafia
                ? "The town successfully eliminated a mafia member!"
                : "An innocent townsperson was eliminated..."}
            </p>
          </div>
        </div>

        {isHost && (
          <div className="pt-6">
            <Button variant="mafia" size="xl" onClick={handleRevealComplete} className="w-full">
              <Moon size={20} />
              Continue
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Waiting for all votes
  if (step === "waiting") {
    const readyCount = playersReady.length;
    const aliveCount = alivePlayers.length;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
        <div className="text-center space-y-6 animate-slide-up">
          {allVoted ? (
            <>
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Check size={48} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">All Votes In!</h2>
              {isHost ? (
                <Button variant="mafia" size="lg" onClick={handleShowResults}>
                  Show Results
                </Button>
              ) : (
                <p className="text-muted-foreground">Waiting for host to reveal results...</p>
              )}
            </>
          ) : (
            <>
              <Loader2 size={48} className="mx-auto text-primary animate-spin" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Waiting for Votes
              </h2>
              <p className="text-muted-foreground">
                {readyCount} of {aliveCount} players voted
              </p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden w-48 mx-auto">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(readyCount / aliveCount) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Results
  if (step === "results") {
    const results = calculateResults();

    return (
      <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 w-full animate-slide-up">
            {results.eliminated ? (
              <>
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                  <Skull size={48} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    {results.eliminated} has been voted out!
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2">The town has spoken</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <X size={48} className="text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    No one eliminated
                  </h2>
                  <p className="text-muted-foreground text-sm mt-2">{results.reason}</p>
                </div>
              </>
            )}

            {/* Vote Breakdown */}
            <div className="bg-secondary/50 rounded-xl p-4 w-full">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Vote Results</h3>
              <div className="space-y-2">
                {Object.entries(results.voteCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span
                        className={`font-medium ${
                          name === results.eliminated ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {name}
                      </span>
                      <span className="text-muted-foreground">{count} votes</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {isHost && (
          <div className="pt-6">
            <Button variant="mafia" size="xl" onClick={handleConfirmResults} className="w-full">
              <Moon size={20} />
              Continue
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Confirm vote
  if (step === "confirm") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 w-full animate-slide-up">
            <div className="w-24 h-24 mx-auto rounded-full bg-amber-400/20 flex items-center justify-center">
              <AlertCircle size={48} className="text-amber-400" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Confirm Vote</h2>
              <p className="text-muted-foreground mt-2">
                {currentPlayer.player_name}, you are voting for:
              </p>
              <p className="text-2xl text-primary font-display font-bold mt-4">
                {selectedVote || "Skip Vote"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <Button variant="mafia" size="xl" onClick={handleConfirmVote} className="w-full">
            <Check size={20} />
            Confirm Vote
          </Button>
          <Button variant="outline" size="lg" onClick={handleCancelVote} className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Voting UI
  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
          <Vote size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Voting</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-3xl">{currentPlayer.avatar}</span>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {currentPlayer.player_name}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Vote to eliminate a suspect</p>
      </div>

      {/* Voting Options */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {alivePlayers
          .filter((p) => p.name !== currentPlayer.player_name)
          .map((player) => (
            <button
              key={player.name}
              onClick={() => handleSelectVote(player.name)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 border-2 border-transparent hover:border-primary transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{player.avatar}</span>
                <span className="font-medium text-foreground">{player.name}</span>
              </div>
              <Vote size={18} className="text-muted-foreground" />
            </button>
          ))}
      </div>

      {/* Skip Vote */}
      <div className="pt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleSelectVote(null)}
          className="w-full"
        >
          Skip Vote
        </Button>
      </div>
    </div>
  );
};
