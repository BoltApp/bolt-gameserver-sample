import { zappyAssetUrl } from '../asset';
import type { ZappyBirdRuntime } from '../types';
import type { GameConfig } from './context';
import { setContext } from './context';
import { Storage } from './storage';
import { Sound } from './sound';
import { Draw } from './draw';
import { Input } from './input';
import { createImage, createGameUtils } from './game-utils';
import { Button } from './buttons';
import { createEntities } from './entities';
import { collides } from './collision';
import { initAdCallback, getAdCallback } from './ads';
import { Splash, Play, GameOver } from './states';

const stateClasses = { Splash, Play, GameOver } as const;

export function startGame(canvas: HTMLCanvasElement, GAME_CONFIG: GameConfig): () => void {
  const runtime = {
    WIDTH: 320,
    HEIGHT: 480,
    scale: 1,
    devicePixelRatio: 1,
    offset: { top: 0, left: 0 },
    entities: [] as ZappyBirdRuntime['entities'],
    currentWidth: null as number | null,
    currentHeight: null as number | null,
    canvas,
    ctx: null as CanvasRenderingContext2D | null,
    score: { taps: 0, bolts: 0 },
    distance: 0,
    digits: [] as string[],
    fonts: [] as HTMLImageElement[],
    lasers: [] as ZappyBirdRuntime['lasers'],
    lives: 3,
    backgroundMusic: null as HTMLAudioElement | null,
    backgroundMusicNext: null as HTMLAudioElement | null,
    backgroundMusicWasPlaying: false,
    gameReady: false,
    clickToBeginStartTime: null as number | null,
    notification: {
      message: null as string | null,
      startTime: null as number | null,
      duration: 2000,
      config: { fontSize: 10, color: '#39ff14', y: 12, prefix: '+ ', suffix: ' +' },
    },
    RATIO: null as number | null,
    bgGrad: 'day' as const,
    game: null as ZappyBirdRuntime['game'],
    ua: null as string | null,
    android: null as boolean | null,
    ios: null as boolean | null,
    gradients: {} as ZappyBirdRuntime['gradients'],
    _rafId: 0,
    _clickToBeginRafId: 0,
    _running: false,
    _handlers: {} as ZappyBirdRuntime['_handlers'],
  } as ZappyBirdRuntime;

  runtime.RATIO = runtime.WIDTH / runtime.HEIGHT;
  runtime.ctx = runtime.canvas.getContext('2d');
  if (!runtime.ctx) throw new Error('Failed to get 2d context from canvas');
  runtime.devicePixelRatio = window.devicePixelRatio || 1;

  runtime.Storage = Storage;
  runtime.Sound = Sound;
  runtime.Draw = new Draw(runtime.ctx, runtime.WIDTH, runtime.HEIGHT);
  runtime.Input = new Input(() => runtime.offset, () => runtime.scale);

  const entityCtors = createEntities(runtime, createImage);
  runtime.Cloud = entityCtors.Cloud;
  runtime.Spaceship = entityCtors.Spaceship;
  runtime.Laser = entityCtors.Laser;
  runtime.BottomBar = entityCtors.BottomBar;
  runtime.City = entityCtors.City;
  runtime.Pipe = entityCtors.Pipe;
  runtime.Bird = entityCtors.Bird;
  runtime.Particle = entityCtors.Particle;

  runtime.GameUtils = createGameUtils(runtime, GAME_CONFIG);
  setContext(runtime, GAME_CONFIG);
  initAdCallback();
  runtime.Buttons = new Button(runtime, () => getAdCallback());
  runtime.collides = (bird, pipe) => collides(bird, pipe, runtime, GAME_CONFIG);

  runtime.setupHighDPICanvas = function (): void {
    if (!runtime.ctx) return;
    runtime.canvas.width = runtime.WIDTH * runtime.devicePixelRatio;
    runtime.canvas.height = runtime.HEIGHT * runtime.devicePixelRatio;
    runtime.canvas.style.width = `${runtime.WIDTH}px`;
    runtime.canvas.style.height = `${runtime.HEIGHT}px`;
    if (runtime.ctx.setTransform) runtime.ctx.setTransform(1, 0, 0, 1, 0, 0);
    runtime.ctx.scale(runtime.devicePixelRatio, runtime.devicePixelRatio);
    runtime.ctx.imageSmoothingEnabled = true;
    runtime.ctx.imageSmoothingQuality = 'high';
  };

  runtime.resize = function (): void {
    const parent = runtime.canvas?.parentElement;
    const maxW = parent?.clientWidth ?? window.innerWidth;
    const maxH = parent?.clientHeight ?? window.innerHeight;
    if (!runtime.RATIO) return;
    runtime.currentHeight = maxH;
    runtime.currentWidth = runtime.currentHeight * runtime.RATIO;
    if (runtime.currentWidth > maxW) {
      runtime.currentWidth = maxW;
      runtime.currentHeight = runtime.currentWidth / runtime.RATIO;
    }
    if (runtime.android || runtime.ios) {
      document.body.style.height = `${window.innerHeight + 50}px`;
    }
    runtime.canvas.style.width = `${runtime.currentWidth}px`;
    runtime.canvas.style.height = `${runtime.currentHeight}px`;
    runtime.scale = runtime.currentWidth / runtime.WIDTH;
    runtime.offset.top = runtime.canvas.offsetTop;
    runtime.offset.left = runtime.canvas.offsetLeft;
    window.setTimeout(() => window.scrollTo(0, 1), 1);
  };

  runtime.showIntroVideo = function (): void {
    const video = document.getElementById('intro-video') as HTMLVideoElement | null;
    if (!video) {
      runtime.showClickToBegin();
      return;
    }
    const hasSeenIntroKey = 'hasSeenIntro';
    const isFirstTime = !localStorage.getItem(hasSeenIntroKey);
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const wasRefreshed = nav?.type === 'reload';
    if (!isFirstTime && !wasRefreshed && sessionStorage.getItem(hasSeenIntroKey) === 'true') {
      video.classList.add('hidden');
      runtime.showClickToBegin();
      return;
    }
    if (isFirstTime) localStorage.setItem(hasSeenIntroKey, 'true');
    const FALLBACK_DELAY_MS = 2000;
    const MIN_PLAYBACK_TIME_SEC = 0.1;
    let fallbackTimerId: number | null = null;
    const hideVideoAndShowClickToBegin = (): void => {
      video.classList.add('hidden');
      runtime.showClickToBegin();
    };
    const clearFallbackTimer = (): void => {
      if (fallbackTimerId !== null) {
        clearTimeout(fallbackTimerId);
        fallbackTimerId = null;
      }
    };
    const startFallbackTimer = (): void => {
      fallbackTimerId = window.setTimeout(() => {
        if (video.paused || video.currentTime < MIN_PLAYBACK_TIME_SEC) hideVideoAndShowClickToBegin();
      }, FALLBACK_DELAY_MS);
    };
    video.addEventListener('ended', () => {
      clearFallbackTimer();
      sessionStorage.setItem(hasSeenIntroKey, 'true');
      hideVideoAndShowClickToBegin();
    }, { once: true });
    video.addEventListener('error', () => { clearFallbackTimer(); hideVideoAndShowClickToBegin(); }, { once: true });
    video.addEventListener('playing', clearFallbackTimer, { once: true });
    video.play().then(startFallbackTimer).catch(() => { clearFallbackTimer(); hideVideoAndShowClickToBegin(); });
  };

  runtime.renderClickToBegin = function (): void {
    const clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin || clickToBegin.classList.contains('hidden') || !runtime.clickToBeginStartTime) return;
    const textElement = document.getElementById('click-to-begin-text');
    if (!textElement) return;
    const elapsedSeconds = (Date.now() - runtime.clickToBeginStartTime) / 1000;
    const breathCycle = (Math.sin(elapsedSeconds * 4) + 1) / 2;
    const sizeMultiplier = 0.9 + breathCycle * 0.1;
    textElement.style.fontSize = `${20 * sizeMultiplier}px`;
    runtime._clickToBeginRafId = requestAnimationFrame(runtime.renderClickToBegin);
  };

  runtime.showClickToBegin = function (): void {
    const clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin) {
      runtime.startGame();
      return;
    }
    const video = document.getElementById('intro-video');
    if (video) video.classList.add('hidden');
    runtime.clickToBeginStartTime = Date.now();
    clickToBegin.classList.remove('hidden');
    const handleClick = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      clickToBegin.classList.add('hidden');
      clickToBegin.removeEventListener('click', handleClick);
      clickToBegin.removeEventListener('touchstart', handleClick);
      if (runtime._clickToBeginRafId) {
        cancelAnimationFrame(runtime._clickToBeginRafId);
        runtime._clickToBeginRafId = 0;
      }
      runtime.startBackgroundMusic();
      runtime.gameReady = true;
      runtime.Input.tapped = false;
      runtime.clickToBeginStartTime = null;
      setTimeout(() => runtime.startGame(), 50);
    };
    clickToBegin.addEventListener('click', handleClick, { once: true });
    clickToBegin.addEventListener('touchstart', handleClick, { once: true, passive: false });
    runtime.renderClickToBegin();
  };

  runtime.startBackgroundMusic = function (): void {
    if (!runtime.backgroundMusic) {
      const musicSrc = zappyAssetUrl('sounds/Static Demo Master 1 [Original Soundtrack by Sanyi].mp3');
      runtime.backgroundMusic = new Audio(musicSrc);
      runtime.backgroundMusicNext = new Audio(musicSrc);
      runtime.backgroundMusic.preload = 'auto';
      runtime.backgroundMusicNext!.preload = 'auto';
      const switchToNext = (): void => {
        const temp = runtime.backgroundMusic;
        runtime.backgroundMusic = runtime.backgroundMusicNext;
        runtime.backgroundMusicNext = temp;
        if (runtime.backgroundMusicNext) runtime.backgroundMusicNext.currentTime = 0;
        if (runtime.backgroundMusic) runtime.backgroundMusic.addEventListener('ended', switchToNext);
      };
      const CROSSFADE_THRESHOLD_SEC = 0.02;
      runtime.backgroundMusic.addEventListener('timeupdate', function () {
        if (this.duration && this.currentTime > this.duration - CROSSFADE_THRESHOLD_SEC && runtime.backgroundMusicNext?.paused) {
          runtime.backgroundMusicNext.play().catch(() => {});
        }
      });
      runtime.backgroundMusic.addEventListener('ended', switchToNext);
    }
    if (runtime.backgroundMusic) runtime.backgroundMusic.play().catch((err: unknown) => console.log('Background music play failed:', err));
  };

  runtime.changeState = function (state: 'Splash' | 'Play' | 'GameOver'): void {
    const StateClass = stateClasses[state];
    runtime.game = new StateClass(runtime, GAME_CONFIG);
    runtime.game.init();
  };

  runtime.startGame = function (): void {
    const video = document.getElementById('intro-video');
    const clickToBegin = document.getElementById('click-to-begin');
    if (video) video.classList.add('hidden');
    if (clickToBegin) clickToBegin.classList.add('hidden');
    if (runtime._clickToBeginRafId) {
      cancelAnimationFrame(runtime._clickToBeginRafId);
      runtime._clickToBeginRafId = 0;
    }
    runtime.clickToBeginStartTime = null;
    runtime.changeState('Splash');
    runtime.loop();
  };

  runtime.update = function (): void {
    if (runtime.game) runtime.game.update();
    runtime.Input.tapped = false;
    runtime.GameUtils.updateLasers();
  };

  runtime.render = function (): void {
    if (!runtime.ctx) return;
    runtime.Draw.rect(0, 0, runtime.WIDTH, runtime.HEIGHT, runtime.gradients[runtime.bgGrad]);
    runtime.GameUtils.renderLasers();
    for (const e of runtime.entities) e.render();
    if (runtime.game) runtime.game.render();
  };

  runtime.loop = function (): void {
    if (!runtime._running) return;
    const now = performance.now();
    if (!runtime._lastTime) runtime._lastTime = now;
    let dt = now - runtime._lastTime;
    runtime._lastTime = now;
    if (dt > 250) dt = 250;
    runtime._accum = (runtime._accum || 0) + dt;
    const step = 1000 / 60;
    while (runtime._accum >= step) {
      runtime.update();
      runtime._accum -= step;
    }
    runtime.render();
    runtime._rafId = requestAnimationFrame(runtime.loop);
  };

  const isAdOverlay = (el: EventTarget | null): boolean => {
    if (!el || !(el instanceof Node)) return false;
    const node = el as HTMLElement;
    const id = node.id?.toLowerCase() ?? '';
    const cls = node.className?.toString().toLowerCase() ?? '';
    if (id.includes('bolt') || cls.includes('bolt')) return true;
    return node.closest?.('[id*="bolt"], [class*="bolt"]') != null;
  };

  runtime._handlers.click = (e: MouseEvent): void => {
    if (!runtime.gameReady) return;
    if (isAdOverlay(e.target)) return;
    runtime.Input.set(e);
  };
  runtime._handlers.touchstart = (e: TouchEvent): void => {
    if (!runtime.gameReady) return;
    if (isAdOverlay(e.target)) return;
    if (e.touches[0]) runtime.Input.set(e.touches[0]);
  };
  runtime._handlers.touchmove = (_e: TouchEvent): void => {};
  runtime._handlers.touchend = (_e: TouchEvent): void => {};
  runtime._handlers.keydown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      runtime.GameUtils.shootLaser();
    }
    runtime.Input.keys[e.key.toLowerCase()] = true;
  };
  runtime._handlers.keyup = (e: KeyboardEvent): void => {
    runtime.Input.keys[e.key.toLowerCase()] = false;
  };
  runtime._handlers.resize = (): void => runtime.resize();

  runtime.ua = navigator.userAgent.toLowerCase();
  runtime.android = runtime.ua.indexOf('android') > -1;
  runtime.ios = runtime.ua.indexOf('iphone') > -1 || runtime.ua.indexOf('ipad') > -1;

  let grad = runtime.ctx.createLinearGradient(0, 0, 0, runtime.HEIGHT);
  grad.addColorStop(0, '#036');
  grad.addColorStop(0.5, '#69a');
  grad.addColorStop(1, 'yellow');
  runtime.gradients.dawn = grad;
  grad = runtime.ctx.createLinearGradient(0, 0, 0, runtime.HEIGHT);
  grad.addColorStop(0, '#69a');
  grad.addColorStop(0.5, '#9cd');
  grad.addColorStop(1, '#fff');
  runtime.gradients.day = grad;
  grad = runtime.ctx.createLinearGradient(0, 0, 0, runtime.HEIGHT);
  grad.addColorStop(0, '#036');
  grad.addColorStop(0.3, '#69a');
  grad.addColorStop(1, 'pink');
  runtime.gradients.dusk = grad;
  grad = runtime.ctx.createLinearGradient(0, 0, 0, runtime.HEIGHT);
  grad.addColorStop(0, '#036');
  grad.addColorStop(1, 'black');
  runtime.gradients.night = grad;

  window.addEventListener('click', runtime._handlers.click, false);
  window.addEventListener('touchstart', runtime._handlers.touchstart, false);
  window.addEventListener('touchmove', runtime._handlers.touchmove, false);
  window.addEventListener('touchend', runtime._handlers.touchend, false);
  window.addEventListener('keydown', runtime._handlers.keydown, false);
  window.addEventListener('keyup', runtime._handlers.keyup, false);
  window.addEventListener('resize', runtime._handlers.resize, false);

  runtime.Buttons.init();
  runtime.setupHighDPICanvas();
  runtime.resize();

  runtime._running = true;
  runtime.showIntroVideo();

  return () => {
    runtime._running = false;
    if (runtime._rafId) cancelAnimationFrame(runtime._rafId);
    runtime._rafId = 0;
    window.removeEventListener('click', runtime._handlers.click, false);
    window.removeEventListener('touchstart', runtime._handlers.touchstart, false);
    window.removeEventListener('touchmove', runtime._handlers.touchmove, false);
    window.removeEventListener('touchend', runtime._handlers.touchend, false);
    window.removeEventListener('keydown', runtime._handlers.keydown, false);
    window.removeEventListener('keyup', runtime._handlers.keyup, false);
    window.removeEventListener('resize', runtime._handlers.resize, false);
    try {
      if (runtime.backgroundMusic) runtime.backgroundMusic.pause();
      if (runtime.backgroundMusicNext) runtime.backgroundMusicNext.pause();
    } catch {}
  };
}
