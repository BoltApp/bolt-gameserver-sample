// @ts-nocheck
import { zappyAssetUrl } from '../asset';

// This is a lightly-adapted version of the legacy core engine:
// - uses a provided canvas (SPA-friendly)
// - does not auto-register window "load" handlers
// - uses requestAnimationFrame with a cancelable id
// - keeps legacy APIs on `window.FB` / `window.Splash|Play|GameOver`

export function startCore(canvas: HTMLCanvasElement): () => void {
  const FB = (window as any).FB;

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
    _running: false,
    _handlers: {},
  });

  FB.setupHighDPICanvas = function () {
    FB.canvas.width = FB.WIDTH * FB.devicePixelRatio;
    FB.canvas.height = FB.HEIGHT * FB.devicePixelRatio;
    FB.canvas.style.width = FB.WIDTH + 'px';
    FB.canvas.style.height = FB.HEIGHT + 'px';
    // Ensure transforms don't compound across remounts/restarts.
    if (FB.ctx && FB.ctx.setTransform) {
      FB.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    FB.ctx.scale(FB.devicePixelRatio, FB.devicePixelRatio);
    FB.ctx.imageSmoothingEnabled = true;
    FB.ctx.imageSmoothingQuality = 'high';
  };

  FB.resize = function () {
    // Fit to the canvas container (SPA-safe) instead of full window height
    // to avoid scrolling under the site nav/header/footer.
    var parent = FB.canvas && FB.canvas.parentElement;
    var maxW = (parent && parent.clientWidth) ? parent.clientWidth : window.innerWidth;
    var maxH = (parent && parent.clientHeight) ? parent.clientHeight : window.innerHeight;

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

    window.setTimeout(function () {
      window.scrollTo(0, 1);
    }, 1);
  };

  FB.showIntroVideo = function () {
    var video = document.getElementById('intro-video');
    if (!video) {
      FB.showClickToBegin();
      return;
    }

    // If the video can't play/advance (codec/autoplay quirks), don't strand the user on a black screen.
    var fallbackTimer = window.setTimeout(function () {
      video.classList.add('hidden');
      FB.showClickToBegin();
    }, 1500);

    var isFirstTime = !localStorage.getItem('hasSeenIntro');
    var nav = performance.getEntriesByType('navigation')[0];
    var wasRefreshed = nav && nav.type === 'reload';

    if (!isFirstTime && !wasRefreshed) {
      var hasSeenInSession = sessionStorage.getItem('hasSeenIntro');
      if (hasSeenInSession === 'true') {
        window.clearTimeout(fallbackTimer);
        video.classList.add('hidden');
        FB.showClickToBegin();
        return;
      }
    }

    if (isFirstTime) {
      localStorage.setItem('hasSeenIntro', 'true');
    }

    video.addEventListener(
      'ended',
      function () {
        window.clearTimeout(fallbackTimer);
        video.classList.add('hidden');
        sessionStorage.setItem('hasSeenIntro', 'true');
        FB.showClickToBegin();
      },
      { once: true }
    );

    video.addEventListener(
      'error',
      function () {
        window.clearTimeout(fallbackTimer);
        video.classList.add('hidden');
        FB.showClickToBegin();
      },
      { once: true }
    );

    video.play().catch(function () {
      window.clearTimeout(fallbackTimer);
      video.classList.add('hidden');
      FB.showClickToBegin();
    });
  };

  FB.renderClickToBegin = function () {
    var clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin || clickToBegin.classList.contains('hidden') || !FB.clickToBeginStartTime) {
      return;
    }

    var textElement = document.getElementById('click-to-begin-text');
    if (!textElement) return;

    var elapsedTime = (Date.now() - FB.clickToBeginStartTime) / 1000;
    var breath = (Math.sin(elapsedTime * 4) + 1) / 2;
    var sizeMultiplier = 0.9 + breath * 0.1;
    var baseSize = 20;
    var currentSize = baseSize * sizeMultiplier;
    textElement.style.fontSize = currentSize + 'px';

    requestAnimationFrame(FB.renderClickToBegin);
  };

  FB.showClickToBegin = function () {
    var clickToBegin = document.getElementById('click-to-begin');
    if (!clickToBegin) {
      FB.startGame();
      return;
    }

    FB.clickToBeginStartTime = Date.now();
    clickToBegin.classList.remove('hidden');

    var handleClick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      clickToBegin.classList.add('hidden');
      clickToBegin.removeEventListener('click', handleClick);
      clickToBegin.removeEventListener('touchstart', handleClick);
      FB.startBackgroundMusic();
      FB.gameReady = true;
      FB.Input.tapped = false;
      FB.clickToBeginStartTime = null;
      setTimeout(function () {
        FB.startGame();
      }, 50);
    };

    clickToBegin.addEventListener('click', handleClick, { once: true });
    clickToBegin.addEventListener('touchstart', handleClick, { once: true });

    FB.renderClickToBegin();
  };

  FB.startBackgroundMusic = function () {
    if (!FB.backgroundMusic) {
      var musicSrc = zappyAssetUrl('sounds/Static Demo Master 1 [Original Soundtrack by Sanyi].mp3');
      FB.backgroundMusic = new Audio(musicSrc);
      FB.backgroundMusicNext = new Audio(musicSrc);
      FB.backgroundMusic.preload = 'auto';
      FB.backgroundMusicNext.preload = 'auto';

      var switchToNext = function () {
        var temp = FB.backgroundMusic;
        FB.backgroundMusic = FB.backgroundMusicNext;
        FB.backgroundMusicNext = temp;
        FB.backgroundMusicNext.currentTime = 0;
        FB.backgroundMusic.addEventListener('ended', switchToNext);
      };

      FB.backgroundMusic.addEventListener('timeupdate', function () {
        if (this.duration && this.currentTime > this.duration - 0.02 && FB.backgroundMusicNext.paused) {
          FB.backgroundMusicNext.play().catch(function () {});
        }
      });

      FB.backgroundMusic.addEventListener('ended', switchToNext);
    }

    FB.backgroundMusic.play().catch(function (err) {
      console.log('Background music play failed:', err);
    });
  };

  FB.changeState = function (state) {
    FB.game = new (window as any)[state]();
    FB.game.init();
  };

  FB.startGame = function () {
    FB.changeState('Splash');
    FB.loop();
  };

  FB.update = function () {
    FB.game.update();
    FB.Input.tapped = false;
    FB.GameUtils.updateLasers();
  };

  FB.render = function () {
    FB.Draw.rect(0, 0, FB.WIDTH, FB.HEIGHT, FB.gradients[FB.bg_grad]);
    FB.GameUtils.renderLasers();
    for (var i = 0; i < FB.entities.length; i += 1) {
      FB.entities[i].render();
    }
    FB.game.render();
  };

  FB.loop = function () {
    if (!FB._running) return;

    // Fixed timestep to avoid speedups on high-refresh-rate displays.
    // Run update at 60Hz and render once per frame.
    var now = performance.now();
    if (!FB._lastTime) FB._lastTime = now;
    var dt = now - FB._lastTime;
    FB._lastTime = now;

    // Cap huge gaps (tab switch) to avoid spiral of death.
    if (dt > 250) dt = 250;

    FB._accum = (FB._accum || 0) + dt;
    var step = 1000 / 60;
    while (FB._accum >= step) {
      FB.update();
      FB._accum -= step;
    }
    FB.render();

    FB._rafId = requestAnimationFrame(FB.loop);
  };

  FB._handlers.click = function (e) {
    if (!FB.gameReady) return;
    e.preventDefault();
    FB.Input.set(e);
  };
  FB._handlers.touchstart = function (e) {
    if (!FB.gameReady) return;
    e.preventDefault();
    FB.Input.set(e.touches[0]);
  };
  FB._handlers.touchmove = function (e) {
    e.preventDefault();
  };
  FB._handlers.touchend = function (e) {
    e.preventDefault();
  };
  FB._handlers.keydown = function (e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      FB.GameUtils.shootLaser();
    }
    FB.Input.keys[e.key.toLowerCase()] = true;
  };
  FB._handlers.keyup = function (e) {
    FB.Input.keys[e.key.toLowerCase()] = false;
  };
  FB._handlers.resize = function () {
    FB.resize();
  };

  // Init (SPA-friendly)
  FB.RATIO = FB.WIDTH / FB.HEIGHT;
  FB.ctx = FB.canvas.getContext('2d');
  FB.devicePixelRatio = window.devicePixelRatio || 1;
  FB.setupHighDPICanvas();
  FB.ua = navigator.userAgent.toLowerCase();
  FB.android = FB.ua.indexOf('android') > -1 ? true : false;
  FB.ios = FB.ua.indexOf('iphone') > -1 || FB.ua.indexOf('ipad') > -1 ? true : false;

  // Gradients
  var grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
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

