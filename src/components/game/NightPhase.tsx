import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Skull, Heart, Search, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, GameMode, isMafiaRole } from "@/lib/gameTypes";
import { speak } from "@/lib/speech";
import { cn } from "@/lib/utils";

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
  const [showInvestigationResult, setShowInvestigationResult] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<{ name: string; isMafia: boolean } | null>(null);
  
  const alivePlayers = players.filter(p => p.isAlive);
  const hasDoctor = gameMode === "advanced" && players.some(p => p.role === "doctor" && p.isAlive);
  const hasDetective = gameMode === "advanced" && players.some(p => p.role === "detective" && p.isAlive);

  // Calculate turn order for indicators
  const turnOrder = ["mafia", hasDoctor ? "doctor" : null, hasDetective ? "detective" : null].filter(Boolean) as NightStep[];
  const currentTurnIndex = turnOrder.indexOf(step);

  // Start ambient and speak announcements when step changes
  useEffect(() => {
    soundManager.startNightAmbient();
    
    if (step === "doctor") {
      speak("Doctor, open your eyes");
    } else if (step === "detective") {
      speak("Detective, open your eyes");
    }

    return () => {
      soundManager.stopAmbient();
    };
  }, [step]);
  
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
    
    // Speak close eyes announcement based on current step
    if (step === "mafia") {
      speak("Mafia, close your eyes");
    } else if (step === "doctor") {
      speak("Doctor, close your eyes");
    } else if (step === "detective") {
      // Show investigation result before closing
      if (detectiveTarget) {
        const targetPlayer = players.find(p => p.name === detectiveTarget);
        if (targetPlayer) {
          const isMafia = isMafiaRole(targetPlayer.role);
          setInvestigationResult({ name: detectiveTarget, isMafia });
          setShowInvestigationResult(true);
          return; // Wait for detective to see result before continuing
        }
      }
      speak("Detective, close your eyes");
    }
    
    const next = getNextStep(step);
    if (next === "complete") {
      onNightEnd(mafiaTarget, doctorTarget, detectiveTarget);
    } else {
      setStep(next);
    }
  };

  const handleInvestigationDismiss = () => {
    setShowInvestigationResult(false);
    speak("Detective, close your eyes", () => {
      const next = getNextStep(step);
      if (next === "complete") {
        onNightEnd(mafiaTarget, doctorTarget, detectiveTarget);
      } else {
        setStep(next);
      }
    });
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

  // Show investigation result overlay
  if (showInvestigationResult && investigationResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto">
        <div className="text-center space-y-6 animate-slide-up">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center animate-pulse-glow ${
            investigationResult.isMafia ? 'bg-primary/20' : 'bg-civilian/20'
          }`}>
            <Search size={48} className={investigationResult.isMafia ? 'text-primary' : 'text-civilian'} />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Investigation Result
          </h2>
          <p className="text-muted-foreground">
            Only the Detective should see this:
          </p>
          <p className={`font-display text-xl font-bold ${
            investigationResult.isMafia ? 'text-primary' : 'text-civilian'
          }`}>
            {investigationResult.name} is {investigationResult.isMafia ? 'SUSPICIOUS' : 'INNOCENT'}
          </p>
          <Button
            variant="civilian"
            size="xl"
            onClick={handleInvestigationDismiss}
            className="mt-8"
          >
            <ArrowRight size={20} />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4 text-primary">
        <Moon size={20} />
        <span className="text-sm font-medium uppercase tracking-wider">Night Phase</span>
      </div>

      {/* Turn Indicators */}
      <div className="flex justify-center gap-3 mb-6">
        {turnOrder.map((turnStep, index) => {
          const isActive = step === turnStep;
          const isPast = index < currentTurnIndex;
          
          const getIcon = () => {
            switch (turnStep) {
              case "mafia": return <Skull size={16} />;
              case "doctor": return <Heart size={16} />;
              case "detective": return <Search size={16} />;
              default: return null;
            }
          };

          const getLabel = () => {
            switch (turnStep) {
              case "mafia": return "Mafia";
              case "doctor": return "Doctor";
              case "detective": return "Detective";
              default: return "";
            }
          };

          return (
            <div
              key={turnStep}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                isActive && "bg-primary/20 border border-primary scale-110",
                isPast && "opacity-50",
                !isActive && !isPast && "opacity-30"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}>
                {isPast ? <Check size={16} /> : getIcon()}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {getLabel()}
              </span>
              {isActive && (
                <div className="flex items-center gap-1 text-primary">
                  <Eye size={12} className="animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
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
            <div className="flex items-center gap-3">
              <span className="text-xl">{player.avatar}</span>
              <span className="font-medium text-foreground">{player.name}</span>
            </div>
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
