import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Vote, Check, X, Skull, Moon, AlertCircle } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, isMafiaRole } from "@/lib/gameTypes";
import { Countdown } from "./Countdown";
import { speak, cancelSpeech } from "@/lib/speech";

interface VotingPhaseProps {
  players: Player[];
  onVoteComplete: (eliminatedPlayer: string | null, eliminatedRole?: string) => void;
  onSkipVote: () => void;
}

type VotingStep = "voting" | "confirm" | "results" | "countdown" | "reveal";

export const VotingPhase = ({ players, onVoteComplete, onSkipVote }: VotingPhaseProps) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [step, setStep] = useState<VotingStep>("voting");
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  
  const alivePlayers = players.filter(p => p.isAlive);
  const currentVoter = alivePlayers[currentVoterIndex];
  const isLastVoter = currentVoterIndex === alivePlayers.length - 1;

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const handleSelectVote = (targetName: string | null) => {
    soundManager.playClick();
    setSelectedVote(targetName);
    setStep("confirm");
  };

  const handleConfirmVote = () => {
    soundManager.playClick();
    
    if (currentVoter) {
      const newVotes = { ...votes };
      if (selectedVote) {
        newVotes[currentVoter.name] = selectedVote;
      }
      setVotes(newVotes);
      
      if (isLastVoter) {
        setStep("results");
      } else {
        setCurrentVoterIndex(currentVoterIndex + 1);
        setSelectedVote(null);
        setStep("voting");
      }
    }
  };

  const handleCancelVote = () => {
    soundManager.playClick();
    setSelectedVote(null);
    setStep("voting");
  };

  const calculateResults = () => {
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(target => {
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
    
    // Need majority or clear winner
    const threshold = Math.floor(alivePlayers.length / 2) + 1;
    if (tie || maxVotes < threshold) {
      return { eliminated: null, voteCounts, reason: tie ? "Tie vote" : "No majority" };
    }
    
    return { eliminated, voteCounts, reason: null };
  };

  const handleConfirmResults = () => {
    soundManager.playClick();
    const results = calculateResults();
    
    if (results.eliminated) {
      const player = players.find(p => p.name === results.eliminated);
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
      onVoteComplete(eliminatedPlayer.name, eliminatedPlayer.role);
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
          <Countdown 
            seconds={3} 
            onComplete={handleCountdownComplete}
          />
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
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse-glow ${
              isMafia ? 'bg-primary/30' : 'bg-emerald-500/30'
            }`}>
              <Skull size={64} className={isMafia ? 'text-primary' : 'text-emerald-400'} />
            </div>
            
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {eliminatedPlayer.name}
              </h2>
              <p className={`text-xl font-display capitalize ${
                isMafia ? 'text-primary' : 'text-emerald-400'
              }`}>
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

        <div className="pt-6">
          <Button
            variant="mafia"
            size="xl"
            onClick={handleRevealComplete}
            className="w-full"
          >
            <Moon size={20} />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // Vote confirmation
  if (step === "confirm") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 w-full animate-slide-up">
            <div className="w-24 h-24 mx-auto rounded-full bg-amber-400/20 flex items-center justify-center">
              <AlertCircle size={48} className="text-amber-400" />
            </div>
            
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Confirm Vote
              </h2>
              <p className="text-muted-foreground mt-2">
                {currentVoter?.name}, you are voting for:
              </p>
              <p className="text-2xl text-primary font-display font-bold mt-4">
                {selectedVote || "Skip Vote"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <Button
            variant="mafia"
            size="xl"
            onClick={handleConfirmVote}
            className="w-full"
          >
            <Check size={20} />
            Confirm Vote
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCancelVote}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
                  <p className="text-muted-foreground text-sm mt-2">
                    The town has spoken
                  </p>
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
                  <p className="text-muted-foreground text-sm mt-2">
                    {results.reason}
                  </p>
                </div>
              </>
            )}
            
            {/* Vote Breakdown */}
            <div className="bg-secondary/50 rounded-xl p-4 w-full">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Vote Results</h3>
              <div className="space-y-2">
                {Object.entries(results.voteCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className={`font-medium ${name === results.eliminated ? 'text-primary' : 'text-foreground'}`}>
                      {name}
                    </span>
                    <span className="text-muted-foreground">{count} votes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button
            variant="mafia"
            size="xl"
            onClick={handleConfirmResults}
            className="w-full"
          >
            <Moon size={20} />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-2 text-amber-400">
          <Vote size={20} />
          <span className="text-sm font-medium uppercase tracking-wider">Voting</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Voter {currentVoterIndex + 1} of {alivePlayers.length}</span>
          <span>{Math.round(((currentVoterIndex + 1) / alivePlayers.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${((currentVoterIndex + 1) / alivePlayers.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Voter */}
      <div className="text-center mb-6 animate-slide-up">
        <p className="text-muted-foreground text-sm">Pass the phone to</p>
        <h2 className="font-display text-3xl font-bold text-foreground">
          {currentVoter?.name}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Vote to eliminate a suspect
        </p>
      </div>

      {/* Voting Options */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {alivePlayers
          .filter(p => p.name !== currentVoter?.name)
          .map((player) => (
          <button
            key={player.name}
            onClick={() => handleSelectVote(player.name)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/50 border-2 border-transparent hover:border-primary transition-all"
          >
            <span className="font-medium text-foreground">{player.name}</span>
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
