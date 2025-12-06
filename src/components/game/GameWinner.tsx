import { Button } from "@/components/ui/button";
import { Skull, Shield, Trophy } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { Player, isMafiaRole } from "@/lib/gameTypes";

interface GameWinnerProps {
  winner: "mafia" | "town";
  players: Player[];
  onPlayAgain: () => void;
}

export const GameWinner = ({ winner, players, onPlayAgain }: GameWinnerProps) => {
  const isMafiaWin = winner === "mafia";
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="text-center space-y-8 max-w-md w-full animate-slide-up">
        {/* Winner Icon */}
        <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse-glow ${
          isMafiaWin ? 'bg-primary/30' : 'bg-emerald-500/30'
        }`}>
          {isMafiaWin ? (
            <Skull size={64} className="text-primary" />
          ) : (
            <Shield size={64} className="text-emerald-400" />
          )}
        </div>

        {/* Winner Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy size={24} className={isMafiaWin ? 'text-primary' : 'text-emerald-400'} />
            <span className="text-sm uppercase tracking-widest text-muted-foreground">Victory</span>
          </div>
          <h1 className={`font-display text-4xl font-bold ${
            isMafiaWin ? 'text-primary' : 'text-emerald-400'
          }`}>
            {isMafiaWin ? "Mafia Wins!" : "Town Wins!"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isMafiaWin 
              ? "The mafia has taken over the town..."
              : "All mafia members have been eliminated!"}
          </p>
        </div>

        {/* Player Roles Reveal */}
        <div className="bg-secondary/50 rounded-xl p-4 w-full">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Player Roles</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.name} className="flex items-center justify-between">
                <span className={`font-medium ${player.isAlive ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                  {player.name}
                </span>
                <span className={`text-sm capitalize ${
                  isMafiaRole(player.role) ? 'text-primary' : 'text-emerald-400'
                }`}>
                  {player.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <Button
          variant="mafia"
          size="xl"
          onClick={() => {
            soundManager.playClick();
            onPlayAgain();
          }}
          className="w-full"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};
