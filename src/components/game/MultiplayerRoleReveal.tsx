import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PaperCard } from "./PaperCard";
import { ROLE_INFO, Role } from "@/lib/gameTypes";
import { GamePlayer } from "@/hooks/useMultiplayer";
import { soundManager } from "@/lib/sounds";
import { Eye, EyeOff } from "lucide-react";

interface MultiplayerRoleRevealProps {
  currentPlayer: GamePlayer;
  onContinue: () => void;
}

export const MultiplayerRoleReveal = ({ currentPlayer, onContinue }: MultiplayerRoleRevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasSeenRole, setHasSeenRole] = useState(false);

  const role = currentPlayer.role as Role;
  const roleInfo = role ? ROLE_INFO[role] : null;

  const handleReveal = () => {
    soundManager.playReveal();
    setIsRevealed(true);
    setHasSeenRole(true);
  };

  const handleHide = () => {
    soundManager.playClick();
    setIsRevealed(false);
  };

  const handleContinue = () => {
    soundManager.playClick();
    onContinue();
  };

  if (!role || !roleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Waiting for roles to be assigned...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      <div className="text-center mb-8 animate-slide-up">
        <p className="text-muted-foreground mb-2">Your Role</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">{currentPlayer.avatar}</span>
          <h2 className="font-display text-2xl font-bold">{currentPlayer.player_name}</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div 
          className="cursor-pointer"
          onClick={isRevealed ? handleHide : handleReveal}
        >
          <PaperCard
            playerName={currentPlayer.player_name}
            role={role}
            revealed={isRevealed}
          />
        </div>

        <div className="mt-8 text-center">
          {!isRevealed ? (
            <p className="text-muted-foreground animate-pulse">
              <Eye className="inline mr-2" size={16} />
              Tap the card to reveal your role
            </p>
          ) : (
            <p className="text-muted-foreground">
              <EyeOff className="inline mr-2" size={16} />
              Tap to hide your role
            </p>
          )}
        </div>
      </div>

      {hasSeenRole && !isRevealed && (
        <Button 
          size="lg" 
          className="w-full animate-slide-up"
          onClick={handleContinue}
        >
          I'm Ready
        </Button>
      )}
    </div>
  );
};
