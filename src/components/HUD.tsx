import React from 'react';
import { WeaponType } from '../types';

interface HUDProps {
  score: number;
  lives: number;
  weapon: WeaponType;
  isAiActive: boolean;
}

const weaponNames = {
  [WeaponType.Single]: 'SINGLE SHOT',
  [WeaponType.Triple]: 'TRIPLE SHOT',
  [WeaponType.Laser]: 'LASER BEAM',
  [WeaponType.Missile]: 'HOMING MISSILE',
};

const weaponColors = {
  [WeaponType.Single]: 'text-cyan-400',
  [WeaponType.Triple]: 'text-green-400',
  [WeaponType.Laser]: 'text-pink-500',
  [WeaponType.Missile]: 'text-orange-400',
}

const HUD: React.FC<HUDProps> = ({ score, lives, weapon, isAiActive }) => {
  return (
    <>
      <div className="absolute top-0 left-0 w-full p-4 text-white text-xl flex justify-between items-center pointer-events-none">
        <div className="font-bold">
          SCORE: <span className="text-yellow-400">{score}</span>
        </div>
        <div className={`font-bold ${weaponColors[weapon]}`}>
          WEAPON: {weaponNames[weapon]}
        </div>
        <div className="font-bold">
          LIVES: {'❤️'.repeat(lives)}
        </div>
      </div>
      {isAiActive && (
        <div 
          className="absolute top-12 left-1/2 -translate-x-1/2 font-bold text-green-400 text-2xl text-glow"
          style={{ textShadow: '0 0 10px #0f0, 0 0 20px #0f0' }}
        >
          AI AUTOPILOT ENGAGED
        </div>
      )}
    </>
  );
};

export default HUD;
