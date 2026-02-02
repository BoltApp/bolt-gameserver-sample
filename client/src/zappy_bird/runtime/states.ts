import { createImage } from '../asset';
import type { ZappyBirdRuntime } from './runtime';
import type { Scoreboard, ButtonConfig } from './shared-types';
import type { PipeEntity } from '../entities';
import { preloadAd } from './ads';
import {
  initGameState,
  initBackgroundEntities,
  initSpaceship,
  initPipes,
  initFonts,
  updateEntities,
  checkLevelUp,
  renderLives,
  renderNotification,
  resetGameConfig,
  initScoreboard,
  renderScoreboard,
} from './utils';
import { collides } from './collision';
import {
  handleClick as handleButtonClick,
  renderButtons,
  setupImageSmoothing,
  enableImageSmoothing,
  renderWithBreathing,
  restoreImageSmoothing,
} from './buttons';

export interface GameState {
  init(): void;
  update(): void;
  render(): void;
}

export class Splash implements GameState {
  banner: HTMLImageElement;
  buttonConfigs: Record<string, ButtonConfig>;
  private runtime: ZappyBirdRuntime;

  constructor(runtime: ZappyBirdRuntime) {
    this.runtime = runtime;
    this.banner = createImage('/zappy_bird/assets/images/splash.png');
    this.buttonConfigs = runtime.buttonConfigs;
  }

  init(): void {
    this.runtime.Sound.play(this.runtime.Sound.swoosh);
    initGameState(this.runtime);
    initBackgroundEntities(this.runtime);
    initSpaceship(this.runtime);

    setTimeout(() => preloadAd(), 100);
  }

  update(): void {
    updateEntities(this.runtime);
    if (this.runtime.Input.tapped && this.runtime.ctx) {
      const x = this.runtime.Input.x;
      const y = this.runtime.Input.y;

      if (handleButtonClick(x, y, this.buttonConfigs, ['bonusLife'])) {
        this.runtime.Input.tapped = false;
        return;
      }

      if (this.runtime.lives > 0) {
        this.runtime.changeState('Play');
        this.runtime.Input.tapped = false;
      }
    }
  }

  render(): void {
    if (!this.runtime.ctx) return;
    renderLives(this.runtime);
    renderButtons(this.buttonConfigs, this.runtime.ctx, ['bonusLife']);
    renderNotification(this.runtime);

    if (this.runtime.lives > 0) {
      this.runtime.Draw.Image(this.banner, 66, 90);
    } else {
      this.runtime.Draw.text('No Lives Remaining', 50, 200, 20, 'red');
      this.runtime.Draw.text('Game Over', 80, 230, 18, 'black');
    }
  }
}

export class Play implements GameState {
  private runtime: ZappyBirdRuntime;

  constructor(runtime: ZappyBirdRuntime) {
    this.runtime = runtime;
  }

  init(): void {
    initSpaceship(this.runtime);
    initPipes(this.runtime);

    this.runtime.bird = this.runtime.createBird();
    initFonts(this.runtime);

    setTimeout(() => preloadAd(), 100);
  }

  update(): void {
    this.runtime.distance += 1;
    checkLevelUp(this.runtime);

    if (this.runtime.Input.tapped) {
      this.runtime.score.taps += 1;
    }

    updateEntities(this.runtime);

    if (!this.runtime.bird) return;
    for (const entity of this.runtime.entities) {
      if (entity.type === 'pipe') {
        const pipe = entity as PipeEntity;
        if (pipe.remove) continue;
        if (collides(this.runtime.bird!, pipe, this.runtime, this.runtime)) {
          this.runtime.Sound.play(this.runtime.Sound.hit);
          this.runtime.changeState('GameOver');
          break;
        }
      }
    }
  }

  render(): void {
    if (!this.runtime.ctx) return;
    const X = this.runtime.WIDTH / 2 - (this.runtime.digits.length * 14) / 2;
    for (const [i, d] of this.runtime.digits.entries()) {
      this.runtime.Draw.Image(this.runtime.fonts[Number(d)], X + i * 14, 10);
    }

    renderLives(this.runtime);

    if (this.runtime.voltageBoost) {
      this.runtime.Draw.text('2x', this.runtime.WIDTH - 30, 30, 12, 'black');
    }
  }
}

export class GameOver implements GameState {
  startTime = Date.now();
  scoreboard: Scoreboard | null = null;
  private runtime: ZappyBirdRuntime;

  constructor(runtime: ZappyBirdRuntime) {
    this.runtime = runtime;
  }

  init(): void {
    if (this.runtime.lives > 0) {
      this.runtime.lives -= 1;
    }

    resetGameConfig(this.runtime);

    initScoreboard(this.runtime, (scoreboard) => {
      this.scoreboard = scoreboard;
    });
  }

  update(): void {
    if (this.runtime.Input.tapped && this.runtime.ctx) {
      const x = this.runtime.Input.x;
      const y = this.runtime.Input.y;

      const REPLAY_BUTTON_X = 102.5;
      const REPLAY_BUTTON_Y = 220;
      const REPLAY_BUTTON_WIDTH = 115;
      const REPLAY_BUTTON_HEIGHT = 70;

      if (this.runtime.lives > 0) {
        if (
          x >= REPLAY_BUTTON_X &&
          x <= REPLAY_BUTTON_X + REPLAY_BUTTON_WIDTH &&
          y >= REPLAY_BUTTON_Y &&
          y <= REPLAY_BUTTON_Y + REPLAY_BUTTON_HEIGHT
        ) {
          this.runtime.changeState('Splash');
          this.runtime.Input.tapped = false;
          return;
        }
      }

      if (handleButtonClick(x, y, this.runtime.buttonConfigs, [])) {
        this.runtime.Input.tapped = false;
        return;
      }

      if (this.runtime.lives === 0) {
        this.runtime.changeState('Splash');
      }
      this.runtime.Input.tapped = false;
    }
    if (this.runtime.bird) {
      this.runtime.bird.update();
    }
  }

  render(): void {
    if (!this.runtime.ctx) return;
    renderLives(this.runtime);

    renderScoreboard(this.runtime, this.scoreboard);

    if (this.runtime.lives === 0) {
      const config = this.runtime.buttonConfigs.bonusLife;
      const smoothingSettings = setupImageSmoothing(this.runtime.ctx);
      enableImageSmoothing(this.runtime.ctx);
      renderWithBreathing(config, this.runtime.ctx, this.startTime);
      restoreImageSmoothing(this.runtime.ctx, smoothingSettings);
    }

    if (this.runtime.lives > 0) {
      renderButtons(this.runtime.buttonConfigs, this.runtime.ctx, ['bonusLife']);
    }
  }
}
