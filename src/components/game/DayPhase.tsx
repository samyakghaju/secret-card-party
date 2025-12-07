import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "./Timer";
import { Sun, Skull, Heart, AlertTriangle, ArrowRight } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, isMafiaRole } from "@/lib/gameTypes";

interface DayPhaseProps {
  players: Player[];
  nightResult: {
    eliminated: string | null;
    saved: boolean;
  } | null;
  roundNumber: number;
  timerMinutes: number;
  onStartVoting: () => void;
}

export const DayPhase = ({ players, nightResult, roundNumber, timerMinutes, onStartVoting }: DayPhaseProps) => {
  const [showResult, setShowResult] = useState(true);
  
  const alivePlayers = players.filter(p => p.isAlive);
  const aliveMafia = alivePlayers.filter(p => isMafiaRole(p.role)).length;
  const aliveTown = alivePlayers.length - aliveMafia;

  useEffect(() => {
    // Start day ambient
    soundManager.startDayAmbient();
    
    if (nightResult?.eliminated && !nightResult.saved) {
      soundManager.playMafiaReveal();
    } else {
      soundManager.playCivilianReveal();
    }

    return () => {
      soundManager.stopAmbient();
    };
  }, [nightResult]);

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4 text-amber-400">
        <Sun size={20} />
        <span className="text-sm font-medium uppercase tracking-wider">Day {roundNumber}</span>
      </div>

      {/* Night Result */}
      {showResult && nightResult && (
        <div className="mb-6 animate-slide-up">
          {nightResult.eliminated && !nightResult.saved ? (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
              <Skull size={32} className="mx-auto mb-2 text-primary" />
              <p className="font-display text-lg font-bold text-foreground">
                {nightResult.eliminated} was eliminated!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The town mourns their loss...
              </p>
            </div>
          ) : nightResult.saved ? (
            <div className="bg-civilian/10 border border-civilian/30 rounded-xl p-4 text-center">
              <Heart size={32} className="mx-auto mb-2 text-civilian" />
              <p className="font-display text-lg font-bold text-foreground">
                No one was killed!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The Doctor saved someone...
              </p>
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <Sun size={32} className="mx-auto mb-2 text-amber-400" />
              <p className="font-display text-lg font-bold text-foreground">
                A peaceful night
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                No one was targeted
              </p>
            </div>
          )}
          
        </div>
      )}

      {/* Alive Players Count */}
      <div className="flex justify-center gap-8 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-primary">{aliveMafia}</p>
          <p className="text-xs text-muted-foreground">Mafia Alive</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-civilian">{aliveTown}</p>
          <p className="text-xs text-muted-foreground">Town Alive</p>
        </div>
      </div>

      {/* Discussion Timer */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <Timer defaultMinutes={timerMinutes} />
      </div>

      {/* Alive Players */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Remaining Players ({alivePlayers.length})
        </h3>
        <div className="space-y-2 max-h-[30vh] overflow-y-auto">
          {alivePlayers.map((player, i) => (
            <div
              key={player.name}
              className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3 animate-slide-up"
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
            >
              <span className="font-medium text-foreground">{player.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
        <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200">
          Discuss who might be the Mafia. When ready, start the vote to eliminate a suspect.
        </p>
      </div>

      {/* Start Voting Button */}
      <div className="pt-6">
        <Button
          variant="mafia"
          size="xl"
          onClick={() => {
            soundManager.playClick();
            onStartVoting();
          }}
          className="w-full"
        >
          <ArrowRight size={20} />
          Start Voting
        </Button>
      </div>
    </div>
  );
};
