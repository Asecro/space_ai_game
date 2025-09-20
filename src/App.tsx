import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import GameOverScreen from './components/GameOverScreen';
import { GameState, HighScore } from './types';
import { MAX_HIGH_SCORES } from './constants';
import { initAudio } from './utils/audio';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MainMenu);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);

  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('highScores');
      if (savedScores) {
        setHighScores(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error("Failed to load high scores:", error);
      setHighScores([]);
    }
  }, []);

  const startGame = useCallback(() => {
    initAudio();
    setScore(0);
    setGameState(GameState.Playing);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState(GameState.GameOver);
  }, []);

  const handleReturnToMenu = useCallback((name: string, finalScore: number) => {
    if (finalScore > 0 && (highScores.length < MAX_HIGH_SCORES || finalScore > (highScores[highScores.length - 1]?.score ?? 0))) {
      const newScore: HighScore = { name, score: finalScore };
      const newHighScores = [...highScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_HIGH_SCORES);
      
      setHighScores(newHighScores);
      try {
        localStorage.setItem('highScores', JSON.stringify(newHighScores));
      } catch (error) {
        console.error("Failed to save high scores:", error);
      }
    }
    setGameState(GameState.MainMenu);
  }, [highScores]);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Playing:
        return <GameCanvas setScore={setScore} onGameOver={handleGameOver} />;
      case GameState.GameOver:
        return <GameOverScreen score={score} highScores={highScores} onReturnToMenu={handleReturnToMenu} />;
      case GameState.MainMenu:
      default:
        return <MainMenu onStartGame={startGame} highScores={highScores} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default App;
