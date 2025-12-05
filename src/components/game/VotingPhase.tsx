import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Vote, Check, X, Skull, Moon } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player } from "@/lib/gameTypes";

interface VotingPhaseProps {
  players: Player[];
  onVoteComplete: (eliminatedPlayer: string | null) => void;
  onSkipVote: () => void;
}

export const VotingPhase = ({ players, onVoteComplete, onSkipVote }: VotingPhaseProps) => {
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const alivePlayers = players.filter(p => p.isAlive);
  const currentVoter = alivePlayers[currentVoterIndex];
  const isLastVoter = currentVoterIndex === alivePlayers.length - 1;

  const handleVote = (targetName: string | null) => {
    soundManager.playClick();
    
    if (currentVoter) {
      const newVotes = { ...votes };
      if (targetName) {
        newVotes[currentVoter.name] = targetName;
      }
      setVotes(newVotes);
      
      if (isLastVoter) {
        setShowResults(true);
      } else {
        setCurrentVoterIndex(currentVoterIndex + 1);
      }
    }
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
    onVoteComplete(results.eliminated);
  };

  if (showResults) {
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
                    {results.eliminated} has been eliminated!
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
            Continue to Night
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
            onClick={() => handleVote(player.name)}
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
          onClick={() => handleVote(null)}
          className="w-full"
        >
          Skip Vote
        </Button>
      </div>
    </div>
  );
};
