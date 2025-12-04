import { Button } from "@/components/ui/button";
import { RotateCcw, Users } from "lucide-react";

interface GameCompleteProps {
  playerCount: number;
  mafiaCount: number;
  onPlayAgain: () => void;
}

export const GameComplete = ({ playerCount, mafiaCount, onPlayAgain }: GameCompleteProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto">
      <div className="text-center space-y-8 animate-slide-up">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
          <Users size={48} className="text-primary" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            All Roles Assigned!
          </h1>
          <p className="text-muted-foreground">
            The game is ready to begin
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-primary">{mafiaCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Mafia</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-civilian">{playerCount - mafiaCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Civilians</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">How to play:</p>
          <ul className="text-left space-y-1 text-xs">
            <li>• Everyone closes their eyes</li>
            <li>• Mafia "wake up" and silently choose a victim</li>
            <li>• During the day, debate and vote who to eliminate</li>
            <li>• Civilians win by finding all mafia</li>
            <li>• Mafia wins when they equal civilians</li>
          </ul>
        </div>

        {/* Button */}
        <Button
          variant="mafia"
          size="xl"
          onClick={onPlayAgain}
          className="w-full max-w-xs"
        >
          <RotateCcw size={20} />
          Play Again
        </Button>
      </div>
    </div>
  );
};
