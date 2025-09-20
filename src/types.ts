export enum GameState {
  MainMenu,
  Playing,
  GameOver,
}

export enum WeaponType {
  Single,
  Triple,
  Laser,
  Missile,
}

export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  lives: number;
  weapon: WeaponType;
  isInvincible: boolean;
  invincibilityTimer: number;
}

export interface Enemy extends GameObject {
  id: number;
  type: 'asteroid' | 'invader';
  speed: number;
  health: number;
  shape?: { x: number; y: number }[]; // For asteroid polygon
}

export interface Bullet extends GameObject {
  id: number;
  speed: number;
  color: string;
  damage: number;
  type: 'bullet' | 'laser' | 'missile';
  trail?: { x: number; y: number; alpha: number }[];
  targetId?: number | null; // For homing missiles
}

export interface Particle extends GameObject {
  id: number;
  alpha: number;
  color: string;
  velocity: { x: number; y: number; z: number };
  radius: number;
  life: number;
  maxLife: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface HighScore {
  name: string;
  score: number;
}

export interface Keys {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  ' ': boolean; // Space bar
}

export enum BonusItemType {
  Shield,
  Score,
}

export interface BonusItem extends GameObject {
  id: number;
  type: BonusItemType;
  speed: number;
}
