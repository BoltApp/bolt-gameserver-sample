import type { ZappyBirdRuntime } from '../types';

export interface GameConfig {
  spaceshipEnabled: boolean;
  voltageBoost: boolean;
}

/** Module-held reference to the current game runtime and config. */
const context = {
  runtime: null as ZappyBirdRuntime | null,
  config: null as GameConfig | null,
};

export function getRuntime(): ZappyBirdRuntime {
  if (!context.runtime) throw new Error('ZappyBird context not initialized. Call setContext first.');
  return context.runtime;
}

export function getGameConfig(): GameConfig {
  if (!context.config) throw new Error('ZappyBird context not initialized. Call setContext first.');
  return context.config;
}

export function setContext(runtime: ZappyBirdRuntime, config: GameConfig): void {
  context.runtime = runtime;
  context.config = config;
}
