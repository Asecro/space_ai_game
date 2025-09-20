import React, { useState } from 'react';
import { HighScore } from '../types';

interface GameOverScreenProps {
  score: number;
  highScores: HighScore[];
  onReturnToMenu: (name: string, score: number) => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScores, onReturnToMenu }) => {
  const [name, setName] = useState('');

  const isHighScore = score > 0 && (highScores.length < 10 || score > (highScores[highScores.length - 1]?.score ?? 0));

  const handleReturn = () => {
    const finalName = isHighScore && !name.trim() ? 'PILOT' : name.trim();
    onReturnToMenu(finalName, score);
  };

  return (
    <div className="w-[800px] h-[600px] bg-black bg-opacity-70 border-2 border-red-500 box-glow text-white flex flex-col items-center justify-center p-8 rounded-lg">
      <h1 className="text-6xl font-bold mb-4 text-glow" style={{ textShadow: '0 0 15px #ff0000' }}>GAME OVER</h1>
      <p className="text-3xl mb-6">Your Final Score: <span className="text-yellow-400">{score}</span></p>

      {isHighScore && (
        <div className="flex flex-col items-center mb-6">
          <p className="text-2xl text-green-400 mb-2">New High Score!</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 10))}
            placeholder="ENTER YOUR NAME"
            maxLength={10}
            className="bg-transparent border-2 border-cyan-400 text-center text-xl p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 w-64"
          />
        </div>
      )}

      <button
        onClick={handleReturn}
        className="px-8 py-4 text-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-transform transform hover:scale-105 border-2 border-cyan-200"
      >
        TOP画面に戻る
      </button>

      <div className="w-full max-w-sm mt-8">
        <h2 className="text-3xl text-center mb-4 text-glow">High Scores</h2>
        <ol className="list-decimal list-inside text-xl space-y-1">
          {highScores.map((s, index) => (
            <li key={index} className="flex justify-between px-4 py-1 bg-black bg-opacity-30 rounded">
              <span>{index + 1}. {s.name}</span>
              <span>{s.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default GameOverScreen;