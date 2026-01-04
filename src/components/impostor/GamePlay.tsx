import { useState } from "react";
import { RotateCcw, Users, Eye } from "lucide-react";

interface GamePlayProps {
  players: string[];
  impostorIndex: number;
  secretWord: string;
  categoryName: string;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export const GamePlay = ({
  players,
  impostorIndex,
  secretWord,
  categoryName,
  onPlayAgain,
  onNewGame
}: GamePlayProps) => {
  const [showImpostor, setShowImpostor] = useState(false);
  const [showWord, setShowWord] = useState(false);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold text-ink">Game In Progress</h3>
        <p className="text-ink/60 text-sm mt-1">
          Discuss and find the impostor!
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Players list */}
        <div className="bg-white/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-ink/60" />
            <span className="text-ink/60 text-sm font-medium">Players</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {players.map((player, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full bg-ink/10 text-ink text-sm font-medium"
              >
                {player}
              </span>
            ))}
          </div>
        </div>

        {/* Category info */}
        <div className="bg-white/50 rounded-2xl p-4">
          <p className="text-ink/60 text-sm">Category</p>
          <p className="text-ink font-semibold text-lg">{categoryName}</p>
        </div>

        {/* Reveal buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setShowWord(!showWord)}
            className="w-full p-4 rounded-2xl bg-cyan-100 border-2 border-cyan-200 flex items-center justify-between"
          >
            <span className="text-ink font-medium">Secret Word</span>
            {showWord ? (
              <span className="font-bold text-ink">{secretWord}</span>
            ) : (
              <Eye className="w-5 h-5 text-ink/40" />
            )}
          </button>

          <button
            onClick={() => setShowImpostor(!showImpostor)}
            className="w-full p-4 rounded-2xl bg-pink-100 border-2 border-pink-200 flex items-center justify-between"
          >
            <span className="text-ink font-medium">The Impostor</span>
            {showImpostor ? (
              <span className="font-bold text-red-500">{players[impostorIndex]}</span>
            ) : (
              <Eye className="w-5 h-5 text-ink/40" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again (Same Players)
        </button>
        <button
          onClick={onNewGame}
          className="w-full py-3 rounded-full bg-transparent text-ink/60 font-medium hover:text-ink transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
};
