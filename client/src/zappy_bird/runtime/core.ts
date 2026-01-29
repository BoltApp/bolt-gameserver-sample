import { zappyAssetUrl } from '../asset';


export function startCore(canvas: HTMLCanvasElement): () => void {
  const FB = window.FB!;

  Object.assign(FB, {
    WIDTH: 320,
    HEIGHT: 480,
    scale: 1,
    devicePixelRatio: 1,
    offset: { top: 0, left: 0 },
    entities: [],
    currentWidth: null,
    currentHeight: null,
    canvas,
    ctx: null,
    score: { taps: 0, bolts: 0 },
    distance: 0,
    digits: [],
    fonts: [],
    lasers: [],
    lives: 3,
    backgroundMusic: null,
    backgroundMusicNext: null,
    backgroundMusicWasPlaying: false,
    gameReady: false,
    clickToBeginStartTime: null,
    notification: {
      message: null,
      startTime: null,
      duration: 2000,
      config: { fontSize: 10, color: '#39ff14', y: 12, prefix: '+ ', suffix: ' +' },
    },
    RATIO: null,
    bg_grad: 'day',
    game: null,
    ua: null,
    android: null,
    ios: null,
    gradients: {},
    _rafId: 0,
    _clickToBeginRafId: 0,
    _running: false,
    _handlers: {},
  });

  FB.setupHighDPICanvas = function (): void {
    if (!FB.ctx) return;
    FB.canvas.width = FB.WIDTH * FB.devicePixelRatio;
    FB.canvas.height = FB.HEIGHT * FB.devicePixelRatio;
    FB.canvas.style.width = FB.WIDTH + 'px';
    FB.canvas.style.height = FB.HEIGHT + 'px';
    // Ensure transforms don't compound across remounts/restarts.
    if (FB.ctx.setTransform) {
      FB.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    FB.ctx.scale(FB.devicePixelRatio, FB.devicePixelRatio);
    FB.ctx.imageSmoothingEnabled = true;
    FB.ctx.imageSmoothingQuality = 'high';
  };

  FB.resize = function (): void {
    // Fit to the canvas container (SPA-safe) instead of full window height
    // to avoid scrolling under the site nav/header/footer.
    const parent = FB.canvas && FB.canvas.parentElement;
    const maxW = parent && parent.clientWidth ? parent.clientWidth : window.innerWidth;
    const maxH = parent && parent.clientHeight ? parent.clientHeight : window.innerHeight;

    if (!FB.RATIO) return;

    FB.currentHeight = maxH;
    FB.currentWidth = FB.currentHeight * FB.RATIO;

    // Also constrain by available width.
    if (FB.currentWidth > maxW) {
      FB.currentWidth = maxW;
      FB.currentHeight = FB.currentWidth / FB.RATIO;
    }

    if (FB.android || FB.ios) {
      document.body.style.height = window.innerHeight + 50 + 'px';
    }

    FB.canvas.style.width = FB.currentWidth + 'px';
    FB.canvas.style.height = FB.currentHeight + 'px';

    FB.scale = FB.currentWidth / FB.WIDTH;
    FB.offset.top = FB.canvas.offsetTop;
    FB.offset.left = FB.canvas.offsetLeft;

    window.setTimeout(() => {
      window.scrollTo(0, 1);
    }, 1);
  };

  FB.showIntroVideo = function (): void {
    const video = document.getElementById('intro-video') as HTMLVideoElement | null;
    if (!video) {
      FB.showClickToBegin();
      return;
    }

    const hasSeenIntroKey = 'hasSeenIntro';
    const isFirstTime = !localStorage.getItem(hasSeenIntroKey);
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const wasRefreshed = nav?.type === 'reload';

    if (!isFirstTime && !wasRefreshed && sessionStorage.getItem(hasSeenIntroKey) === 'true') {
      video.classList.add('hidden');
      FB.showClickToBegin();
      return;
    }

    if (isFirstTime) {
      localStorage.setItem(hasSeenIntroKey, 'true');
    }

    const FALLBACK_DELAY_MS = 2000;
    const MIN_PLAYBACK_TIME_SEC = 0.1;
    let fallbackTimerId: number | null = null;

    const hideVideoAndShowClickToBegin = function (): void {
      video.classList.add('hidden');
      FB.showClickToBegin();
    };

    const clearFallbackTimer = function (): void {
      if (fallbackTimerId !== null) {
        clearTimeout(fallbackTimerId);
        fallbackTimerId = null;
      }
    };

    const startFallbackTimer = function (): void {
      fallbackTimerId = window.setTimeout(function () {
        if (video.paused || video.currentTime < MIN_PLAYBACK_TIME_SEC) {
          hideVideoAndShowClickToBegin();
        }
      }, FALLBACK_DELAY_MS);
    };

    video.addEventListener(
      'ended',
      () => {
        clearFallbackTimer();
        sessionStorage.setItem(hasSeenIntroKey, 'true');
        hideVideoAndShowClickToBegin();
      },
      { once: true }
    );

    video.addEventListener('error', () => {
      clearFallbackTimer();
      hideVideoAndShowClickToBegin();
    }, { once: true });

    video.addEventListener('playing', clearFallbackTimer, { once: true });

    video.play()
      .then(startFallbackTimer)
      .catch(() => {
        clearFallbackTimer();
        hideVideoAndShowClickToBegin();
      });
  };

  FB.renderClickToBegin = function (): void {
    const clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin || clickToBegin.classList.contains('hidden') || !FB.clickToBeginStartTime) {
      return;
    }

    const textElement = document.getElementById('click-to-begin-text');
    if (!textElement) return;

    const ANIMATION_SPEED = 4;
    const MIN_SIZE_MULTIPLIER = 0.9;
    const MAX_SIZE_MULTIPLIER = 1.0;
    const BASE_FONT_SIZE = 20;
    const MS_PER_SECOND = 1000;

    const elapsedSeconds = (Date.now() - FB.clickToBeginStartTime) / MS_PER_SECOND;
    const breathCycle = (Math.sin(elapsedSeconds * ANIMATION_SPEED) + 1) / 2;
    const sizeMultiplier = MIN_SIZE_MULTIPLIER + breathCycle * (MAX_SIZE_MULTIPLIER - MIN_SIZE_MULTIPLIER);
    const currentFontSize = BASE_FONT_SIZE * sizeMultiplier;

    textElement.style.fontSize = currentFontSize + 'px';
    FB._clickToBeginRafId = requestAnimationFrame(FB.renderClickToBegin);
  };

  FB.showClickToBegin = function (): void {
    const clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin) {
      FB.startGame();
      return;
    }

    const video = document.getElementById('intro-video');
    if (video) {
      video.classList.add('hidden');
    }

    FB.clickToBeginStartTime = Date.now();
    clickToBegin.classList.remove('hidden');

    const GAME_START_DELAY_MS = 50;

    const handleClick = function (e: Event): void {
      e.preventDefault();
      e.stopPropagation();
      clickToBegin.classList.add('hidden');
      clickToBegin.removeEventListener('click', handleClick);
      clickToBegin.removeEventListener('touchstart', handleClick);

      if (FB._clickToBeginRafId) {
        cancelAnimationFrame(FB._clickToBeginRafId);
        FB._clickToBeginRafId = 0;
      }

      FB.startBackgroundMusic();
      FB.gameReady = true;
      FB.Input.tapped = false;
      FB.clickToBeginStartTime = null;

      setTimeout(() => {
        FB.startGame();
      }, GAME_START_DELAY_MS);
    };

    clickToBegin.addEventListener('click', handleClick, { once: true });
    clickToBegin.addEventListener('touchstart', handleClick, { once: true });

    FB.renderClickToBegin();
  };

  FB.startBackgroundMusic = function (): void {
    if (!FB.backgroundMusic) {
      const musicSrc = zappyAssetUrl('sounds/Static Demo Master 1 [Original Soundtrack by Sanyi].mp3');
      FB.backgroundMusic = new Audio(musicSrc);
      FB.backgroundMusicNext = new Audio(musicSrc);
      FB.backgroundMusic.preload = 'auto';
      FB.backgroundMusicNext.preload = 'auto';

      const switchToNext = (): void => {
        const temp = FB.backgroundMusic;
        FB.backgroundMusic = FB.backgroundMusicNext;
        FB.backgroundMusicNext = temp;
        if (FB.backgroundMusicNext) {
          FB.backgroundMusicNext.currentTime = 0;
        }
        if (FB.backgroundMusic) {
          FB.backgroundMusic.addEventListener('ended', switchToNext);
        }
      };

      const CROSSFADE_THRESHOLD_SEC = 0.02;
      FB.backgroundMusic.addEventListener('timeupdate', function () {
        const isNearEnd = this.duration && this.currentTime > this.duration - CROSSFADE_THRESHOLD_SEC;
        if (isNearEnd && FB.backgroundMusicNext?.paused) {
          FB.backgroundMusicNext.play().catch(() => {});
        }
      });

      FB.backgroundMusic.addEventListener('ended', switchToNext);
    }

    if (FB.backgroundMusic) {
      FB.backgroundMusic.play().catch((err: any) => {
        console.log('Background music play failed:', err);
      });
    }
  };

  FB.changeState = function (state: 'Splash' | 'Play' | 'GameOver'): void {
    const StateClass = window[state];
    if (StateClass) {
      FB.game = new StateClass();
      FB.game.init();
    }
  };

  FB.startGame = function (): void {
    const video = document.getElementById('intro-video');
    const clickToBegin = document.getElementById('click-to-begin');

    if (video) video.classList.add('hidden');
    if (clickToBegin) clickToBegin.classList.add('hidden');

    if (FB._clickToBeginRafId) {
      cancelAnimationFrame(FB._clickToBeginRafId);
      FB._clickToBeginRafId = 0;
    }

    FB.clickToBeginStartTime = null;
    FB.changeState('Splash');
    FB.loop();
  };

  FB.update = function (): void {
    if (FB.game) {
      FB.game.update();
    }
    FB.Input.tapped = false;
    FB.GameUtils.updateLasers();
  };

  FB.render = function (): void {
    if (!FB.ctx) return;
    FB.Draw.rect(0, 0, FB.WIDTH, FB.HEIGHT, FB.gradients[FB.bg_grad]);
    FB.GameUtils.renderLasers();
    for (let i = 0; i < FB.entities.length; i += 1) {
      FB.entities[i].render();
    }
    if (FB.game) {
      FB.game.render();
    }
  };

  FB.loop = function (): void {
    if (!FB._running) return;

    // Fixed timestep to avoid speedups on high-refresh-rate displays.
    // Run update at 60Hz and render once per frame.
    const now = performance.now();
    if (!FB._lastTime) FB._lastTime = now;
    let dt = now - FB._lastTime;
    FB._lastTime = now;

    // Cap huge gaps (tab switch) to avoid spiral of death.
    if (dt > 250) dt = 250;

    FB._accum = (FB._accum || 0) + dt;
    const step = 1000 / 60;
    while (FB._accum >= step) {
      FB.update();
      FB._accum -= step;
    }
    FB.render();

    FB._rafId = requestAnimationFrame(FB.loop);
  };

  FB._handlers.click = function (e: MouseEvent): void {
    if (!FB.gameReady) return;
    e.preventDefault();
    FB.Input.set(e);
  };
  FB._handlers.touchstart = function (e: TouchEvent): void {
    if (!FB.gameReady) return;
    e.preventDefault();
    if (e.touches[0]) {
      FB.Input.set(e.touches[0]);
    }
  };
  FB._handlers.touchmove = function (e: TouchEvent): void {
    e.preventDefault();
  };
  FB._handlers.touchend = function (e: TouchEvent): void {
    e.preventDefault();
  };
  FB._handlers.keydown = function (e: KeyboardEvent): void {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      FB.GameUtils.shootLaser();
    }
    FB.Input.keys[e.key.toLowerCase()] = true;
  };
  FB._handlers.keyup = function (e: KeyboardEvent): void {
    FB.Input.keys[e.key.toLowerCase()] = false;
  };
  FB._handlers.resize = function (): void {
    FB.resize();
  };

  // Init (SPA-friendly)
  FB.RATIO = FB.WIDTH / FB.HEIGHT;
  FB.ctx = FB.canvas.getContext('2d');
  if (!FB.ctx) {
    throw new Error('Failed to get 2d context from canvas');
  }
  FB.devicePixelRatio = window.devicePixelRatio || 1;
  FB.setupHighDPICanvas();
  FB.ua = navigator.userAgent.toLowerCase();
  FB.android = FB.ua.indexOf('android') > -1 ? true : false;
  FB.ios = FB.ua.indexOf('iphone') > -1 || FB.ua.indexOf('ipad') > -1 ? true : false;

  // Gradients
  let grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
  grad.addColorStop(0, '#036');
  grad.addColorStop(0.5, '#69a');
  grad.addColorStop(1, 'yellow');
  FB.gradients.dawn = grad;
  grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
  grad.addColorStop(0, '#69a');
  grad.addColorStop(0.5, '#9cd');
  grad.addColorStop(1, '#fff');
  FB.gradients.day = grad;
  grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
  grad.addColorStop(0, '#036');
  grad.addColorStop(0.3, '#69a');
  grad.addColorStop(1, 'pink');
  FB.gradients.dusk = grad;
  grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
  grad.addColorStop(0, '#036');
  grad.addColorStop(1, 'black');
  FB.gradients.night = grad;

  window.addEventListener('click', FB._handlers.click, false);
  window.addEventListener('touchstart', FB._handlers.touchstart, false);
  window.addEventListener('touchmove', FB._handlers.touchmove, false);
  window.addEventListener('touchend', FB._handlers.touchend, false);
  window.addEventListener('keydown', FB._handlers.keydown, false);
  window.addEventListener('keyup', FB._handlers.keyup, false);
  window.addEventListener('resize', FB._handlers.resize, false);

  FB.Buttons.init();
  FB.resize();

  FB._running = true;
  FB.showIntroVideo();

  return () => {
    FB._running = false;
    if (FB._rafId) cancelAnimationFrame(FB._rafId);
    FB._rafId = 0;

    window.removeEventListener('click', FB._handlers.click, false);
    window.removeEventListener('touchstart', FB._handlers.touchstart, false);
    window.removeEventListener('touchmove', FB._handlers.touchmove, false);
    window.removeEventListener('touchend', FB._handlers.touchend, false);
    window.removeEventListener('keydown', FB._handlers.keydown, false);
    window.removeEventListener('keyup', FB._handlers.keyup, false);
    window.removeEventListener('resize', FB._handlers.resize, false);

    try {
      if (FB.backgroundMusic) FB.backgroundMusic.pause();
      if (FB.backgroundMusicNext) FB.backgroundMusicNext.pause();
    } catch {}
  };
}

