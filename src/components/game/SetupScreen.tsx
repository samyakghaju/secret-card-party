import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, Users, Skull } from "lucide-react";

interface SetupScreenProps {
  onStartGame: (players: string[], mafiaCount: number) => void;
}

export const SetupScreen = ({ onStartGame }: SetupScreenProps) => {
  const [players, setPlayers] = useState<string[]>([""]);
  const [mafiaCount, setMafiaCount] = useState(1);
  const [newPlayerName, setNewPlayerName] = useState("");

  const validPlayers = players.filter((p) => p.trim() !== "");
  const maxMafia = Math.max(1, Math.floor(validPlayers.length / 2) - 1);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players.filter((p) => p.trim() !== ""), newPlayerName.trim()]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index: number) => {
    const newPlayers = validPlayers.filter((_, i) => i !== index);
    setPlayers(newPlayers.length > 0 ? newPlayers : [""]);
    if (mafiaCount > Math.max(1, Math.floor(newPlayers.length / 2) - 1)) {
      setMafiaCount(Math.max(1, Math.floor(newPlayers.length / 2) - 1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  const canStartGame = validPlayers.length >= 3 && mafiaCount > 0 && mafiaCount < validPlayers.length;

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2 tracking-tight">
          Secret <span className="text-primary">Mafia</span>
        </h1>
        <p className="text-muted-foreground text-sm">Who can you trust?</p>
      </div>

      {/* Player Input Section */}
      <div className="flex-1 space-y-6">
        <div className="space-y-3" style={{ animationDelay: "0.1s" }}>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Users size={18} />
            Players ({validPlayers.length})
          </label>
          
          <div className="flex gap-2">
            <Input
              placeholder="Enter player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              onClick={addPlayer}
              disabled={!newPlayerName.trim()}
              size="icon"
              className="h-12 w-12"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Player List */}
        <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
          {validPlayers.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="font-medium text-foreground">{player}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePlayer(index)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>

        {/* Mafia Count Selector */}
        {validPlayers.length >= 3 && (
          <div className="space-y-3 pt-4 border-t border-border animate-slide-up">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Skull size={18} className="text-primary" />
              Number of Mafia
            </label>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMafiaCount(Math.max(1, mafiaCount - 1))}
                disabled={mafiaCount <= 1}
              >
                <Minus size={20} />
              </Button>
              
              <div className="w-16 h-16 rounded-xl bg-primary/20 border-2 border-primary flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-primary">{mafiaCount}</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMafiaCount(Math.min(maxMafia, mafiaCount + 1))}
                disabled={mafiaCount >= maxMafia}
              >
                <Plus size={20} />
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              {mafiaCount} mafia vs {validPlayers.length - mafiaCount} civilians
            </p>
          </div>
        )}
      </div>

      {/* Start Button */}
      <div className="pt-6">
        <Button
          variant="mafia"
          size="xl"
          className="w-full"
          disabled={!canStartGame}
          onClick={() => onStartGame(validPlayers, mafiaCount)}
        >
          Start Game
        </Button>
        
        {validPlayers.length < 3 && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Add at least 3 players to start
          </p>
        )}
      </div>
    </div>
  );
};
