let audioCtx: AudioContext | null = null;

export function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API is not supported in this browser");
    }
  }
}

function playSound(type: 'sine' | 'square' | 'sawtooth' | 'triangle', frequency: number, duration: number, volume: number) {
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
}

export const playShootSound = () => {
    playSound('triangle', 440, 0.1, 0.1);
    playSound('sine', 880, 0.1, 0.1);
};

export const playMissileSound = () => {
    playSound('sawtooth', 220, 0.2, 0.2);
};

export const playLaserSound = () => {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}

export const playExplosionSound = () => {
    playSound('sawtooth', 16, 0.5, 0.4);
    playSound('square', 55, 0.4, 0.3);
};

export const playPowerupSound = () => {
    playSound('sine', 523.25, 0.1, 0.2); // C5
    playSound('sine', 659.25, 0.1, 0.2); // E5
    playSound('sine', 783.99, 0.1, 0.2); // G5
};

export const playPlayerHitSound = () => {
    playSound('square', 220, 0.3, 0.3);
    playSound('sawtooth', 110, 0.3, 0.3);
};
