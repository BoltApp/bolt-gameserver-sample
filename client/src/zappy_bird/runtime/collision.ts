import type { Bird, Pipe } from '../types';
import type { GameConfig } from './context';
import type { Score } from '../types';

export interface CollisionState {
  score: Score;
  digits: string[];
  Sound: { play(sound: HTMLAudioElement): void; score: HTMLAudioElement };
}

export function collides(
  bird: Bird,
  pipe: Pipe,
  state: CollisionState,
  config: GameConfig
): boolean {
  if (bird.vy >= 370) {
    return true;
  }
  if (pipe.bolt && bird.vx > pipe.centerX + pipe.w / 2 - 5) {
    pipe.bolt = false;
    const points = config.voltageBoost ? 2 : 1;
    state.score.bolts += points;
    state.digits = state.score.bolts.toString().split('');
    state.Sound.play(state.Sound.score);
  }

  const bx1 = bird.vx - bird.width / 2;
  const by1 = bird.vy - bird.height / 2;
  const bx2 = bird.vx + bird.width / 2;
  const by2 = bird.vy + bird.height / 2;

  let c1 = false;
  if (!pipe.topDestroyed) {
    const upx1 = pipe.centerX;
    const upy1 = 0;
    const upx2 = pipe.centerX + pipe.w;
    const upy2 = pipe.centerY - 50;
    c1 = !(bx1 > upx2 || bx2 < upx1 || by1 > upy2 || by2 < upy1);
  }

  const lpx1 = pipe.centerX;
  const lpy1 = pipe.centerY + 50;
  const lpx2 = pipe.centerX + pipe.w;
  const lpy2 = pipe.h;
  const c2 = !(bx1 > lpx2 || bx2 < lpx1 || by1 > lpy2 || by2 < lpy1);

  return c1 || c2;
}
