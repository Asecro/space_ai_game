
import { useRef, useEffect, useCallback } from 'react';
import { Keys } from '../types';

export const useGameInput = () => {
  const keysRef = useRef<Keys>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    ' ': false,
  });
  const lastKeyPressedRef = useRef<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if the key is one we are tracking for continuous press
    if (Object.prototype.hasOwnProperty.call(keysRef.current, e.key)) {
      e.preventDefault();
      keysRef.current[e.key as keyof Keys] = true;
    }
    // Always track the last key pressed for single-press actions like weapon switching
    lastKeyPressedRef.current = e.key;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (Object.prototype.hasOwnProperty.call(keysRef.current, e.key)) {
      e.preventDefault();
      keysRef.current[e.key as keyof Keys] = false;
    }
  }, []);
  
  // This function will be called from the game loop after the key press has been processed.
  const clearLastKey = useCallback(() => {
    lastKeyPressedRef.current = null;
  }, []);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { keysRef, lastKeyPressedRef, clearLastKey };
};
