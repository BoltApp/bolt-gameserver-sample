import { ensureZappyGlobals } from './runtime/bootstrap';
import { installStorage } from './runtime/storage';
import { installSound } from './runtime/sound';

export type ZappyBirdCleanup = () => void;

export async function startZappyBird(canvas: HTMLCanvasElement): Promise<ZappyBirdCleanup> {
  ensureZappyGlobals();
  installStorage();
  installSound();

  // Load the engine pieces in-order (they attach onto `window.FB` / `window.*`).
  await import('./runtime/draw');
  await import('./runtime/input');
  await import('./runtime/entities');
  await import('./runtime/collision');
  await import('./runtime/game-utils');
  await import('./runtime/buttons');
  await import('./runtime/states');

  const core = await import('./runtime/core.ts');
  return core.startCore(canvas);
}

