import React from 'react';
import { HighScore } from '../types';

interface MainMenuProps {
  onStartGame: () => void;
  highScores: HighScore[];
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, highScores }) => {
  return (
    <div className="w-[800px] h-[600px] bg-black bg-opacity-70 border-2 border-cyan-400 box-glow text-white flex flex-col items-center justify-center p-8 rounded-lg">
      <h1 className="text-6xl font-bold mb-4 text-center leading-tight rainbow-text-glow">GEMENI KEITA AI Space Atacck</h1>
      <div className="text-lg text-cyan-300 mb-8">
        <p>ARROWS to move</p>
        <p>SPACE to shoot</p>
        <p>Q to change weapon</p>
        <p>I for AI Pilot</p>
      </div>
      
      <button
        onClick={onStartGame}
        className="px-8 py-4 mb-8 text-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-transform transform hover:scale-105 border-2 border-cyan-200"
      >
        START GAME
      </button>

      <div className="w-full max-w-sm">
        <h2 className="text-3xl text-center mb-4 text-glow">High Scores</h2>
        <ol className="list-decimal list-inside text-xl space-y-1">
          {highScores.length > 0 ? (
            highScores.map((score, index) => (
              <li key={index} className="flex justify-between px-4 py-1 bg-black bg-opacity-30 rounded">
                <span>{index + 1}. {score.name}</span>
                <span>{score.score}</span>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-400">No scores yet. Be the first!</p>
          )}
        </ol>
      </div>
    </div>
  );
};

export default MainMenu;
