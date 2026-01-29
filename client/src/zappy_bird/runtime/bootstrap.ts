import type { ZappyBirdFB } from '../types';

export function ensureZappyGlobals(): { FB: ZappyBirdFB; GAME_CONFIG: { spaceshipEnabled: boolean; voltageBoost: boolean } } {
  const w = window;
  if (!w.FB) {
    w.FB = {} as ZappyBirdFB;
  }
  if (!w.GAME_CONFIG) {
    w.GAME_CONFIG = { spaceshipEnabled: false, voltageBoost: false };
  }
  return { FB: w.FB as ZappyBirdFB, GAME_CONFIG: w.GAME_CONFIG };
}

