import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, Check, Users, Crown, Settings, Play, Loader2 } from "lucide-react";
import { useMultiplayer, GamePlayer } from "@/hooks/useMultiplayer";
import { PLAYER_AVATARS, GameMode } from "@/lib/gameTypes";
import { soundManager } from "@/lib/sounds";
import { useToast } from "@/hooks/use-toast";

interface LobbyScreenProps {
  gameMode: GameMode;
  onStartGame: (players: GamePlayer[], mafiaCount: number, timerMinutes: number) => void;
  onBack: () => void;
}

export const LobbyScreen = ({ gameMode, onStartGame, onBack }: LobbyScreenProps) => {
  const { 
    room, 
    players, 
    currentPlayer, 
    isLoading, 
    isHost,
    createRoom,
    joinRoom, 
    leaveRoom,
    updateRoomSettings 
  } = useMultiplayer();
  
  const [view, setView] = useState<"menu" | "create" | "join">("menu");
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PLAYER_AVATARS[0]);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [mafiaCount, setMafiaCount] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(3);
  const { toast } = useToast();

  const minPlayers = gameMode === "advanced" ? 5 : 3;
  const maxMafia = Math.floor(players.length / 2);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast({ title: "Enter your name", variant: "destructive" });
      return;
    }
    soundManager.playClick();
    const code = await createRoom(playerName.trim(), selectedAvatar, gameMode);
    if (code) {
      toast({ title: "Room created!", description: `Share code: ${code}` });
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !joinCode.trim()) {
      toast({ title: "Enter your name and game code", variant: "destructive" });
      return;
    }
    soundManager.playClick();
    const success = await joinRoom(joinCode.trim(), playerName.trim(), selectedAvatar);
    if (success) {
      toast({ title: "Joined game!" });
    }
  };

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    if (players.length < minPlayers) {
      toast({ 
        title: "Not enough players", 
        description: `Need at least ${minPlayers} players`,
        variant: "destructive" 
      });
      return;
    }
    soundManager.playClick();
    onStartGame(players, mafiaCount, timerMinutes);
  };

  const handleLeave = async () => {
    soundManager.playClick();
    await leaveRoom();
    setView("menu");
  };

  // If in a room, show lobby
  if (room) {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <ArrowLeft size={20} />
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Game Code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                {room.code}
              </span>
              <Button variant="ghost" size="icon" onClick={handleCopyCode} className="h-8 w-8">
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
          <div className="w-10" />
        </div>

        {/* Players List */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-primary" />
            <span className="font-medium">Players ({players.length})</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Min {minPlayers} required
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border ${
                  player.device_id === currentPlayer?.device_id ? 'border-primary' : 'border-border'
                }`}
              >
                <span className="text-2xl">{player.avatar}</span>
                <span className="font-medium flex-1">{player.player_name}</span>
                {player.is_host && (
                  <Crown size={16} className="text-yellow-500" />
                )}
              </div>
            ))}
          </div>

          {/* Host Settings */}
          {isHost && (
            <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Settings size={16} className="text-primary" />
                <span className="font-medium text-sm">Game Settings</span>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Number of Mafia</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3].map((n) => (
                    <Button
                      key={n}
                      variant={mafiaCount === n ? "default" : "outline"}
                      size="sm"
                      disabled={n > maxMafia || players.length < minPlayers}
                      onClick={() => {
                        setMafiaCount(n);
                        updateRoomSettings({ mafia_count: n });
                      }}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Discussion Timer (minutes)</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 5, 10].map((n) => (
                    <Button
                      key={n}
                      variant={timerMinutes === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTimerMinutes(n);
                        updateRoomSettings({ timer_minutes: n });
                      }}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Button (Host only) */}
        {isHost ? (
          <Button 
            size="lg" 
            className="w-full mt-6"
            disabled={players.length < minPlayers}
            onClick={handleStartGame}
          >
            <Play size={20} className="mr-2" />
            Start Game ({players.length}/{minPlayers}+)
          </Button>
        ) : (
          <div className="text-center text-muted-foreground mt-6 p-4 rounded-xl bg-secondary/30">
            <Loader2 className="animate-spin mx-auto mb-2" size={20} />
            Waiting for host to start...
          </div>
        )}
      </div>
    );
  }

  // Menu view
  if (view === "menu") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
        <Button variant="ghost" size="icon" onClick={onBack} className="self-start mb-4">
          <ArrowLeft size={20} />
        </Button>

        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Multiplayer</h1>
            <p className="text-muted-foreground">Play with friends on different devices</p>
          </div>

          <Button 
            size="lg" 
            className="w-full py-8 text-lg"
            onClick={() => {
              soundManager.playClick();
              setView("create");
            }}
          >
            <Crown className="mr-3" size={24} />
            Create Game
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="w-full py-8 text-lg"
            onClick={() => {
              soundManager.playClick();
              setView("join");
            }}
          >
            <Users className="mr-3" size={24} />
            Join Game
          </Button>
        </div>
      </div>
    );
  }

  // Create / Join form
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 max-w-md mx-auto">
      <Button variant="ghost" size="icon" onClick={() => setView("menu")} className="self-start mb-4">
        <ArrowLeft size={20} />
      </Button>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="font-display text-2xl font-bold text-center mb-8">
          {view === "create" ? "Create Game" : "Join Game"}
        </h2>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="text-lg py-6"
              maxLength={20}
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Choose Avatar</label>
            <div className="grid grid-cols-8 gap-2">
              {PLAYER_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    selectedAvatar === avatar 
                      ? 'bg-primary scale-110' 
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Join Code (only for join view) */}
          {view === "join" && (
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Game Code</label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-letter code..."
                className="text-lg py-6 text-center tracking-widest font-mono"
                maxLength={6}
              />
            </div>
          )}

          <Button 
            size="lg" 
            className="w-full"
            disabled={isLoading || !playerName.trim() || (view === "join" && joinCode.length !== 6)}
            onClick={view === "create" ? handleCreateRoom : handleJoinRoom}
          >
            {isLoading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : view === "create" ? (
              <Crown className="mr-2" size={20} />
            ) : (
              <Users className="mr-2" size={20} />
            )}
            {view === "create" ? "Create Room" : "Join Room"}
          </Button>
        </div>
      </div>
    </div>
  );
};
