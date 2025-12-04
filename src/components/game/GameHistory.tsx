import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getGameHistory,
  getPlayerStats,
  clearHistory,
  formatDate,
  type GameRecord,
  type PlayerStats,
} from "@/lib/gameHistory";
import { History, Users, Skull, Shield, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/sounds";

interface GameHistoryProps {
  onClose: () => void;
}

export const GameHistory = ({ onClose }: GameHistoryProps) => {
  const [activeTab, setActiveTab] = useState<"games" | "stats">("stats");
  const [expandedGame, setExpandedGame] = useState<string | null>(null);
  
  const history = getGameHistory();
  const stats = getPlayerStats();

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all game history?")) {
      clearHistory();
      soundManager.playClick();
      onClose();
    }
  };

  const toggleGame = (id: string) => {
    soundManager.playClick();
    setExpandedGame(expandedGame === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="text-primary" size={24} />
          <h1 className="font-display text-2xl font-bold text-foreground">History</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Back
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "stats" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => {
            soundManager.playClick();
            setActiveTab("stats");
          }}
        >
          <Users size={16} />
          Player Stats
        </Button>
        <Button
          variant={activeTab === "games" ? "default" : "outline"}
          size="sm"
          className="flex-1"
          onClick={() => {
            soundManager.playClick();
            setActiveTab("games");
          }}
        >
          <History size={16} />
          Recent Games
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "stats" ? (
          <div className="space-y-3">
            {stats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No games played yet</p>
                <p className="text-xs mt-1">Start a game to track player stats</p>
              </div>
            ) : (
              stats.map((player, index) => (
                <div
                  key={player.name}
                  className="bg-secondary/50 rounded-lg p-4 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{player.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {player.gamesPlayed} games
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Skull size={14} className="text-primary" />
                      <span className="text-muted-foreground">
                        {player.timesMafia} ({Math.round((player.timesMafia / player.gamesPlayed) * 100)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className="text-civilian" />
                      <span className="text-muted-foreground">
                        {player.timesCivilian} ({Math.round((player.timesCivilian / player.gamesPlayed) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>No games recorded</p>
                <p className="text-xs mt-1">Complete a game to see it here</p>
              </div>
            ) : (
              history.map((game, index) => (
                <div
                  key={game.id}
                  className="bg-secondary/50 rounded-lg overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <button
                    className="w-full p-4 flex items-center justify-between text-left"
                    onClick={() => toggleGame(game.id)}
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">{formatDate(game.date)}</p>
                      <p className="font-medium text-foreground">
                        {game.players.length} players
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 text-xs">
                        <span className="text-primary">{game.mafiaCount} mafia</span>
                        <span className="text-civilian">{game.civilianCount} civilian</span>
                      </div>
                      {expandedGame === game.id ? (
                        <ChevronUp size={16} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={16} className="text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  {expandedGame === game.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {game.players.map((player, i) => (
                          <div
                            key={i}
                            className={cn(
                              "text-xs px-2 py-1.5 rounded flex items-center gap-1.5",
                              player.role === "mafia"
                                ? "bg-primary/20 text-primary"
                                : "bg-civilian/20 text-civilian"
                            )}
                          >
                            {player.role === "mafia" ? (
                              <Skull size={12} />
                            ) : (
                              <Shield size={12} />
                            )}
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Clear Button */}
      {history.length > 0 && (
        <div className="pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={handleClearHistory}
          >
            <Trash2 size={16} />
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
};
