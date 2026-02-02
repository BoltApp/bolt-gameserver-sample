import type { GameState, Scoreboard, ButtonConfig, Pipe, ZappyBirdRuntime } from '../types';
import type { GameConfig } from './context';
import { preloadAd } from './ads';

export class Splash implements GameState {
  banner: HTMLImageElement;
  buttonConfigs: Record<string, ButtonConfig>;
  private runtime: ZappyBirdRuntime;

  constructor(runtime: ZappyBirdRuntime, _config: GameConfig) {
    this.runtime = runtime;
    this.banner = runtime.GameUtils.createImage('/zappy_bird/assets/images/splash.png');
    this.buttonConfigs = runtime.Buttons.configs;
  }

  init(): void {
    this.runtime.Sound.play(this.runtime.Sound.swoosh);
    this.runtime.GameUtils.initGameState();
    this.runtime.GameUtils.initBackgroundEntities();
    this.runtime.GameUtils.initSpaceship();

    setTimeout(() => preloadAd(), 100);
  }

  update(): void {
    this.runtime.GameUtils.updateEntities();
    if (this.runtime.Input.tapped && this.runtime.ctx) {
      const x = this.runtime.Input.x;
      const y = this.runtime.Input.y;

      if (this.runtime.Buttons.handleClick(x, y, this.buttonConfigs, ['bonusLife'])) {
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
    this.runtime.GameUtils.renderLives();
    this.runtime.Buttons.renderButtons(this.buttonConfigs, this.runtime.ctx, ['bonusLife']);
    this.runtime.GameUtils.renderNotification();

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
  private config: GameConfig;

  constructor(runtime: ZappyBirdRuntime, config: GameConfig) {
    this.runtime = runtime;
    this.config = config;
  }

  init(): void {
    this.runtime.GameUtils.initSpaceship();
    this.runtime.GameUtils.initPipes();

    this.runtime.bird = this.runtime.Bird();
    this.runtime.entities.push(this.runtime.bird);
    this.runtime.GameUtils.initFonts();

    setTimeout(() => preloadAd(), 100);
  }

  update(): void {
    this.runtime.distance += 1;
    this.runtime.GameUtils.checkLevelUp();

    if (this.runtime.Input.tapped) {
      this.runtime.score.taps += 1;
    }

    this.runtime.GameUtils.updateEntities();

    if (!this.runtime.bird) return;
    for (const entity of this.runtime.entities) {
      if (entity.type === 'pipe' && this.runtime.collides(this.runtime.bird, entity as Pipe)) {
        this.runtime.Sound.play(this.runtime.Sound.hit);
        this.runtime.changeState('GameOver');
        break;
      }
    }
  }

  render(): void {
    if (!this.runtime.ctx) return;
    const X = this.runtime.WIDTH / 2 - (this.runtime.digits.length * 14) / 2;
    for (const [i, d] of this.runtime.digits.entries()) {
      this.runtime.Draw.Image(this.runtime.fonts[Number(d)], X + i * 14, 10);
    }

    this.runtime.GameUtils.renderLives();

    if (this.config.voltageBoost) {
      this.runtime.Draw.text('2x', this.runtime.WIDTH - 30, 30, 12, 'black');
    }
  }
}

export class GameOver implements GameState {
  startTime = Date.now();
  scoreboard: Scoreboard | null = null;
  private runtime: ZappyBirdRuntime;

  constructor(runtime: ZappyBirdRuntime, _config: GameConfig) {
    this.runtime = runtime;
  }

  init(): void {
    if (this.runtime.lives > 0) {
      this.runtime.lives -= 1;
    }

    this.runtime.GameUtils.resetGameConfig();

    this.runtime.GameUtils.initScoreboard((scoreboard) => {
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

      if (this.runtime.Buttons.handleClick(x, y, this.runtime.Buttons.configs, [])) {
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
    this.runtime.GameUtils.renderLives();

    this.runtime.GameUtils.renderScoreboard(this.scoreboard);

    if (this.runtime.lives === 0) {
      const config = this.runtime.Buttons.configs.bonusLife;
      const smoothingSettings = this.runtime.Buttons.setupImageSmoothing(this.runtime.ctx);
      this.runtime.Buttons.enableImageSmoothing(this.runtime.ctx);
      this.runtime.Buttons.renderWithBreathing(config, this.runtime.ctx, this.startTime);
      this.runtime.Buttons.restoreImageSmoothing(this.runtime.ctx, smoothingSettings);
    }

    if (this.runtime.lives > 0) {
      this.runtime.Buttons.renderButtons(this.runtime.Buttons.configs, this.runtime.ctx, ['bonusLife']);
    }
  }
}
