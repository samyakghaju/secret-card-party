import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Skull, Heart, Search, ArrowRight, Check } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, GameMode } from "@/lib/gameTypes";

interface NightPhaseProps {
  players: Player[];
  gameMode: GameMode;
  onNightEnd: (mafiaTarget: string | null, doctorTarget: string | null, detectiveTarget: string | null) => void;
}

type NightStep = "mafia" | "doctor" | "detective" | "complete";

export const NightPhase = ({ players, gameMode, onNightEnd }: NightPhaseProps) => {
  const [step, setStep] = useState<NightStep>("mafia");
  const [mafiaTarget, setMafiaTarget] = useState<string | null>(null);
  const [doctorTarget, setDoctorTarget] = useState<string | null>(null);
  const [detectiveTarget, setDetectiveTarget] = useState<string | null>(null);
  
  const alivePlayers = players.filter(p => p.isAlive);
  const hasDoctor = gameMode === "advanced" && players.some(p => p.role === "doctor" && p.isAlive);
  const hasDetective = gameMode === "advanced" && players.some(p => p.role === "detective" && p.isAlive);
  
  const getNextStep = (current: NightStep): NightStep => {
    if (current === "mafia") {
      if (hasDoctor) return "doctor";
      if (hasDetective) return "detective";
      return "complete";
    }
    if (current === "doctor") {
      if (hasDetective) return "detective";
      return "complete";
    }
    return "complete";
  };

  const handleConfirm = () => {
    soundManager.playClick();
    const next = getNextStep(step);
    if (next === "complete") {
      onNightEnd(mafiaTarget, doctorTarget, detectiveTarget);
    } else {
      setStep(next);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "mafia":
        return (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
              <Skull size={48} className="text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Mafia's Turn
            </h2>
            <p className="text-muted-foreground text-sm">
              Choose a player to eliminate (or skip)
            </p>
          </>
        );
      case "doctor":
        return (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-civilian/20 flex items-center justify-center animate-pulse-glow">
              <Heart size={48} className="text-civilian" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Doctor's Turn
            </h2>
            <p className="text-muted-foreground text-sm">
              Choose a player to protect tonight
            </p>
          </>
        );
      case "detective":
        return (
          <>
            <div className="w-24 h-24 mx-auto rounded-full bg-civilian/20 flex items-center justify-center animate-pulse-glow">
              <Search size={48} className="text-civilian" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Detective's Turn
            </h2>
            <p className="text-muted-foreground text-sm">
              Choose a player to investigate
            </p>
          </>
        );
      default:
        return null;
    }
  };

  const getCurrentTarget = () => {
    switch (step) {
      case "mafia": return mafiaTarget;
      case "doctor": return doctorTarget;
      case "detective": return detectiveTarget;
      default: return null;
    }
  };

  const setCurrentTarget = (name: string | null) => {
    switch (step) {
      case "mafia": setMafiaTarget(name); break;
      case "doctor": setDoctorTarget(name); break;
      case "detective": setDetectiveTarget(name); break;
    }
  };

  const currentTarget = getCurrentTarget();

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-6 text-primary">
        <Moon size={20} />
        <span className="text-sm font-medium uppercase tracking-wider">Night Phase</span>
      </div>

      {/* Step Content */}
      <div className="text-center space-y-4 mb-8 animate-slide-up">
        {renderStepContent()}
      </div>

      {/* Player Selection */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {alivePlayers.map((player) => (
          <button
            key={player.name}
            onClick={() => {
              soundManager.playClick();
              setCurrentTarget(currentTarget === player.name ? null : player.name);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
              currentTarget === player.name
                ? step === "mafia" 
                  ? "bg-primary/20 border-2 border-primary"
                  : "bg-civilian/20 border-2 border-civilian"
                : "bg-secondary/50 border-2 border-transparent hover:border-border"
            }`}
          >
            <span className="font-medium text-foreground">{player.name}</span>
            {currentTarget === player.name && (
              <Check size={20} className={step === "mafia" ? "text-primary" : "text-civilian"} />
            )}
          </button>
        ))}
        
        {/* Skip option */}
        <button
          onClick={() => {
            soundManager.playClick();
            setCurrentTarget(null);
          }}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all ${
            currentTarget === null
              ? "bg-muted border-2 border-muted-foreground"
              : "bg-secondary/30 border-2 border-transparent hover:border-border"
          }`}
        >
          <span className="text-muted-foreground">Skip (no action)</span>
        </button>
      </div>

      {/* Confirm Button */}
      <div className="pt-6">
        <Button
          variant={step === "mafia" ? "mafia" : "civilian"}
          size="xl"
          onClick={handleConfirm}
          className="w-full"
        >
          <ArrowRight size={20} />
          Confirm & Continue
        </Button>
      </div>
    </div>
  );
};
