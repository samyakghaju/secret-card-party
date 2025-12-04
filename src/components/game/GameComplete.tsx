import { Button } from "@/components/ui/button";
import { Timer } from "./Timer";
import { RotateCcw, Users } from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface GameCompleteProps {
  playerCount: number;
  mafiaCount: number;
  onPlayAgain: () => void;
}

export const GameComplete = ({ playerCount, mafiaCount, onPlayAgain }: GameCompleteProps) => {
  const handlePlayAgain = () => {
    soundManager.playClick();
    onPlayAgain();
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="text-center animate-slide-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow mb-4">
            <Users size={40} className="text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            All Roles Assigned!
          </h1>
          <p className="text-muted-foreground text-sm">
            The game is ready to begin
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary">{mafiaCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Mafia</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-civilian">{playerCount - mafiaCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Civilians</p>
          </div>
        </div>

        {/* Timer */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Timer defaultMinutes={3} />
        </div>

        {/* Instructions */}
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
