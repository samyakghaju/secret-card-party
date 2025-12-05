import { Button } from "@/components/ui/button";
import { History, Volume2, VolumeX, Zap, Sparkles, Shield, Search, Heart, Skull, Users } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { GameMode } from "@/lib/gameTypes";

interface ModeSelectScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onShowHistory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ModeSelectScreen = ({ 
  onSelectMode, 
  onShowHistory, 
  soundEnabled, 
  onToggleSound 
}: ModeSelectScreenProps) => {
  const handleSelectMode = (mode: GameMode) => {
    soundManager.playClick();
    onSelectMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="flex justify-between items-start mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              soundManager.playClick();
              onShowHistory();
            }}
            className="text-muted-foreground"
          >
            <History size={20} />
          </Button>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
              Secret <span className="text-primary">Mafia</span>
            </h1>
            <p className="text-muted-foreground text-sm">Who can you trust?</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSound}
            className="text-muted-foreground"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex-1 flex flex-col justify-center space-y-6">
        <h2 className="text-center text-lg font-medium text-foreground animate-slide-up">
          Choose Game Mode
        </h2>

        {/* Simple Mode Card */}
        <button
          onClick={() => handleSelectMode("simple")}
          className="w-full p-6 rounded-2xl bg-secondary/50 border-2 border-border hover:border-primary/50 hover:bg-secondary transition-all duration-300 text-left animate-slide-up group"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Simple</h3>
              <p className="text-xs text-muted-foreground">Quick & Classic</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Skull size={14} className="text-primary" />
              <span>Mafia vs Civilians</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-primary" />
              <span>Voting to eliminate</span>
            </div>
            <p className="text-xs mt-2 text-muted-foreground/70">Minimum 3 players</p>
          </div>
        </button>

        {/* Advanced Mode Card */}
        <button
          onClick={() => handleSelectMode("advanced")}
          className="w-full p-6 rounded-2xl bg-secondary/50 border-2 border-border hover:border-primary/50 hover:bg-secondary transition-all duration-300 text-left animate-slide-up group"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Advanced</h3>
              <p className="text-xs text-muted-foreground">Special Roles & Abilities</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Skull size={14} className="text-primary" />
              <span>Godfather & Mafioso</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-green-500" />
              <span>Doctor can save</span>
            </div>
            <div className="flex items-center gap-2">
              <Search size={14} className="text-blue-500" />
              <span>Detective investigates</span>
            </div>
            <p className="text-xs mt-2 text-muted-foreground/70">Minimum 5 players • Day/Night phases</p>
          </div>
        </button>
      </div>
    </div>
  );
};
