// @ts-nocheck

export function ensureZappyGlobals() {
  const w = window as any;
  w.FB ??= {};
  w.GAME_CONFIG ??= { spaceshipEnabled: false, voltageBoost: false };
  return { FB: w.FB, GAME_CONFIG: w.GAME_CONFIG };
}

