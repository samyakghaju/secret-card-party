import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Eye } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { GameMode } from "@/lib/gameTypes";

interface NightIntroProps {
  onContinue: () => void;
  gameMode: GameMode;
}

export const NightIntro = ({ onContinue, gameMode }: NightIntroProps) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    soundManager.playMafiaReveal();
    
    const timer1 = setTimeout(() => setStep(1), 1500);
    const timer2 = setTimeout(() => setStep(2), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="text-center space-y-8 max-w-md">
        {/* Moon Icon */}
        <div className="relative animate-pulse-glow">
          <div className="w-32 h-32 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <Moon size={64} className="text-primary" />
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 min-h-[120px]">
          <h1 
            className={`font-display text-3xl font-bold text-foreground transition-opacity duration-500 ${step >= 0 ? 'opacity-100' : 'opacity-0'}`}
          >
            Night Falls...
          </h1>
          
          <p 
            className={`text-xl text-primary font-medium transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}
          >
            Everyone close your eyes
          </p>
          
          <div 
            className={`flex items-center justify-center gap-2 text-2xl text-primary font-display transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}
          >
            <Eye size={28} />
            <span>Mafia, open your eyes</span>
          </div>
        </div>

        {/* Instructions */}
        {step >= 2 && (
          <div className="space-y-4 animate-slide-up">
            <p className="text-sm text-muted-foreground">
              {gameMode === "advanced" 
                ? "Mafia members: identify each other silently, then choose your first victim"
                : "Mafia members: identify each other silently"}
            </p>
            
            <Button
              variant="mafia"
              size="xl"
              onClick={() => {
                soundManager.playClick();
                onContinue();
              }}
              className="w-full max-w-xs"
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
