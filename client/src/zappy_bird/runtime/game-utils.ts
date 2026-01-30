import { zappyAssetUrl } from '../asset';
import type { ZappyBirdRuntime } from '../types';
import type { Scoreboard } from '../types';
import type { GameConfig } from './context';

const ASSET_PREFIX = '/zappy_bird/assets/';

export function createImage(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src.startsWith(ASSET_PREFIX) ? zappyAssetUrl(src.slice(ASSET_PREFIX.length)) : src;
  return img;
}

export function createGameUtils(
  state: ZappyBirdRuntime,
  config: GameConfig
) {
  return {
    resetGameConfig(): void {
      config.spaceshipEnabled = false;
      config.voltageBoost = false;
      state.spaceship = null;
    },

    initGameState(): void {
      state.distance = 0;
      state.bgGrad = 'day';
      state.entities = [];
      state.lasers = [];
      state.score.taps = state.score.bolts = 0;
      if (state.lives === undefined || state.lives <= 0) {
        state.lives = 3;
      }
      this.resetGameConfig();
    },

    createImage,

    updateEntities(): void {
      for (const e of state.entities) e.update();
    },

    getNextGradient(): 'day' | 'dusk' | 'night' | 'dawn' {
      const gradients: readonly ('day' | 'dusk' | 'night' | 'dawn')[] = ['day', 'dusk', 'night', 'dawn'];
      const i = gradients.indexOf(state.bgGrad);
      return i === -1 || i === gradients.length - 1 ? 'day' : gradients[i + 1];
    },

    checkLevelUp(): boolean {
      if (state.distance % 2048 === 0) {
        state.bgGrad = this.getNextGradient();
        return true;
      }
      return false;
    },

    renderLives(): void {
      if (state.lives > 0) state.Draw.text(`Lives: ${state.lives}x`, 15, 30, 12, 'black');
    },

    initBackgroundEntities(): void {
      for (const x of [30, 130, 230]) {
        state.entities.push(state.Cloud(x, Math.floor(Math.random() * state.HEIGHT / 2)));
      }
      const barY = state.HEIGHT - 100;
      for (let i = 0; i < 2; i++) state.entities.push(state.BottomBar(state.WIDTH * i, barY, state.WIDTH));
      for (const offset of [0, -200, -240]) {
        state.entities.push(state.City(Math.floor(Math.random() * state.WIDTH + offset), 0));
      }
    },

    initSpaceship(): void {
      if (config.spaceshipEnabled) {
        state.spaceship = state.Spaceship();
        state.entities.push(state.spaceship);
      }
    },

    initPipes(): void {
      state.entities.push(state.Pipe(state.WIDTH * 2, 50));
      state.entities.push(state.Pipe(state.WIDTH * 2 + state.WIDTH / 2, 50));
      state.entities.push(state.Pipe(state.WIDTH * 3, 50));
    },

    initFonts(): void {
      for (let n = 0; n < 10; n++) state.fonts.push(createImage(`/zappy_bird/assets/images/numbers/font_small_${n}.png`));
      state.digits = ['0'];
    },

    getBoltType(score: number): string {
      if (score >= 4) return 'stack';
      if (score >= 3) return 'pink';
      if (score >= 2) return 'blue';
      return 'light_blue';
    },

    initScoreboard(callback: (scoreboard: Scoreboard) => void): void {
      setTimeout(() => {
        state.Sound.play(state.Sound.die);
        const bannerName = state.lives > 0 ? 'scoreboard_continue' : 'scoreboard_game_over';
        const banner = createImage(`/zappy_bird/assets/images/${bannerName}.png`);
        const bolt = createImage(`/zappy_bird/assets/images/bolt_${this.getBoltType(state.score.bolts)}.png`);
        const replay = createImage('/zappy_bird/assets/images/buttons/replay.png');
        callback({ banner, bolt, replay, highscore: state.Storage.getHighScore(state.score.bolts) });
      }, 500);
    },

    renderScoreboard(scoreboard: Scoreboard | null): void {
      if (!scoreboard || !scoreboard.banner || !state.ctx) return;
      if (!scoreboard.banner.complete || scoreboard.banner.naturalWidth === 0) return;
      const BANNER_SCALE = 0.8;
      const BANNER_X_OFFSET = 42;
      const BANNER_Y_OFFSET = 30;
      const BOLT_X = 70;
      const BOLT_Y = 133;
      const REPLAY_BUTTON_X = 102.5;
      const REPLAY_BUTTON_Y = 220;
      const SCORE_X = 216;
      const SCORE_Y = 140;
      const HIGHSCORE_Y = 176;
      const bannerWidth = scoreboard.banner.naturalWidth * BANNER_SCALE;
      const bannerHeight = scoreboard.banner.naturalHeight * BANNER_SCALE;
      const bannerX = BANNER_X_OFFSET + (scoreboard.banner.naturalWidth - bannerWidth) / 2;
      const bannerY = BANNER_Y_OFFSET + (scoreboard.banner.naturalHeight - bannerHeight) / 2;
      state.ctx.drawImage(scoreboard.banner, bannerX, bannerY, bannerWidth, bannerHeight);
      if (scoreboard.bolt && scoreboard.bolt.complete) {
        state.Draw.Image(scoreboard.bolt, BOLT_X, BOLT_Y);
      }
      if (state.lives > 0) {
        if (scoreboard.replay && scoreboard.replay.complete) {
          state.Draw.Image(scoreboard.replay, REPLAY_BUTTON_X, REPLAY_BUTTON_Y);
        }
      } else {
        const RESTART_TEXT = 'Click anywhere to restart';
        const RESTART_TEXT_Y = 240;
        const TEXT_FONT_SIZE = 12;
        const OUTLINE_WIDTH = 3;
        const OUTLINE_COLOR = '#000000';
        const TEXT_COLOR = '#39ff14';
        state.ctx.font = `bold ${TEXT_FONT_SIZE}px Monospace`;
        const textWidth = state.ctx.measureText(RESTART_TEXT).width;
        const textX = (state.WIDTH - textWidth) / 2;
        state.ctx.strokeStyle = OUTLINE_COLOR;
        state.ctx.lineWidth = OUTLINE_WIDTH;
        state.ctx.strokeText(RESTART_TEXT, textX, RESTART_TEXT_Y);
        state.ctx.fillStyle = TEXT_COLOR;
        state.Draw.text(RESTART_TEXT, textX, RESTART_TEXT_Y, TEXT_FONT_SIZE, TEXT_COLOR);
      }
      state.Draw.text(state.score.bolts.toString(), SCORE_X, SCORE_Y, 15, 'black');
      state.Draw.text(scoreboard.highscore.toString(), SCORE_X, HIGHSCORE_Y, 15, 'black');
    },

    shootLaser(): void {
      if (!config.spaceshipEnabled || !state.spaceship) return;
      const spaceshipImgHeight = state.spaceship.img.naturalHeight || 50;
      const spaceshipScale = 0.2;
      const laserY = state.spaceship.y + spaceshipImgHeight * spaceshipScale - 20;
      state.lasers.push(state.Laser(22, laserY));
    },

    updateLasers(): void {
      if (!config.spaceshipEnabled) return;
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        state.lasers[i].update();
        if (state.lasers[i].remove) state.lasers.splice(i, 1);
      }
    },

    renderLasers(): void {
      if (!config.spaceshipEnabled) return;
      for (const laser of state.lasers) laser.render();
    },

    showNotification(message: string): void {
      state.notification.message = message;
      state.notification.startTime = Date.now();
    },

    renderNotification(): void {
      if (!state.notification.message || !state.notification.startTime || !state.ctx) return;
      const elapsed = Date.now() - state.notification.startTime;
      if (elapsed > state.notification.duration) {
        state.notification.message = null;
        state.notification.startTime = null;
        return;
      }
      const cfg = state.notification.config;
      const text = `${cfg.prefix}${state.notification.message}${cfg.suffix}`;
      state.ctx.font = `bold ${cfg.fontSize}px Monospace`;
      const textWidth = state.ctx.measureText(text).width;
      const x = (state.WIDTH - textWidth) / 2;
      state.Draw.text(text, x, cfg.y, cfg.fontSize, cfg.color);
    },
  };
}
