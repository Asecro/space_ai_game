import { WeaponType } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 50;
export const PLAYER_SPEED = 5;
export const INITIAL_LIVES = 3;

export const BULLET_WIDTH = 5;
export const BULLET_HEIGHT = 15;
export const LASER_WIDTH = 8;
export const LASER_HEIGHT = 40;

export const ENEMY_SPAWN_RATE = 1000; // ms

export const STAR_COUNT = 200;

export const MAX_HIGH_SCORES = 10;

export const SCORE_FOR_EXTRA_LIFE = 2000;

export const INVINCIBILITY_DURATION = 15000; // 15 seconds in ms

export const BONUS_ITEM_SIZE = 30;
export const BONUS_ITEM_SPEED = 2;
export const BONUS_ITEM_SPAWN_CHANCE = 0.15; // 15% chance

export const WEAPON_CONFIGS = {
  [WeaponType.Single]: {
    cooldown: 200,
    color: '#00FFFF', // Cyan
    damage: 1,
    speed: 8,
  },
  [WeaponType.Triple]: {
    cooldown: 400,
    color: '#00FF00', // Green
    damage: 1,
    speed: 8,
  },
  [WeaponType.Laser]: {
    cooldown: 300,
    color: '#FF00FF', // Magenta
    damage: 3,
    speed: 12,
  },
  [WeaponType.Missile]: {
    cooldown: 600,
    color: '#FFA500', // Orange
    damage: 5,
    speed: 4,
  },
};