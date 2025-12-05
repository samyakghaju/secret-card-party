import { Button } from "@/components/ui/button";
import { Timer } from "./Timer";
import { RotateCcw, Users, Skull, Shield, Trophy } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, isMafiaRole } from "@/lib/gameTypes";

interface GameCompleteProps {
  playerCount: number;
  mafiaCount: number;
  onPlayAgain: () => void;
  players?: Player[];
  showWinner?: boolean;
}

export const GameComplete = ({ playerCount, mafiaCount, onPlayAgain, players, showWinner }: GameCompleteProps) => {
  const handlePlayAgain = () => {
    soundManager.playClick();
    onPlayAgain();
  };

  // Determine winner
  const mafiaWins = mafiaCount > 0 && mafiaCount >= (playerCount - mafiaCount);
  const townWins = mafiaCount === 0;
  const hasWinner = showWinner && (mafiaWins || townWins);

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="text-center animate-slide-up">
          {hasWinner ? (
            <>
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-pulse-glow mb-4 ${
                mafiaWins ? 'bg-primary/20' : 'bg-civilian/20'
              }`}>
                <Trophy size={40} className={mafiaWins ? 'text-primary' : 'text-civilian'} />
              </div>
              <h1 className={`font-display text-2xl font-bold ${
                mafiaWins ? 'text-primary' : 'text-civilian'
              }`}>
                {mafiaWins ? 'Mafia Wins!' : 'Town Wins!'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {mafiaWins 
                  ? 'The Mafia has taken over' 
                  : 'All Mafia members have been eliminated'}
              </p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow mb-4">
                <Users size={40} className="text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                All Roles Assigned!
              </h1>
              <p className="text-muted-foreground text-sm">
                The game is ready to begin
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">{mafiaCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {hasWinner ? 'Mafia Left' : 'Mafia'}
            </p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-civilian">{playerCount - mafiaCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {hasWinner ? 'Town Left' : 'Civilians'}
            </p>
          </div>
        </div>

        {/* Player Roles Reveal (only at game end) */}
        {hasWinner && players && (
          <div className="bg-secondary/50 rounded-xl p-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">All Players</h3>
            <div className="space-y-2 max-h-[20vh] overflow-y-auto">
              {players.map((player) => (
                <div key={player.name} className="flex items-center justify-between py-1">
                  <span className={`font-medium ${player.isAlive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                    {player.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    isMafiaRole(player.role) ? 'bg-primary/20 text-primary' : 'bg-civilian/20 text-civilian'
                  }`}>
                    {player.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timer (only for role assignment phase) */}
        {!hasWinner && (
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Timer defaultMinutes={3} />
          </div>
        )}

        {/* Instructions */}
        {!hasWinner && (
          <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <p className="font-medium text-foreground">How to play:</p>
            <ul className="text-left space-y-1 text-xs">
              <li>• Everyone closes their eyes</li>
              <li>• Mafia "wake up" and silently choose a victim</li>
              <li>• During the day, debate and vote who to eliminate</li>
              <li>• Civilians win by finding all mafia</li>
              <li>• Mafia wins when they equal civilians</li>
            </ul>
          </div>
        )}
      </div>

      {/* Button */}
      <div className="pt-6">
        <Button
          variant="mafia"
          size="xl"
          onClick={handlePlayAgain}
          className="w-full"
        >
          <RotateCcw size={20} />
          Play Again
        </Button>
      </div>
    </div>
  );
};
