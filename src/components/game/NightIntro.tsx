import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Eye, EyeOff, Users } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { GameMode } from "@/lib/gameTypes";
import { Countdown } from "./Countdown";
import { speak, cancelSpeech } from "@/lib/speech";

interface NightIntroProps {
  onContinue: () => void;
  gameMode: GameMode;
}

type IntroStep = "countdown" | "night-falls" | "close-eyes" | "mafia-open" | "ready";

export const NightIntro = ({ onContinue, gameMode }: NightIntroProps) => {
  const [step, setStep] = useState<IntroStep>("countdown");

  const handleCountdownComplete = useCallback(() => {
    soundManager.playMafiaReveal();
    setStep("night-falls");
  }, []);

  useEffect(() => {
    if (step === "night-falls") {
      const timer = setTimeout(() => {
        setStep("close-eyes");
        speak("Everyone close your eyes");
      }, 1500);
      return () => clearTimeout(timer);
    }
    
    if (step === "close-eyes") {
      const timer = setTimeout(() => {
        setStep("mafia-open");
        speak("Mafia, open your eyes");
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (step === "mafia-open") {
      const timer = setTimeout(() => {
        setStep("ready");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  if (step === "countdown") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
        <Countdown 
          seconds={3} 
          onComplete={handleCountdownComplete}
          label="Night falls in..."
        />
      </div>
    );
  }

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
            className="font-display text-3xl font-bold text-foreground transition-opacity duration-500 opacity-100"
          >
            Night Falls...
          </h1>
          
          <div 
            className={`flex items-center justify-center gap-2 text-xl text-muted-foreground font-medium transition-opacity duration-500 ${step === "close-eyes" || step === "mafia-open" || step === "ready" ? 'opacity-100' : 'opacity-0'}`}
          >
            <EyeOff size={24} />
            <span>Everyone close your eyes</span>
          </div>
          
          <div 
            className={`flex items-center justify-center gap-2 text-2xl text-primary font-display transition-opacity duration-500 ${step === "mafia-open" || step === "ready" ? 'opacity-100' : 'opacity-0'}`}
          >
            <Eye size={28} />
            <span>Mafia, open your eyes</span>
          </div>
        </div>

        {/* Instructions */}
        {step === "ready" && (
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
