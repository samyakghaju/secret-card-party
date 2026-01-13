import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ImpostorHeader } from "@/components/impostor/ImpostorHeader";
import { CategorySelect } from "@/components/impostor/CategorySelect";
import { PlayerSetup } from "@/components/impostor/PlayerSetup";
import { ImpostorCard } from "@/components/impostor/ImpostorCard";
import { GamePlay } from "@/components/impostor/GamePlay";
import { getRandomWord, getCategoryById } from "@/lib/impostorData";

type GamePhase = "category" | "players" | "reveal" | "playing";

const ImpostorGame = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [impostorIndex, setImpostorIndex] = useState(0);
  const [secretWord, setSecretWord] = useState("");
  const [impostorHint, setImpostorHint] = useState("");
  const [eliminatedPlayers, setEliminatedPlayers] = useState<string[]>([]);

  const handleClose = () => {
    navigate("/");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleCategoryContinue = () => {
    if (selectedCategory) {
      setPhase("players");
    }
  };

  const initializeGame = useCallback(() => {
    if (!selectedCategory || players.length < 3) return;
    
    // Pick random impostor
    const randomImpostor = Math.floor(Math.random() * players.length);
    setImpostorIndex(randomImpostor);
    
    // Pick random word from category
    const wordData = getRandomWord(selectedCategory);
    setSecretWord(wordData.word);
    setImpostorHint(wordData.hint);
    
    // Reset eliminated players
    setEliminatedPlayers([]);
    
    // Reset to first player
    setCurrentPlayerIndex(0);
    setPhase("reveal");
  }, [selectedCategory, players]);

  const handleStartGame = () => {
    initializeGame();
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(prev => prev + 1);
    } else {
      setPhase("playing");
    }
  };

  const handleEliminatePlayer = (playerName: string) => {
    setEliminatedPlayers(prev => [...prev, playerName]);
  };

  const handlePlayAgain = () => {
    initializeGame();
  };

  const handleNewGame = () => {
    setPhase("category");
    setSelectedCategory(null);
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setImpostorIndex(0);
    setSecretWord("");
    setEliminatedPlayers([]);
  };

  const category = selectedCategory ? getCategoryById(selectedCategory) : null;

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: "linear-gradient(180deg, hsl(0 0% 98%) 0%, hsl(0 0% 94%) 100%)" 
      }}
    >
      <ImpostorHeader onClose={handleClose} />
      
      <div className="flex-1 flex flex-col">
        {phase === "category" && (
          <CategorySelect
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            onContinue={handleCategoryContinue}
          />
        )}
        
        {phase === "players" && (
          <PlayerSetup
            players={players}
            onUpdatePlayers={setPlayers}
            onStartGame={handleStartGame}
            onBack={() => setPhase("category")}
          />
        )}
        
        {phase === "reveal" && selectedCategory && (
          <ImpostorCard
            playerName={players[currentPlayerIndex]}
            isImpostor={currentPlayerIndex === impostorIndex}
            secretWord={secretWord}
            impostorHint={impostorHint}
            categoryId={selectedCategory}
            onNext={handleNextPlayer}
            isLastPlayer={currentPlayerIndex === players.length - 1}
          />
        )}
        
        {phase === "playing" && category && (
          <GamePlay
            players={players}
            impostorIndex={impostorIndex}
            secretWord={secretWord}
            categoryName={category.name}
            eliminatedPlayers={eliminatedPlayers}
            onEliminatePlayer={handleEliminatePlayer}
            onPlayAgain={handlePlayAgain}
            onNewGame={handleNewGame}
          />
        )}
      </div>
    </div>
  );
};

export default ImpostorGame;
