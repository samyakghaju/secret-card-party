import { useState } from "react";
import { getCategoryById } from "@/lib/impostorData";

interface ImpostorCardProps {
  playerName: string;
  isImpostor: boolean;
  secretWord: string;
  categoryId: string;
  onNext: () => void;
  isLastPlayer: boolean;
}

export const ImpostorCard = ({
  playerName,
  isImpostor,
  secretWord,
  categoryId,
  onNext,
  isLastPlayer
}: ImpostorCardProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasSeenCard, setHasSeenCard] = useState(false);
  
  const category = getCategoryById(categoryId);
  const cardColor = "180 70% 80%";

  const handleCardTap = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      setHasSeenCard(true);
    } else {
      setIsRevealed(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={handleCardTap}
          className="w-full max-w-xs aspect-[3/4] rounded-3xl transition-all duration-300 flex flex-col items-center justify-center p-6 shadow-lg"
          style={{ 
            backgroundColor: `hsl(${cardColor})` 
          }}
        >
          <h3 className="font-display text-3xl italic font-bold text-ink mb-6">
            {playerName}
          </h3>
          
          {isRevealed ? (
            <div 
              className={`px-6 py-3 rounded-lg ${
                isImpostor 
                  ? "bg-white border-2 border-red-500" 
                  : "bg-white border border-ink/20"
              }`}
            >
              <p className={`font-semibold text-lg text-center ${
                isImpostor ? "text-red-500" : "text-ink"
              }`}>
                {isImpostor ? "YOU ARE THE IMPOSTER!" : secretWord}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/50 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">{category?.icon || "❓"}</span>
              </div>
              <p className="text-ink/60 text-sm">Tap to reveal</p>
            </div>
          )}
        </button>
        
        {isRevealed && (
          <p className="text-ink/40 text-sm mt-4 animate-pulse">
            Tap card to hide
          </p>
        )}
      </div>
      
      {hasSeenCard && !isRevealed && (
        <button
          onClick={onNext}
          className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg flex items-center justify-center gap-2 mt-4"
        >
          <span>▶</span> {isLastPlayer ? "START GAME" : "NEXT PLAYER"}
        </button>
      )}
    </div>
  );
};
