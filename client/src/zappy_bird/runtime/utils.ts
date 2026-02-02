import { createImage } from '../asset';
import type { ZappyBirdRuntime } from './runtime';
import type { Scoreboard } from './shared-types';
export function resetGameConfig(runtime: ZappyBirdRuntime): void {
  runtime.spaceshipEnabled = false;
  runtime.voltageBoost = false;
  runtime.spaceship = null;
}

export function initGameState(runtime: ZappyBirdRuntime): void {
  runtime.distance = 0;
  runtime.bgGrad = 'day';
  runtime.entities.length = 0;
  runtime.score.taps = runtime.score.bolts = 0;
  if (runtime.lives === undefined || runtime.lives <= 0) {
    runtime.lives = 3;
  }
  resetGameConfig(runtime);
}

export function updateEntities(runtime: ZappyBirdRuntime): void {
  for (const e of runtime.entities) e.update();
  runtime.removeDead();
}

function getNextGradient(runtime: ZappyBirdRuntime): 'day' | 'dusk' | 'night' | 'dawn' {
  const gradients: readonly ('day' | 'dusk' | 'night' | 'dawn')[] = ['day', 'dusk', 'night', 'dawn'];
  const i = gradients.indexOf(runtime.bgGrad);
  return i === -1 || i === gradients.length - 1 ? 'day' : gradients[i + 1];
}

export function checkLevelUp(runtime: ZappyBirdRuntime): boolean {
  if (runtime.distance % 2048 === 0) {
    runtime.bgGrad = getNextGradient(runtime);
    return true;
  }
  return false;
}

export function renderLives(runtime: ZappyBirdRuntime): void {
  if (runtime.lives > 0) runtime.Draw.text(`Lives: ${runtime.lives}x`, 15, 30, 12, 'black');
}

export function initBackgroundEntities(runtime: ZappyBirdRuntime): void {
  runtime.createBackground();
  const topPad = runtime.playOffset?.top ?? 0;
  for (const x of [30, 130, 230]) {
    runtime.createCloud(x, Math.floor(-topPad + Math.random() * (runtime.HEIGHT / 2 + topPad)));
  }
  const barY = runtime.HEIGHT - 100;
  const vw = runtime.VIEW_WIDTH ?? runtime.WIDTH;
  const barCount = Math.max(2, Math.ceil(vw / runtime.WIDTH) + 1);
  for (let i = 0; i < barCount; i++) {
    runtime.createBottomBar(runtime.WIDTH * i, barY, runtime.WIDTH);
  }
  for (const offset of [0, -200, -240]) {
    runtime.createCity(Math.floor(Math.random() * vw + offset), 0);
  }
}

export function initSpaceship(runtime: ZappyBirdRuntime): void {
  if (runtime.spaceshipEnabled) {
    runtime.spaceship = runtime.createSpaceship();
  }
}

export function initPipes(runtime: ZappyBirdRuntime): void {
  const vw = runtime.VIEW_WIDTH ?? runtime.WIDTH;
  runtime.createPipe(vw + runtime.WIDTH * 1, 50);
  runtime.createPipe(vw + runtime.WIDTH * 1.5, 50);
  runtime.createPipe(vw + runtime.WIDTH * 2, 50);
}

export function initFonts(runtime: ZappyBirdRuntime): void {
  for (let n = 0; n < 10; n++) runtime.fonts.push(createImage(`/zappy_bird/assets/images/numbers/font_small_${n}.png`));
  runtime.digits = ['0'];
}

function getBoltType(score: number): string {
  if (score >= 4) return 'stack';
  if (score >= 3) return 'pink';
  if (score >= 2) return 'blue';
  return 'light_blue';
}

export function initScoreboard(runtime: ZappyBirdRuntime, callback: (scoreboard: Scoreboard) => void): void {
  setTimeout(() => {
    runtime.Sound.play(runtime.Sound.die);
    const bannerName = runtime.lives > 0 ? 'scoreboard_continue' : 'scoreboard_game_over';
    const banner = createImage(`/zappy_bird/assets/images/${bannerName}.png`);
    const bolt = createImage(`/zappy_bird/assets/images/bolt_${getBoltType(runtime.score.bolts)}.png`);
    const replay = createImage('/zappy_bird/assets/images/buttons/replay.png');
    callback({ banner, bolt, replay, highscore: runtime.Storage.getHighScore(runtime.score.bolts) });
  }, 500);
}

export function renderScoreboard(runtime: ZappyBirdRuntime, scoreboard: Scoreboard | null): void {
  if (!scoreboard || !scoreboard.banner || !runtime.ctx) return;
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
  runtime.ctx.drawImage(scoreboard.banner, bannerX, bannerY, bannerWidth, bannerHeight);
  if (scoreboard.bolt && scoreboard.bolt.complete) {
    runtime.Draw.Image(scoreboard.bolt, BOLT_X, BOLT_Y);
  }
  if (runtime.lives > 0) {
    if (scoreboard.replay && scoreboard.replay.complete) {
      runtime.Draw.Image(scoreboard.replay, REPLAY_BUTTON_X, REPLAY_BUTTON_Y);
    }
  } else {
    const RESTART_TEXT = 'Click anywhere to restart';
    const RESTART_TEXT_Y = 240;
    const TEXT_FONT_SIZE = 12;
    const OUTLINE_WIDTH = 3;
    const OUTLINE_COLOR = '#000000';
    const TEXT_COLOR = '#39ff14';
    runtime.ctx.font = `bold ${TEXT_FONT_SIZE}px Monospace`;
    const textWidth = runtime.ctx.measureText(RESTART_TEXT).width;
    const textX = (runtime.WIDTH - textWidth) / 2;
    runtime.ctx.strokeStyle = OUTLINE_COLOR;
    runtime.ctx.lineWidth = OUTLINE_WIDTH;
    runtime.ctx.strokeText(RESTART_TEXT, textX, RESTART_TEXT_Y);
    runtime.ctx.fillStyle = TEXT_COLOR;
    runtime.Draw.text(RESTART_TEXT, textX, RESTART_TEXT_Y, TEXT_FONT_SIZE, TEXT_COLOR);
  }
  runtime.Draw.text(runtime.score.bolts.toString(), SCORE_X, SCORE_Y, 15, 'black');
  runtime.Draw.text(scoreboard.highscore.toString(), SCORE_X, HIGHSCORE_Y, 15, 'black');
}

export function shootLaser(runtime: ZappyBirdRuntime): void {
  if (!runtime.spaceshipEnabled || !runtime.spaceship) return;
  const spaceshipImgHeight = runtime.spaceship.img.naturalHeight || 50;
  const spaceshipScale = 0.2;
  const laserY = runtime.spaceship.y + spaceshipImgHeight * spaceshipScale - 20;
  runtime.createLaser(22, laserY);
}

export function showNotification(runtime: ZappyBirdRuntime, message: string): void {
  runtime.notification.message = message;
  runtime.notification.startTime = Date.now();
}

export function renderNotification(runtime: ZappyBirdRuntime): void {
  if (!runtime.notification.message || !runtime.notification.startTime || !runtime.ctx) return;
  const elapsed = Date.now() - runtime.notification.startTime;
  if (elapsed > runtime.notification.duration) {
    runtime.notification.message = null;
    runtime.notification.startTime = null;
    return;
  }
  const cfg = runtime.notification.config;
  const text = `${cfg.prefix}${runtime.notification.message}${cfg.suffix}`;
  runtime.ctx.font = `bold ${cfg.fontSize}px Monospace`;
  const textWidth = runtime.ctx.measureText(text).width;
  const x = (runtime.WIDTH - textWidth) / 2;
  runtime.Draw.text(text, x, cfg.y, cfg.fontSize, cfg.color);
}
