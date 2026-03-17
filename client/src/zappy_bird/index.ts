export type ZappyBirdCleanup = () => void;

export async function startZappyBird(canvas: HTMLCanvasElement): Promise<ZappyBirdCleanup> {
  await import('./runtime/states');

  const game = await import('./runtime/runtime');
  return game.startGame(canvas);
}
