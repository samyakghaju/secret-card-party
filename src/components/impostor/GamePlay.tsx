import { useState, useEffect } from "react";
import { RotateCcw, Users, Eye, Vote, Skull, Check, X, Trophy } from "lucide-react";

interface GamePlayProps {
  players: string[];
  impostorIndex: number;
  secretWord: string;
  categoryName: string;
  eliminatedPlayers: string[];
  onEliminatePlayer: (playerName: string) => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

type GameResult = "playing" | "impostor_wins" | "civilians_win";

export const GamePlay = ({
  players,
  impostorIndex,
  secretWord,
  categoryName,
  eliminatedPlayers,
  onEliminatePlayer,
  onPlayAgain,
  onNewGame
}: GamePlayProps) => {
  const [showImpostor, setShowImpostor] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [votingMode, setVotingMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showVoteResult, setShowVoteResult] = useState(false);
  const [lastVotedPlayer, setLastVotedPlayer] = useState<string | null>(null);

  const impostorName = players[impostorIndex];
  const alivePlayers = players.filter(p => !eliminatedPlayers.includes(p));
  const impostorEliminated = eliminatedPlayers.includes(impostorName);
  
  // Count alive civilians (everyone except impostor)
  const aliveCivilians = alivePlayers.filter(p => p !== impostorName).length;
  const aliveImpostors = impostorEliminated ? 0 : 1;

  // Determine game result
  const getGameResult = (): GameResult => {
    if (impostorEliminated) {
      return "civilians_win";
    }
    // Impostor wins if impostor count >= civilian count
    if (aliveImpostors >= aliveCivilians) {
      return "impostor_wins";
    }
    return "playing";
  };

  const gameResult = getGameResult();

  const handleVote = (player: string) => {
    setSelectedPlayer(player);
  };

  const handleConfirmVote = () => {
    if (selectedPlayer) {
      setLastVotedPlayer(selectedPlayer);
      onEliminatePlayer(selectedPlayer);
      setShowVoteResult(true);
      setSelectedPlayer(null);
      setVotingMode(false);
    }
  };

  const handleCancelVote = () => {
    setSelectedPlayer(null);
  };

  const handleContinueAfterVote = () => {
    setShowVoteResult(false);
    setLastVotedPlayer(null);
  };

  // Vote result screen (shown after voting)
  if (showVoteResult && lastVotedPlayer) {
    const wasImpostor = lastVotedPlayer === impostorName;
    
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 animate-slide-up">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
              wasImpostor ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {wasImpostor ? (
                <Check size={48} className="text-green-500" />
              ) : (
                <X size={48} className="text-red-500" />
              )}
            </div>
            
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-2">
                {lastVotedPlayer}
              </h2>
              <p className={`text-xl font-display ${
                wasImpostor ? 'text-green-500' : 'text-red-500'
              }`}>
                {wasImpostor ? "WAS THE IMPOSTOR!" : "was NOT the impostor"}
              </p>
            </div>
            
            <p className="text-ink/60">
              {wasImpostor 
                ? "Congratulations! You found the impostor!"
                : "An innocent player was eliminated..."}
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-6">
          <button
            onClick={handleContinueAfterVote}
            className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Voting confirmation modal
  if (selectedPlayer) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 animate-slide-up">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-amber-500/20">
              <Vote size={48} className="text-amber-500" />
            </div>
            
            <div>
              <h2 className="font-display text-2xl font-bold text-ink mb-2">
                Vote for {selectedPlayer}?
              </h2>
              <p className="text-ink/60">
                Are you sure you want to eliminate this player?
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-6">
          <button
            onClick={handleConfirmVote}
            className="w-full py-4 rounded-full bg-red-500 text-white font-semibold text-lg"
          >
            Confirm Elimination
          </button>
          <button
            onClick={handleCancelVote}
            className="w-full py-3 rounded-full bg-transparent text-ink/60 font-medium hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Voting mode screen
  if (votingMode) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2 text-amber-500">
            <Vote size={20} />
            <span className="text-sm font-medium uppercase tracking-wider">Voting</span>
          </div>
          <h3 className="font-display text-xl font-bold text-ink">Who is the Impostor?</h3>
          <p className="text-ink/60 text-sm mt-1">
            Vote to eliminate a player
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {alivePlayers.map((player) => (
            <button
              key={player}
              onClick={() => handleVote(player)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/50 border-2 border-transparent hover:border-ink/20 transition-all"
            >
              <span className="font-medium text-ink">{player}</span>
              <Vote size={18} className="text-ink/40" />
            </button>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setVotingMode(false)}
            className="w-full py-3 rounded-full bg-transparent text-ink/60 font-medium hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Game over - Civilians win
  if (gameResult === "civilians_win") {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 animate-slide-up">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-green-500/20">
              <Trophy size={48} className="text-green-500" />
            </div>
            
            <div>
              <h2 className="font-display text-3xl font-bold text-green-600 mb-2">
                🎉 Civilians Win! 🎉
              </h2>
              <p className="text-ink/60 text-lg">
                The impostor has been found and eliminated!
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-ink/60 text-sm mb-2">The Impostor was</p>
              <p className="font-bold text-red-500 text-xl">{impostorName}</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-ink/60 text-sm mb-2">The Secret Word was</p>
              <p className="font-bold text-ink text-xl">{secretWord}</p>
            </div>
          </div>
        </div>

        {/* Eliminated players */}
        {eliminatedPlayers.length > 0 && (
          <div className="bg-red-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-sm font-medium">Eliminated</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {eliminatedPlayers.map((player) => (
                <span
                  key={player}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    player === impostorName 
                      ? 'bg-red-500 text-white' 
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {player} {player === impostorName && "(Impostor)"}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
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
  }

  // Game over - Impostor wins
  if (gameResult === "impostor_wins") {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-6 animate-slide-up">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-red-500/20">
              <Skull size={48} className="text-red-500" />
            </div>
            
            <div>
              <h2 className="font-display text-3xl font-bold text-red-600 mb-2">
                😈 Impostor Wins! 😈
              </h2>
              <p className="text-ink/60 text-lg">
                The impostor remained hidden and took over!
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-ink/60 text-sm mb-2">The Impostor was</p>
              <p className="font-bold text-red-500 text-xl">{impostorName}</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4">
              <p className="text-ink/60 text-sm mb-2">The Secret Word was</p>
              <p className="font-bold text-ink text-xl">{secretWord}</p>
            </div>
          </div>
        </div>

        {/* Eliminated players */}
        {eliminatedPlayers.length > 0 && (
          <div className="bg-red-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Skull className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-sm font-medium">Eliminated</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {eliminatedPlayers.map((player) => (
                <span
                  key={player}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700"
                >
                  {player}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-full bg-ink text-paper font-semibold text-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
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
  }

  // Main gameplay screen
  return (
    <div className="flex flex-col h-full p-4">
      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-bold text-ink">Game In Progress</h3>
        <p className="text-ink/60 text-sm mt-1">
          Discuss and find the impostor!
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Alive Players list */}
        <div className="bg-white/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-ink/60" />
            <span className="text-ink/60 text-sm font-medium">Alive Players ({alivePlayers.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {alivePlayers.map((player) => (
              <span
                key={player}
                className="px-3 py-1.5 rounded-full bg-ink/10 text-ink text-sm font-medium"
              >
                {player}
              </span>
            ))}
          </div>
        </div>

        {/* Eliminated Players */}
        {eliminatedPlayers.length > 0 && (
          <div className="bg-red-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skull className="w-4 h-4 text-red-500" />
              <span className="text-red-500 text-sm font-medium">Dead ({eliminatedPlayers.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {eliminatedPlayers.map((player) => (
                <span
                  key={player}
                  className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium line-through"
                >
                  {player}
                </span>
              ))}
            </div>
          </div>
        )}

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
              <span className="font-bold text-red-500">{impostorName}</span>
            ) : (
              <Eye className="w-5 h-5 text-ink/40" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <button
          onClick={() => setVotingMode(true)}
          className="w-full py-4 rounded-full bg-amber-500 text-white font-semibold text-lg flex items-center justify-center gap-2"
        >
          <Vote className="w-5 h-5" />
          Vote to Eliminate
        </button>
        <button
          onClick={onPlayAgain}
          className="w-full py-3 rounded-full bg-ink text-paper font-semibold flex items-center justify-center gap-2"
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