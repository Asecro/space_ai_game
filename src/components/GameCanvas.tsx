import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Player, Bullet, Enemy, Particle, Star, WeaponType, BonusItem, BonusItemType, Keys, GameObject } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  INITIAL_LIVES,
  BULLET_WIDTH,
  BULLET_HEIGHT,
  LASER_WIDTH,
  LASER_HEIGHT,
  ENEMY_SPAWN_RATE,
  STAR_COUNT,
  WEAPON_CONFIGS,
  SCORE_FOR_EXTRA_LIFE,
  INVINCIBILITY_DURATION,
  BONUS_ITEM_SIZE,
  BONUS_ITEM_SPEED,
  BONUS_ITEM_SPAWN_CHANCE,
} from '../constants';
import { useGameInput } from '../hooks/useGameInput';
import HUD from './HUD';
import { playShootSound, playExplosionSound, playPowerupSound, playPlayerHitSound, playLaserSound, playMissileSound } from '../utils/audio';

interface GameCanvasProps {
  setScore: React.Dispatch<React.SetStateAction<number>>;
  onGameOver: (finalScore: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ setScore, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { keysRef, lastKeyPressedRef, clearLastKey } = useGameInput();

  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    lives: INITIAL_LIVES,
    weapon: WeaponType.Single,
    isInvincible: false,
    invincibilityTimer: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const smokeParticlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const bonusItemsRef = useRef<BonusItem[]>([]);
  const scoreRef = useRef(0);
  const nextLifeScoreRef = useRef(SCORE_FOR_EXTRA_LIFE);
  const lastShotTimeRef = useRef(0);
  const lastEnemySpawnTimeRef = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef(Date.now());
  const aiModeRef = useRef(false);

  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>(WeaponType.Single);
  const [currentLives, setCurrentLives] = useState<number>(INITIAL_LIVES);
  const [isAiActive, setIsAiActive] = useState(false);

  const createExplosion = useCallback((x: number, y: number, enemyColor: string, size: number) => {
    const particleCount = size * 5;
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF', enemyColor];
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (size / 4) + 1;
        const maxLife = Math.random() * 80 + 40; // Longer life for fireworks
        particlesRef.current.push({
            id: Math.random(),
            x, y, width: 0, height: 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            radius: Math.random() * 2 + 1,
            life: maxLife, maxLife: maxLife,
            velocity: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
                z: 0,
            },
      });
    }
    playExplosionSound();
  }, []);
  
  const spawnBonusItem = useCallback((x: number, y: number) => {
    if (Math.random() < BONUS_ITEM_SPAWN_CHANCE) {
      bonusItemsRef.current.push({
        id: Math.random(),
        x, y,
        width: BONUS_ITEM_SIZE,
        height: BONUS_ITEM_SIZE,
        type: Math.random() < 0.5 ? BonusItemType.Shield : BonusItemType.Score,
        speed: BONUS_ITEM_SPEED,
      });
    }
  }, []);

  const runAiLogic = useCallback((player: Player, enemies: Enemy[], bonusItems: BonusItem[], keys: Keys) => {
    // Reset keys for AI control
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys[' '] = false;
  
    const findClosest = <T extends GameObject>(source: GameObject, targets: T[]): T | null => {
      let closest: T | null = null;
      let minDistance = Infinity;
      targets.forEach(target => {
        const distance = Math.hypot(source.x - target.x, source.y - target.y);
        if (distance < minDistance) {
          minDistance = distance;
          closest = target;
        }
      });
      return closest;
    };
  
    // --- ENHANCED DODGING LOGIC ---
    let bestDodgeDirection: 'left' | 'right' | null = null;
    let highestThreatLevel = -1;
    const safeZoneWidth = player.width * 1.5;

    for (const enemy of enemies) {
        // Time (in frames/updates) for the enemy to reach the player's current y-level
        const timeToReachPlayerY = (player.y - enemy.y) / enemy.speed;

        // Consider enemies that are an imminent threat (e.g., will arrive in < 1.5 seconds at 60fps)
        if (timeToReachPlayerY > 0 && timeToReachPlayerY < 90) { 
            const predictedEnemyCenterX = enemy.x + enemy.width / 2;
            const playerCenterX = player.x + player.width / 2;
            const horizontalDistance = Math.abs(playerCenterX - predictedEnemyCenterX);

            // Check if the enemy's path intersects with the player's safe zone
            if (horizontalDistance < (safeZoneWidth / 2 + enemy.width / 2)) {
                const threatLevel = 1 / timeToReachPlayerY; // Closer threats have higher levels
                if (threatLevel > highestThreatLevel) {
                    highestThreatLevel = threatLevel;
                    // Dodge away from the predicted collision point.
                    // If the enemy is to the left, dodge right, and vice-versa.
                     if (predictedEnemyCenterX < playerCenterX) {
                        bestDodgeDirection = 'right';
                    } else {
                        bestDodgeDirection = 'left';
                    }
                }
            }
        }
    }
  
    if (bestDodgeDirection) {
        // Execute the dodge
        if (bestDodgeDirection === 'left') {
            keys.ArrowLeft = true;
        } else {
            keys.ArrowRight = true;
        }
    } else {
      // --- TARGETING LOGIC (If no immediate need to dodge) ---
      const closestBonus = findClosest(player, bonusItems);
      const closestEnemy = findClosest(player, enemies);
      const target = closestBonus || closestEnemy; // Prioritize bonus items
  
      if (target) {
        const targetCenterX = target.x + target.width / 2;
        const playerCenterX = player.x + player.width / 2;
        if (Math.abs(targetCenterX - playerCenterX) > PLAYER_SPEED) {
          if (targetCenterX < playerCenterX) {
            keys.ArrowLeft = true;
          } else {
            keys.ArrowRight = true;
          }
        }
      }
    }
  
    // --- SHOOTING LOGIC ---
    const closestEnemyForShooting = findClosest(player, enemies);
    if (closestEnemyForShooting) {
      const enemyCenterX = closestEnemyForShooting.x + closestEnemyForShooting.width / 2;
      const playerCenterX = player.x + player.width / 2;
      // If aligned horizontally, shoot.
      if (Math.abs(enemyCenterX - playerCenterX) < closestEnemyForShooting.width) {
        keys[' '] = true;
      }
    }
  
    // Maintain a safe vertical position
    if (player.y > CANVAS_HEIGHT * 0.85) {
      keys.ArrowUp = true;
    } else if (player.y < CANVAS_HEIGHT * 0.7) {
      keys.ArrowDown = true;
    }
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const now = Date.now();
    const deltaTime = now - lastUpdateTime.current;
    lastUpdateTime.current = now;

    const keys = keysRef.current;
    const lastKeyPressed = lastKeyPressedRef.current;
    const player = playerRef.current;
    
    // --- HANDLE TOGGLES ---
    if (lastKeyPressed === 'q' || lastKeyPressed === 'Q') {
      const nextWeapon = (player.weapon + 1) % (Object.keys(WeaponType).length / 2);
      player.weapon = nextWeapon;
      setCurrentWeapon(nextWeapon);
      clearLastKey();
    }
    if (lastKeyPressed === 'i' || lastKeyPressed === 'I') {
      aiModeRef.current = !aiModeRef.current;
      setIsAiActive(aiModeRef.current);
      clearLastKey();
    }

    // --- AI OR PLAYER CONTROL ---
    if (aiModeRef.current) {
        runAiLogic(player, enemiesRef.current, bonusItemsRef.current, keys);
    }
    
    ctx.fillStyle = '#0c0a18';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 3})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    if (keys.ArrowLeft && player.x > 0) player.x -= PLAYER_SPEED;
    if (keys.ArrowRight && player.x < CANVAS_WIDTH - player.width) player.x += PLAYER_SPEED;
    if (keys.ArrowUp && player.y > 0) player.y -= PLAYER_SPEED;
    if (keys.ArrowDown && player.y < CANVAS_HEIGHT - player.height) player.y += PLAYER_SPEED;
    
    if(player.isInvincible) {
      player.invincibilityTimer -= deltaTime;
      if (player.invincibilityTimer <= 0) {
        player.isInvincible = false;
      }
    }
    
    const weaponConfig = WEAPON_CONFIGS[player.weapon];
    if (keys[' '] && now - lastShotTimeRef.current > weaponConfig.cooldown) {
      lastShotTimeRef.current = now;
      if (player.weapon === WeaponType.Single) {
        bulletsRef.current.push({ id: Math.random(), x: player.x + player.width / 2 - BULLET_WIDTH / 2, y: player.y, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: weaponConfig.speed, color: weaponConfig.color, damage: weaponConfig.damage, type: 'bullet' });
        playShootSound();
      } else if (player.weapon === WeaponType.Triple) {
        bulletsRef.current.push({ id: Math.random(), x: player.x + player.width / 2 - BULLET_WIDTH / 2, y: player.y, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: weaponConfig.speed, color: weaponConfig.color, damage: weaponConfig.damage, type: 'bullet' });
        bulletsRef.current.push({ id: Math.random(), x: player.x, y: player.y + player.height * 0.7, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: weaponConfig.speed, color: weaponConfig.color, damage: weaponConfig.damage, type: 'bullet' });
        bulletsRef.current.push({ id: Math.random(), x: player.x + player.width - BULLET_WIDTH, y: player.y + player.height * 0.7, width: BULLET_WIDTH, height: BULLET_HEIGHT, speed: weaponConfig.speed, color: weaponConfig.color, damage: weaponConfig.damage, type: 'bullet' });
        playShootSound();
      } else if (player.weapon === WeaponType.Laser) {
        bulletsRef.current.push({ id: Math.random(), x: player.x + player.width / 2 - LASER_WIDTH / 2, y: player.y, width: LASER_WIDTH, height: LASER_HEIGHT, speed: weaponConfig.speed, color: weaponConfig.color, damage: weaponConfig.damage, type: 'laser' });
        playLaserSound();
      } else if (player.weapon === WeaponType.Missile) {
        bulletsRef.current.push({id: Math.random(), x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 20, speed: weaponConfig.speed, color: weaponConfig.color, damage: weaponConfig.damage, type: 'missile', trail: []});
        playMissileSound();
      }
    }
    
    bulletsRef.current = bulletsRef.current.filter(b => b.y > -b.height);
    bulletsRef.current.forEach(bullet => {
      if (bullet.type === 'missile') {
          if (!bullet.targetId || !enemiesRef.current.find(e => e.id === bullet.targetId)) {
              let bestTarget: Enemy | null = null;
              let maxThreat = -1;
              enemiesRef.current.forEach(enemy => {
                  // Threat is higher for enemies that are closer to the player (higher y) and larger.
                  const threatScore = (enemy.y / CANVAS_HEIGHT) * enemy.width;
                  if (threatScore > maxThreat) {
                      maxThreat = threatScore;
                      bestTarget = enemy;
                  }
              });
              bullet.targetId = bestTarget ? bestTarget.id : null;
          }
          const target = enemiesRef.current.find(e => e.id === bullet.targetId);
          if (target) {
              const angle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
              bullet.x += Math.cos(angle) * bullet.speed;
              bullet.y += Math.sin(angle) * bullet.speed;
          } else {
              bullet.y -= bullet.speed;
          }
          bullet.trail?.push({x: bullet.x + bullet.width / 2, y: bullet.y + bullet.height, alpha: 1});
          if (bullet.trail && bullet.trail.length > 20) bullet.trail.shift();
          bullet.trail?.forEach((p, i) => {
            p.alpha -= 0.05;
            ctx.fillStyle = `rgba(180, 180, 180, ${p.alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, i / 4, 0, Math.PI * 2);
            ctx.fill();
          });
      } else {
        bullet.y -= bullet.speed;
      }
      if (bullet.type === 'laser') bullet.color = `hsl(${(now / 5) % 360}, 100%, 50%)`;
      ctx.fillStyle = bullet.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
    });

    if (now - lastEnemySpawnTimeRef.current > ENEMY_SPAWN_RATE) {
        lastEnemySpawnTimeRef.current = now;
        const width = Math.random() * 20 + 30;
        const height = width * 0.8;
        const x = Math.random() * (CANVAS_WIDTH - width);
        const type = Math.random() > 0.3 ? 'asteroid' : 'invader';
        const newEnemy: Enemy = { id: Math.random(), x, y: -height, width, height, speed: type === 'asteroid' ? (Math.random() * 1.5 + 2) : (Math.random() * 1 + 3), health: type === 'asteroid' ? 5 : 2, type };
        if (type === 'asteroid') {
            const points = []; const numPoints = Math.floor(Math.random() * 5) + 7;
            const radiusX = width / 2; const radiusY = height / 2;
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * Math.PI * 2;
                const randomRadius = 0.8 + Math.random() * 0.4;
                points.push({ x: Math.cos(angle) * radiusX * randomRadius, y: Math.sin(angle) * radiusY * randomRadius });
            }
            newEnemy.shape = points;
        }
        enemiesRef.current.push(newEnemy);
    }

    enemiesRef.current = enemiesRef.current.filter(e => e.health > 0);
    enemiesRef.current.forEach(enemy => {
        enemy.y += enemy.speed;
        if(enemy.y > CANVAS_HEIGHT) enemy.health = 0;
        if(enemy.type === 'asteroid' && enemy.shape) {
            ctx.fillStyle = '#a0522d'; ctx.strokeStyle = '#69381b'; ctx.lineWidth = 2;
            ctx.beginPath();
            const centerX = enemy.x + enemy.width / 2; const centerY = enemy.y + enemy.height / 2;
            ctx.moveTo(centerX + enemy.shape[0].x, centerY + enemy.shape[0].y);
            for (let i = 1; i < enemy.shape.length; i++) ctx.lineTo(centerX + enemy.shape[i].x, centerY + enemy.shape[i].y);
            ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (enemy.type === 'invader') {
            ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 5;
            const w = enemy.width; const p = w / 8; const x = enemy.x; const y = enemy.y;
            ctx.fillRect(x+p*3, y, p*2, p); ctx.fillRect(x+p*2, y+p, p*4, p);
            ctx.fillRect(x+p, y+p*2, p*6, p); ctx.fillRect(x, y+p*3, p*2, p);
            ctx.fillRect(x+p*3, y+p*3, p*2, p); ctx.fillRect(x+p*6, y+p*3, p*2, p);
            ctx.fillRect(x, y+p*4, p*8, p); ctx.fillRect(x+p, y+p*5, p*2, p);
            ctx.fillRect(x+p*5, y+p*5, p*2, p);
            ctx.shadowBlur = 0;
        }
    });
    
    bulletsRef.current.forEach(bullet => {
      let bulletRemoved = false;
      enemiesRef.current.forEach(enemy => {
        if (bulletRemoved) return;
        if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
            bullet.y = -100; bulletRemoved = true;
            enemy.health -= bullet.damage;
            if(enemy.health <= 0) {
                const explosionColor = enemy.type === 'asteroid' ? '#a0522d' : '#00ff00';
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, explosionColor, enemy.width);
                spawnBonusItem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                scoreRef.current += enemy.type === 'asteroid' ? 10 : 25;
                setScore(scoreRef.current);
                if (scoreRef.current >= nextLifeScoreRef.current) {
                  player.lives++;
                  setCurrentLives(player.lives);
                  nextLifeScoreRef.current += SCORE_FOR_EXTRA_LIFE;
                  playPowerupSound();
                }
            }
        }
      });
    });

    enemiesRef.current.forEach(enemy => {
      if (!player.isInvincible && enemy.health > 0 && player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
          createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', player.width);
          playPlayerHitSound();
          enemy.health = 0;
          player.lives -= 1;
          setCurrentLives(player.lives);
          if(player.lives <= 0) {
              onGameOver(scoreRef.current);
              return;
          }
      }
    });

    bonusItemsRef.current = bonusItemsRef.current.filter(item => item.y < CANVAS_HEIGHT);
    bonusItemsRef.current.forEach((item, index) => {
      item.y += item.speed;
      if (player.x < item.x + item.width && player.x + player.width > item.x &&
          player.y < item.y + item.height && player.y + player.height > item.y) {
        if (item.type === BonusItemType.Shield) {
          player.isInvincible = true;
          player.invincibilityTimer = INVINCIBILITY_DURATION;
        } else if (item.type === BonusItemType.Score) {
          scoreRef.current += 1000;
          setScore(scoreRef.current);
        }
        playPowerupSound();
        bonusItemsRef.current.splice(index, 1);
      } else {
         if (item.type === BonusItemType.Shield) {
            ctx.fillStyle = 'rgba(0, 191, 255, 0.8)';
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(item.x, item.y, item.width, item.height);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText('S', item.x + item.width / 2, item.y + item.height / 2 + 5);
        } else { // Score
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(item.x, item.y, item.width, item.height);
            ctx.fillStyle = '#FF4500';
            ctx.fillRect(item.x, item.y + item.height/2 - 2, item.width, 4);
            ctx.fillRect(item.x + item.width/2 - 2, item.y, 4, item.height);
        }
      }
    });
    
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    particlesRef.current.forEach(p => {
        p.velocity.y += 0.04; // Gravity for fireworks effect
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.life--;
        const scale = p.life / p.maxLife;
        const radius = p.radius * scale;

        const prevX = p.x - p.velocity.x * 2;
        const prevY = p.y - p.velocity.y * 2;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = radius > 0 ? radius * 2 : 0;
        ctx.strokeStyle = `rgba(${p.color.match(/\d+/g)?.join(',')}, ${scale * 0.8})`;
        ctx.stroke();
        
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius > 0 ? radius : 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.match(/\d+/g)?.join(',')}, ${scale})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    // ROCKET SMOKE TRAIL
    if (Math.random() > 0.4) { // Spawn particles intermittently
      const maxLife = 40;
      smokeParticlesRef.current.push({
        id: Math.random(),
        x: player.x + player.width * 0.3 + Math.random() * player.width * 0.4,
        y: player.y + player.height,
        width: 0, height: 0,
        color: '#ccc',
        alpha: 1,
        radius: Math.random() * 3 + 2,
        life: maxLife, maxLife: maxLife,
        velocity: { x: (Math.random() - 0.5) * 0.5, y: Math.random() * 1 + 1, z: 0 },
      });
    }

    smokeParticlesRef.current = smokeParticlesRef.current.filter(p => p.life > 0);
    smokeParticlesRef.current.forEach(p => {
      p.x += p.velocity.x;
      p.y += p.velocity.y;
      p.life--;
      const scale = p.life / p.maxLife;
      p.radius += 0.1; // Smoke expands
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 200, 200, ${scale * 0.5})`;
      ctx.fill();
    });

    const p = player;
    ctx.fillStyle = '#c0c0c0'; ctx.strokeStyle = '#808080'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(p.x + p.width / 2, p.y); ctx.lineTo(p.x, p.y + p.height * 0.3);
    ctx.lineTo(p.x, p.y + p.height); ctx.lineTo(p.x + p.width, p.y + p.height);
    ctx.lineTo(p.x + p.width, p.y + p.height * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.moveTo(p.x, p.y + p.height * 0.8); ctx.lineTo(p.x - 10, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(p.x + p.width, p.y + p.height * 0.8); ctx.lineTo(p.x + p.width + 10, p.y + p.height);
    ctx.lineTo(p.x + p.width, p.y + p.height); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#00aaff';
    ctx.beginPath(); ctx.arc(p.x + p.width / 2, p.y + p.height * 0.3, 5, 0, Math.PI * 2); ctx.fill();
    
    if (player.isInvincible) {
      ctx.beginPath();
      const shieldRadius = (p.width / 2) * 1.5;
      const gradient = ctx.createRadialGradient(p.x + p.width/2, p.y + p.height/2, shieldRadius * 0.5, p.x + p.width/2, p.y + p.height/2, shieldRadius);
      gradient.addColorStop(0, 'rgba(0, 150, 255, 0)');
      gradient.addColorStop(0.8, 'rgba(0, 150, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(100, 200, 255, 0.8)');
      ctx.fillStyle = gradient;
      ctx.arc(p.x + p.width/2, p.y + p.height/2, shieldRadius, 0, Math.PI*2);
      ctx.fill();
    }

    if (keys.ArrowUp || keys[' ']) {
        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 105}, 0, 0.8)`;
        ctx.beginPath(); ctx.moveTo(p.x + p.width * 0.25, p.y + p.height);
        ctx.lineTo(p.x + p.width * 0.75, p.y + p.height);
        ctx.lineTo(p.x + p.width / 2, p.y + p.height + 15 + Math.random() * 10);
        ctx.closePath(); ctx.fill();
    }


    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [setScore, onGameOver, createExplosion, clearLastKey, keysRef, lastKeyPressedRef, spawnBonusItem, runAiLogic]);

  useEffect(() => {
    lastUpdateTime.current = Date.now();
    for (let i = 0; i < STAR_COUNT; i++) {
      starsRef.current.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5,
      });
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  return (
    <div className="relative w-[800px] h-[600px] bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-cyan-400 box-glow rounded-lg"
      />
      <HUD score={scoreRef.current} lives={currentLives} weapon={currentWeapon} isAiActive={isAiActive} />
    </div>
  );
};

export default GameCanvas;