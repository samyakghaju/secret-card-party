import { useState } from "react";
import { Plus, Minus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PlayerSetupProps {
  players: string[];
  onUpdatePlayers: (players: string[]) => void;
  onStartGame: () => void;
  onBack: () => void;
}

export const PlayerSetup = ({ 
  players, 
  onUpdatePlayers, 
  onStartGame,
  onBack 
}: PlayerSetupProps) => {
  const [newPlayerName, setNewPlayerName] = useState("");

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 12) {
      onUpdatePlayers([...players, newPlayerName.trim()]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index: number) => {
    onUpdatePlayers(players.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  const canStart = players.length >= 3;

  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-ink" />
          <span className="text-ink/60 text-sm">{players.length} / 12 players</span>
        </div>
        <h3 className="font-display text-xl font-bold text-ink">Add Players</h3>
        <p className="text-ink/60 text-sm mt-1">
          Minimum 3 players required
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter player name"
          className="flex-1 bg-white/80 border-ink/20 text-ink placeholder:text-ink/40 rounded-xl"
          maxLength={15}
        />
        <button
          onClick={addPlayer}
          disabled={!newPlayerName.trim() || players.length >= 12}
          className="w-12 h-12 rounded-xl bg-ink text-paper flex items-center justify-center disabled:opacity-40"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {players.map((player, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-ink/10"
          >
            <span className="text-ink font-medium">{player}</span>
            <button
              onClick={() => removePlayer(index)}
              className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center hover:bg-ink/20 transition-colors"
            >
              <Minus className="w-4 h-4 text-ink" />
            </button>
          </div>
        ))}
        
        {players.length === 0 && (
          <div className="text-center py-8 text-ink/40">
            <p>No players added yet</p>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-4">
        <button
          onClick={onStartGame}
          disabled={!canStart}
          className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
        >
          <span>▶</span> START GAME
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 rounded-full bg-transparent text-ink/60 font-medium text-sm hover:text-ink transition-colors"
        >
          Back to Categories
        </button>
      </div>
    </div>
  );
};
