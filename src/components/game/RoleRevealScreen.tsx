import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PaperCard } from "./PaperCard";
import { Eye, EyeOff, ArrowRight, RotateCcw } from "lucide-react";

interface Player {
  name: string;
  role: "mafia" | "civilian";
}

interface RoleRevealScreenProps {
  players: Player[];
  onGameEnd: () => void;
}

export const RoleRevealScreen = ({ players, onGameEnd }: RoleRevealScreenProps) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  const handleReveal = () => {
    setIsRevealed(true);
    setHasViewed(true);
  };

  const handleNext = () => {
    if (isLastPlayer) {
      onGameEnd();
    } else {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setIsRevealed(false);
      setHasViewed(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-6 animate-slide-up">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Player {currentPlayerIndex + 1} of {players.length}</span>
          <span>{Math.round(((currentPlayerIndex + 1) / players.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!isRevealed ? (
          /* Hidden State */
          <div className="text-center space-y-8 animate-slide-up">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-wider">
                Pass the phone to
              </p>
              <h2 className="font-display text-4xl font-bold text-foreground">
                {currentPlayer.name}
              </h2>
            </div>

            <div className="relative">
              <div className="w-48 h-64 mx-auto rounded-xl bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center">
                <EyeOff size={48} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Your role is hidden
              </p>
            </div>

            <Button
              variant="mafia"
              size="xl"
              onClick={handleReveal}
              className="w-full max-w-xs"
            >
              <Eye size={20} />
              Reveal My Role
            </Button>
          </div>
        ) : (
          /* Revealed State */
          <div className="text-center space-y-8">
            <PaperCard
              playerName={currentPlayer.name}
              role={currentPlayer.role}
              revealed={isRevealed}
            />

            <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <p className="text-xs text-muted-foreground">
                Remember your role, then pass the phone
              </p>
              
              <Button
                variant={currentPlayer.role === "mafia" ? "mafia" : "civilian"}
                size="xl"
                onClick={handleNext}
                className="w-full max-w-xs"
              >
                {isLastPlayer ? (
                  <>
                    <RotateCcw size={20} />
                    Start New Game
                  </>
                ) : (
                  <>
                    <ArrowRight size={20} />
                    Next Player
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="pt-4 text-center">
        <p className="text-xs text-muted-foreground/60">
          🤫 Keep your role secret!
        </p>
      </div>
    </div>
  );
};
