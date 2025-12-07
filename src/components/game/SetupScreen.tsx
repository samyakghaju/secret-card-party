import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, Users, Skull, ArrowLeft, Clock, RefreshCw } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { GameMode, PLAYER_AVATARS } from "@/lib/gameTypes";

interface SetupScreenProps {
  gameMode: GameMode;
  onStartGame: (players: string[], mafiaCount: number, timerMinutes: number, avatars: string[]) => void;
  onBack: () => void;
}

export const SetupScreen = ({ gameMode, onStartGame, onBack }: SetupScreenProps) => {
  const [players, setPlayers] = useState<string[]>([""]);
  const [playerAvatars, setPlayerAvatars] = useState<string[]>([]);
  const [mafiaCount, setMafiaCount] = useState(1);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [timerMinutes, setTimerMinutes] = useState(3);

  const validPlayers = players.filter((p) => p.trim() !== "");
  const maxMafia = Math.max(1, Math.floor(validPlayers.length / 2) - 1);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      soundManager.playClick();
      const newPlayers = [...players.filter((p) => p.trim() !== ""), newPlayerName.trim()];
      setPlayers(newPlayers);
      // Assign a random avatar from remaining avatars
      const usedAvatars = new Set(playerAvatars);
      const availableAvatars = PLAYER_AVATARS.filter(a => !usedAvatars.has(a));
      const newAvatar = availableAvatars.length > 0 
        ? availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
        : PLAYER_AVATARS[newPlayers.length % PLAYER_AVATARS.length];
      setPlayerAvatars([...playerAvatars, newAvatar]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index: number) => {
    soundManager.playClick();
    const newPlayers = validPlayers.filter((_, i) => i !== index);
    const newAvatars = playerAvatars.filter((_, i) => i !== index);
    setPlayers(newPlayers.length > 0 ? newPlayers : [""]);
    setPlayerAvatars(newAvatars);
    if (mafiaCount > Math.max(1, Math.floor(newPlayers.length / 2) - 1)) {
      setMafiaCount(Math.max(1, Math.floor(newPlayers.length / 2) - 1));
    }
  };

  const cycleAvatar = (index: number) => {
    soundManager.playClick();
    const currentAvatar = playerAvatars[index];
    const currentIdx = PLAYER_AVATARS.indexOf(currentAvatar as typeof PLAYER_AVATARS[number]);
    const nextIdx = (currentIdx + 1) % PLAYER_AVATARS.length;
    const newAvatars = [...playerAvatars];
    newAvatars[index] = PLAYER_AVATARS[nextIdx];
    setPlayerAvatars(newAvatars);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  const minPlayers = gameMode === "advanced" ? 5 : 3;
  const canStartGame = validPlayers.length >= minPlayers && mafiaCount > 0 && mafiaCount < validPlayers.length;

  const handleStartGame = () => {
    soundManager.playGameStart();
    onStartGame(validPlayers, mafiaCount, timerMinutes, playerAvatars);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6 animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="text-muted-foreground"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              {gameMode === "simple" ? "Simple" : "Advanced"} Mode
            </h1>
            <p className="text-muted-foreground text-sm">Add your players</p>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => cycleAvatar(index)}
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl hover:bg-primary/30 transition-colors"
                  title="Click to change avatar"
                >
                  {playerAvatars[index] || PLAYER_AVATARS[index % PLAYER_AVATARS.length]}
                </button>
                <span className="font-medium text-foreground">{player}</span>
              </div>
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
                onClick={() => {
                  soundManager.playClick();
                  setMafiaCount(Math.max(1, mafiaCount - 1));
                }}
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
                onClick={() => {
                  soundManager.playClick();
                  setMafiaCount(Math.min(maxMafia, mafiaCount + 1));
                }}
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

        {/* Timer Duration Selector */}
        {validPlayers.length >= 3 && (
          <div className="space-y-3 pt-4 border-t border-border animate-slide-up">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock size={18} className="text-amber-400" />
              Discussion Timer
            </label>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  soundManager.playClick();
                  setTimerMinutes(Math.max(1, timerMinutes - 1));
                }}
                disabled={timerMinutes <= 1}
              >
                <Minus size={20} />
              </Button>
              
              <div className="w-20 h-16 rounded-xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-amber-400">{timerMinutes} min</span>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  soundManager.playClick();
                  setTimerMinutes(Math.min(10, timerMinutes + 1));
                }}
                disabled={timerMinutes >= 10}
              >
                <Plus size={20} />
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Time for discussion each round
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
          onClick={handleStartGame}
        >
          Start Game
        </Button>
        
        {validPlayers.length < minPlayers && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Add at least {minPlayers} players to start {gameMode === "advanced" && "(for special roles)"}
          </p>
        )}
      </div>
    </div>
  );
};
