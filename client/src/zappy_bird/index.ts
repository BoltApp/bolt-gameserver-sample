import type { GameConfig } from './runtime/context';

export type ZappyBirdCleanup = () => void;

export async function startZappyBird(canvas: HTMLCanvasElement): Promise<ZappyBirdCleanup> {
  const config: GameConfig = { spaceshipEnabled: false, voltageBoost: false };

  await import('./runtime/states');

  const game = await import('./runtime/game');
  return game.startGame(canvas, config);
}
