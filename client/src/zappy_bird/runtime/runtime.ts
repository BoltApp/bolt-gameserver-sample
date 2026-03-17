import { zappyAssetUrl } from '../asset';
import { Storage } from './storage';
import { Sound } from './sound';
import { Draw } from './draw';
import { Input } from './input';
import { shootLaser } from './utils';
import { initButtons } from './buttons';
import type { BaseEntity } from '../entities/base-entity';
import {
  BackgroundEntity,
  CloudEntity,
  SpaceshipEntity,
  LaserEntity,
  BottomBarEntity,
  CityEntity,
  PipeEntity,
  BirdEntity,
  ParticleEntity,
} from '../entities';
import { registerAdCallback, getAdCallback } from './ads';
import { Splash, Play, GameOver } from './states';
import type { GameState } from './states';
import type { Gradients, EventHandlers, ButtonConfig } from './shared-types';

const stateClasses = { Splash, Play, GameOver } as const;

const PLAY_WIDTH = 320;
const PLAY_HEIGHT = 480;

export class ZappyBirdRuntime {
  spaceshipEnabled = false;
  voltageBoost = false;
  WIDTH = PLAY_WIDTH;
  HEIGHT = PLAY_HEIGHT;
  VIEW_WIDTH = PLAY_WIDTH;
  VIEW_HEIGHT = PLAY_HEIGHT;
  playOffset = { left: 0, top: 0 };
  scale = 1;
  devicePixelRatio = 1;
  offset = { top: 0, left: 0 };
  currentWidth: number | null = null;
  currentHeight: number | null = null;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;
  score = { taps: 0, bolts: 0 };
  distance = 0;
  digits: string[] = [];
  fonts: HTMLImageElement[] = [];
  lives = 3;
  backgroundMusic: HTMLAudioElement | null = null;
  backgroundMusicNext: HTMLAudioElement | null = null;
  backgroundMusicWasPlaying = false;
  gameReady = false;
  clickToBeginStartTime: number | null = null;
  notification = {
    message: null as string | null,
    startTime: null as number | null,
    duration: 2000,
    config: { fontSize: 10, color: '#39ff14', y: 12, prefix: '+ ', suffix: ' +' },
  };
  RATIO: number | null = null;
  bgGrad: 'day' | 'dusk' | 'night' | 'dawn' = 'day';
  game: GameState | null = null;
  ua: string | null = null;
  android: boolean | null = null;
  ios: boolean | null = null;
  gradients!: Gradients;
  _rafId = 0;
  _clickToBeginRafId = 0;
  _running = false;
  _handlers: EventHandlers = {} as EventHandlers;
  buttonConfigs!: Record<string, ButtonConfig>;
  entities: BaseEntity[] = [];
  Storage!: typeof Storage;
  Sound!: typeof Sound;
  Draw!: Draw;
  Input!: Input;
  bird?: BirdEntity;
  spaceship?: SpaceshipEntity | null;
  _lastTime?: number;
  _accum?: number;

  constructor(canvas: HTMLCanvasElement, options?: { spaceshipEnabled?: boolean; voltageBoost?: boolean }) {
    if (options) {
      this.spaceshipEnabled = options.spaceshipEnabled ?? false;
      this.voltageBoost = options.voltageBoost ?? false;
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('Failed to get 2d context from canvas');
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.Storage = Storage;
    this.Sound = Sound;
    this.Draw = new Draw(this.ctx, this.VIEW_WIDTH, this.VIEW_HEIGHT);
    this.Input = new Input(() => this.offset, () => this.scale, () => this.playOffset);
    this.ua = navigator.userAgent.toLowerCase();
    this.android = this.ua.indexOf('android') > -1;
    this.ios = this.ua.indexOf('iphone') > -1 || this.ua.indexOf('ipad') > -1;
    this.initAdCallback();
    this.buttonConfigs = initButtons(this, () => getAdCallback());
  }

  private initAdCallback(): void {
    registerAdCallback(this);
  }

  getEntities(): BaseEntity[] {
    return this.entities;
  }

  addEntity(e: BaseEntity): void {
    this.entities.push(e);
  }

  removeDead(): void {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      if (this.entities[i].remove) this.entities.splice(i, 1);
    }
  }

  createBackground(): BackgroundEntity {
    const e = new BackgroundEntity(this);
    this.addEntity(e);
    return e;
  }

  createCloud(x: number, y: number): CloudEntity {
    const e = new CloudEntity(this, x, y);
    this.addEntity(e);
    return e;
  }

  createSpaceship(): SpaceshipEntity {
    const e = new SpaceshipEntity(this);
    this.addEntity(e);
    return e;
  }

  createLaser(x: number, y: number): LaserEntity {
    const e = new LaserEntity(this, x, y);
    this.addEntity(e);
    return e;
  }

  createBottomBar(x: number, y: number, w: number): BottomBarEntity {
    const e = new BottomBarEntity(this, x, y, w);
    this.addEntity(e);
    return e;
  }

  createCity(x: number, y: number): CityEntity {
    const e = new CityEntity(this, x, y);
    this.addEntity(e);
    return e;
  }

  createPipe(x: number, w: number): PipeEntity {
    const e = new PipeEntity(this, x, w);
    this.addEntity(e);
    return e;
  }

  createBird(): BirdEntity {
    const e = new BirdEntity(this);
    this.addEntity(e);
    return e;
  }

  createParticle(x: number, y: number, r: number, col: string): ParticleEntity {
    const e = new ParticleEntity(this, x, y, r, col);
    this.addEntity(e);
    return e;
  }

  private createGradients(viewHeight: number): Gradients {
    let g = this.ctx!.createLinearGradient(0, 0, 0, viewHeight);
    g.addColorStop(0, '#036');
    g.addColorStop(0.5, '#69a');
    g.addColorStop(1, 'yellow');
    const dawn = g;
    g = this.ctx!.createLinearGradient(0, 0, 0, viewHeight);
    g.addColorStop(0, '#69a');
    g.addColorStop(0.5, '#9cd');
    g.addColorStop(1, '#fff');
    const day = g;
    g = this.ctx!.createLinearGradient(0, 0, 0, viewHeight);
    g.addColorStop(0, '#036');
    g.addColorStop(0.3, '#69a');
    g.addColorStop(1, 'pink');
    const dusk = g;
    g = this.ctx!.createLinearGradient(0, 0, 0, viewHeight);
    g.addColorStop(0, '#036');
    g.addColorStop(1, 'black');
    const night = g;
    return { dawn, day, dusk, night };
  }

  setupHighDPICanvas(): void {
    if (!this.ctx) return;
    this.canvas.width = this.VIEW_WIDTH * this.devicePixelRatio;
    this.canvas.height = this.VIEW_HEIGHT * this.devicePixelRatio;
    this.canvas.style.width = `${this.currentWidth ?? this.VIEW_WIDTH}px`;
    this.canvas.style.height = `${this.currentHeight ?? this.VIEW_HEIGHT}px`;
    if (this.ctx.setTransform) this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  resize(): void {
    const parent = this.canvas?.parentElement;
    const maxW = parent?.clientWidth ?? window.innerWidth;
    const maxH = parent?.clientHeight ?? window.innerHeight;
    const containerRatio = maxW / maxH;
    const playRatio = PLAY_WIDTH / PLAY_HEIGHT;
    let viewWidth: number;
    let viewHeight: number;
    if (containerRatio >= playRatio) {
      viewHeight = PLAY_HEIGHT;
      viewWidth = PLAY_HEIGHT * containerRatio;
    } else {
      viewWidth = PLAY_WIDTH;
      viewHeight = PLAY_WIDTH / containerRatio;
    }
    this.VIEW_WIDTH = viewWidth;
    this.VIEW_HEIGHT = viewHeight;
    this.playOffset = {
      left: (viewWidth - PLAY_WIDTH) / 2,
      top: (viewHeight - PLAY_HEIGHT) / 2,
    };
    this.RATIO = viewWidth / viewHeight;
    const scale = maxW / viewWidth;
    this.currentWidth = maxW;
    this.currentHeight = maxH;
    this.scale = scale;
    this.gradients = this.createGradients(viewHeight);
    this.Draw.setViewSize(viewWidth, viewHeight);
    this.canvas.style.width = `${this.currentWidth}px`;
    this.canvas.style.height = `${this.currentHeight}px`;
    this.offset.top = this.canvas.offsetTop;
    this.offset.left = this.canvas.offsetLeft;
    this.setupHighDPICanvas();
    window.setTimeout(() => window.scrollTo(0, 1), 1);
  }

  showIntroVideo(): void {
    const video = document.getElementById('intro-video') as HTMLVideoElement | null;
    if (!video) {
      this.showClickToBegin();
      return;
    }
    const hasSeenIntroKey = 'hasSeenIntro';
    const isFirstTime = !localStorage.getItem(hasSeenIntroKey);
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const wasRefreshed = nav?.type === 'reload';
    if (!isFirstTime && !wasRefreshed && sessionStorage.getItem(hasSeenIntroKey) === 'true') {
      video.classList.add('hidden');
      this.showClickToBegin();
      return;
    }
    if (isFirstTime) localStorage.setItem(hasSeenIntroKey, 'true');
    const FALLBACK_DELAY_MS = 2000;
    const MIN_PLAYBACK_TIME_SEC = 0.1;
    let fallbackTimerId: number | null = null;
    const hideVideoAndShowClickToBegin = (): void => {
      video.classList.add('hidden');
      this.showClickToBegin();
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
  }

  renderClickToBegin(): void {
    const clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin || clickToBegin.classList.contains('hidden') || !this.clickToBeginStartTime) return;
    const textElement = document.getElementById('click-to-begin-text');
    if (!textElement) return;
    const elapsedSeconds = (Date.now() - this.clickToBeginStartTime) / 1000;
    const breathCycle = (Math.sin(elapsedSeconds * 4) + 1) / 2;
    const sizeMultiplier = 0.9 + breathCycle * 0.1;
    textElement.style.fontSize = `${20 * sizeMultiplier}px`;
    this._clickToBeginRafId = requestAnimationFrame(() => this.renderClickToBegin());
  }

  showClickToBegin(): void {
    const clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin) {
      this.startGame();
      return;
    }
    const video = document.getElementById('intro-video');
    if (video) video.classList.add('hidden');
    this.clickToBeginStartTime = Date.now();
    clickToBegin.classList.remove('hidden');
    const handleClick = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      clickToBegin.classList.add('hidden');
      clickToBegin.removeEventListener('click', handleClick);
      clickToBegin.removeEventListener('touchstart', handleClick);
      if (this._clickToBeginRafId) {
        cancelAnimationFrame(this._clickToBeginRafId);
        this._clickToBeginRafId = 0;
      }
      this.startBackgroundMusic();
      this.gameReady = true;
      this.Input.tapped = false;
      this.clickToBeginStartTime = null;
      setTimeout(() => this.startGame(), 50);
    };
    clickToBegin.addEventListener('click', handleClick, { once: true });
    clickToBegin.addEventListener('touchstart', handleClick, { once: true, passive: false });
    this.renderClickToBegin();
  }

  startBackgroundMusic(): void {
    if (!this.backgroundMusic) {
      const musicSrc = zappyAssetUrl('sounds/Static [Original Soundtrack by Sanyi].mp3');
      this.backgroundMusic = new Audio(musicSrc);
      this.backgroundMusicNext = new Audio(musicSrc);
      this.backgroundMusic.preload = 'auto';
      this.backgroundMusicNext!.preload = 'auto';
      Sound.registerElement(this.backgroundMusic);
      Sound.registerElement(this.backgroundMusicNext!);
      const switchToNext = (): void => {
        const temp = this.backgroundMusic;
        this.backgroundMusic = this.backgroundMusicNext;
        this.backgroundMusicNext = temp;
        if (this.backgroundMusicNext) this.backgroundMusicNext.currentTime = 0;
        if (this.backgroundMusic) this.backgroundMusic.addEventListener('ended', switchToNext);
      };
      const CROSSFADE_THRESHOLD_SEC = 0.02;
      const self = this;
      this.backgroundMusic.addEventListener('timeupdate', function () {
        if (this.duration && this.currentTime > this.duration - CROSSFADE_THRESHOLD_SEC && self.backgroundMusicNext?.paused) {
          self.backgroundMusicNext.play().catch(() => {});
        }
      });
      this.backgroundMusic.addEventListener('ended', switchToNext);
    }
    if (this.backgroundMusic) this.backgroundMusic.play().catch((err: unknown) => console.log('Background music play failed:', err));
  }

  changeState(state: 'Splash' | 'Play' | 'GameOver'): void {
    const StateClass = stateClasses[state];
    this.game = new StateClass(this);
    this.game.init();
  }

  startGame(): void {
    const video = document.getElementById('intro-video');
    const clickToBegin = document.getElementById('click-to-begin');
    if (video) video.classList.add('hidden');
    if (clickToBegin) clickToBegin.classList.add('hidden');
    if (this._clickToBeginRafId) {
      cancelAnimationFrame(this._clickToBeginRafId);
      this._clickToBeginRafId = 0;
    }
    this.clickToBeginStartTime = null;
    this.changeState('Splash');
    this.loop();
  }

  update(): void {
    if (this.game) this.game.update();
    this.Input.tapped = false;
  }

  render(): void {
    if (!this.ctx) return;
    this.Draw.clear();
    this.ctx.save();
    this.ctx.translate(this.playOffset.left, this.playOffset.top);
    for (const e of this.entities) e.render();
    if (this.game) this.game.render();
    this.ctx.restore();
  }

  loop(): void {
    if (!this._running) return;
    const now = performance.now();
    if (!this._lastTime) this._lastTime = now;
    let dt = now - this._lastTime;
    this._lastTime = now;
    if (dt > 250) dt = 250;
    this._accum = (this._accum || 0) + dt;
    const step = 1000 / 60;
    while (this._accum >= step) {
      this.update();
      this._accum -= step;
    }
    this.render();
    this._rafId = requestAnimationFrame(() => this.loop());
  }
}

export function startGame(canvas: HTMLCanvasElement, options?: { spaceshipEnabled?: boolean; voltageBoost?: boolean }): () => void {
  const runtime = new ZappyBirdRuntime(canvas, options);

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
      shootLaser(runtime);
    }
    runtime.Input.keys[e.key.toLowerCase()] = true;
  };
  runtime._handlers.keyup = (e: KeyboardEvent): void => {
    runtime.Input.keys[e.key.toLowerCase()] = false;
  };
  runtime._handlers.resize = (): void => runtime.resize();

  window.addEventListener('click', runtime._handlers.click, false);
  window.addEventListener('touchstart', runtime._handlers.touchstart, false);
  window.addEventListener('touchmove', runtime._handlers.touchmove, false);
  window.addEventListener('touchend', runtime._handlers.touchend, false);
  window.addEventListener('keydown', runtime._handlers.keydown, false);
  window.addEventListener('keyup', runtime._handlers.keyup, false);
  window.addEventListener('resize', runtime._handlers.resize, false);

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
    document.body.style.height = '';
    try {
      if (runtime.backgroundMusic) {
        runtime.backgroundMusic.pause();
        Sound.unregisterElement(runtime.backgroundMusic);
      }
      if (runtime.backgroundMusicNext) {
        runtime.backgroundMusicNext.pause();
        Sound.unregisterElement(runtime.backgroundMusicNext);
      }
    } catch {}
  };
}
