import { zappyAssetUrl } from '../asset';
import type { Scoreboard } from '../types';

const FB = window.FB!;

FB.GameUtils = {
  resetGameConfig: function (): void {
    if (window.GAME_CONFIG) {
      window.GAME_CONFIG.spaceshipEnabled = false;
      window.GAME_CONFIG.voltageBoost = false;
    }
    FB.spaceship = null;
  },

  initGameState: function (): void {
    FB.distance = 0;
    FB.bg_grad = 'day';
    FB.entities = [];
    FB.lasers = [];
    FB.score.taps = FB.score.bolts = 0;
    if (FB.lives === undefined || FB.lives <= 0) {
      FB.lives = 3;
    }
    this.resetGameConfig();
  },

  createImage: function (src: string): HTMLImageElement {
    const img = new Image();
    // Rewrite static code to Vite URLs for bundled assets.
    const prefix = '/zappy_bird/assets/';
    if (typeof src === 'string' && src.indexOf(prefix) === 0) {
      img.src = zappyAssetUrl(src.substring(prefix.length));
    } else {
      img.src = src;
    }
    return img;
  },

  updateEntities: function (): void {
    for (let i = 0; i < FB.entities.length; i += 1) {
      FB.entities[i].update();
    }
  },

  getNextGradient: function (): 'day' | 'dusk' | 'night' | 'dawn' {
    const gradients: Array<'day' | 'dusk' | 'night' | 'dawn'> = ['day', 'dusk', 'night', 'dawn'];
    for (let i = 0; i < gradients.length; i++) {
      if (FB.bg_grad === gradients[i]) {
        if (i === gradients.length - 1) {
          return 'day';
        } else {
          return gradients[i + 1];
        }
      }
    }
    return 'day';
  },

  checkLevelUp: function (): boolean {
    if (FB.distance % 2048 === 0) {
      FB.bg_grad = this.getNextGradient();
      return true;
    }
    return false;
  },

  renderLives: function (): void {
    if (FB.lives > 0) {
      FB.Draw.text('Lives: ' + FB.lives + 'x', 15, 30, 12, 'black');
    }
  },

  initBackgroundEntities: function (): void {
    const cloudXPositions = [30, 130, 230];
    cloudXPositions.forEach((x) => {
      FB.entities.push(new FB.Cloud(x, ~~(Math.random() * FB.HEIGHT / 2)));
    });

    const BOTTOM_BAR_COUNT = 2;
    const BOTTOM_BAR_Y = FB.HEIGHT - 100;
    for (let i = 0; i < BOTTOM_BAR_COUNT; i += 1) {
      FB.entities.push(new FB.BottomBar(FB.WIDTH * i, BOTTOM_BAR_Y, FB.WIDTH));
    }

    const cityXOffsets = [0, -200, -240];
    cityXOffsets.forEach((offset) => {
      FB.entities.push(new FB.City(~~(Math.random() * FB.WIDTH + offset), 0));
    });
  },

  initSpaceship: function (): void {
    if (window.GAME_CONFIG?.spaceshipEnabled) {
      FB.spaceship = new FB.Spaceship();
      FB.entities.push(FB.spaceship);
    }
  },

  initPipes: function (): void {
    FB.entities.push(new FB.Pipe(FB.WIDTH * 2, 50));
    FB.entities.push(new FB.Pipe(FB.WIDTH * 2 + FB.WIDTH / 2, 50));
    FB.entities.push(new FB.Pipe(FB.WIDTH * 3, 50));
  },

  initFonts: function (): void {
    for (let n = 0; n < 10; n++) {
      const img = this.createImage('/zappy_bird/assets/images/numbers/font_small_' + n + '.png');
      FB.fonts.push(img);
    }
    FB.digits = ['0'];
  },

  getBoltType: function (score: number): string {
    if (score >= 4) return 'stack';
    if (score >= 3) return 'pink';
    if (score >= 2) return 'blue';
    return 'light_blue';
  },

  initScoreboard: function (callback: (scoreboard: Scoreboard) => void): void {
    setTimeout(() => {
      FB.Sound.play(FB.Sound.die);
      const bannerName = FB.lives > 0 ? 'scoreboard_continue' : 'scoreboard_game_over';
      console.log('initScoreboard: FB.lives =', FB.lives, 'selecting banner:', bannerName);
      const banner = this.createImage('/zappy_bird/assets/images/' + bannerName + '.png');
      const boltType = this.getBoltType(FB.score.bolts);
      const bolt = this.createImage('/zappy_bird/assets/images/bolt_' + boltType + '.png');
      const replay = this.createImage('/zappy_bird/assets/images/buttons/replay.png');
      const highscore = FB.Storage.getHighScore();

      if (callback) {
        callback({
          banner: banner,
          bolt: bolt,
          replay: replay,
          highscore: highscore,
        });
      }
    }, 500);
  },

  renderScoreboard: function (scoreboard: Scoreboard | null): void {
    if (!scoreboard || !scoreboard.banner || !FB.ctx) return;

    if (!scoreboard.banner.complete || scoreboard.banner.naturalWidth === 0) {
      return;
    }

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

    FB.ctx.drawImage(scoreboard.banner, bannerX, bannerY, bannerWidth, bannerHeight);
    if (scoreboard.bolt && scoreboard.bolt.complete) {
      FB.Draw.Image(scoreboard.bolt, BOLT_X, BOLT_Y);
    }
    if (FB.lives > 0) {
      if (scoreboard.replay && scoreboard.replay.complete) {
        FB.Draw.Image(scoreboard.replay, REPLAY_BUTTON_X, REPLAY_BUTTON_Y);
      }
    } else {
      const RESTART_TEXT = 'Click anywhere to restart';
      const RESTART_TEXT_Y = 240;
      const TEXT_FONT_SIZE = 12;
      const OUTLINE_WIDTH = 3;
      const OUTLINE_COLOR = '#000000';
      const TEXT_COLOR = '#39ff14';

      FB.ctx.font = `bold ${TEXT_FONT_SIZE}px Monospace`;
      const textWidth = FB.ctx.measureText(RESTART_TEXT).width;
      const textX = (FB.WIDTH - textWidth) / 2;

      FB.ctx.strokeStyle = OUTLINE_COLOR;
      FB.ctx.lineWidth = OUTLINE_WIDTH;
      FB.ctx.strokeText(RESTART_TEXT, textX, RESTART_TEXT_Y);

      FB.ctx.fillStyle = TEXT_COLOR;
      FB.Draw.text(RESTART_TEXT, textX, RESTART_TEXT_Y, TEXT_FONT_SIZE, TEXT_COLOR);
    }
    FB.Draw.text(FB.score.bolts.toString(), SCORE_X, SCORE_Y, 15, 'black');
    FB.Draw.text(scoreboard.highscore.toString(), SCORE_X, HIGHSCORE_Y, 15, 'black');
  },

  shootLaser: function (): void {
    if (!window.GAME_CONFIG?.spaceshipEnabled || !FB.spaceship) {
      return;
    }
    const spaceshipImgHeight = FB.spaceship.img.naturalHeight || 50;
    const spaceshipScale = 0.2;
    const laserY = FB.spaceship.y + spaceshipImgHeight * spaceshipScale - 20;
    FB.lasers.push(new FB.Laser(22, laserY));
  },

  updateLasers: function (): void {
    if (!window.GAME_CONFIG?.spaceshipEnabled) return;

    for (let i = FB.lasers.length - 1; i >= 0; i--) {
      FB.lasers[i].update();
      if (FB.lasers[i].remove) {
        FB.lasers.splice(i, 1);
      }
    }
  },

  renderLasers: function (): void {
    if (!window.GAME_CONFIG?.spaceshipEnabled) return;

    for (let i = 0; i < FB.lasers.length; i += 1) {
      FB.lasers[i].render();
    }
  },

  showNotification: function (message: string): void {
    FB.notification.message = message;
    FB.notification.startTime = Date.now();
  },

  renderNotification: function (): void {
    if (!FB.notification.message || !FB.notification.startTime || !FB.ctx) {
      return;
    }

    const elapsed = Date.now() - FB.notification.startTime;
    if (elapsed > FB.notification.duration) {
      FB.notification.message = null;
      FB.notification.startTime = null;
      return;
    }

    const config = FB.notification.config;
    const text = config.prefix + FB.notification.message + config.suffix;

    FB.ctx.font = 'bold ' + config.fontSize + 'px Monospace';
    const textWidth = FB.ctx.measureText(text).width;
    const x = (FB.WIDTH - textWidth) / 2;

    FB.Draw.text(text, x, config.y, config.fontSize, config.color);
  },
};


export {};