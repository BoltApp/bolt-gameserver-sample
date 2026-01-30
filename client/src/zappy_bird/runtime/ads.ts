import { getRuntime, getGameConfig } from './context';

let preloadedAd: unknown = null;
let currentButtonAdType: string | null = null;
let adCallback: ((buttonType: string) => void) | null = null;
let preloadStarted = false;

function pauseAllAudio(): void {
  const runtime = getRuntime();
  if (runtime.backgroundMusic && !runtime.backgroundMusic.paused) {
    runtime.backgroundMusic.pause();
    runtime.backgroundMusicWasPlaying = true;
  } else {
    runtime.backgroundMusicWasPlaying = false;
  }
  if (runtime.backgroundMusicNext && !runtime.backgroundMusicNext.paused) {
    runtime.backgroundMusicNext.pause();
  }
  if (runtime.Sound?.channels) {
    for (let i = 0; i < runtime.Sound.channels.length; i++) {
      const ch = runtime.Sound.channels[i].channel;
      if (ch && !ch.paused) ch.pause();
    }
  }
}

function resumeAllAudio(): void {
  const runtime = getRuntime();
  if (runtime.backgroundMusic && runtime.backgroundMusicWasPlaying) {
    runtime.backgroundMusic.play().catch((err: unknown) => {
      console.log('Background music resume failed:', err);
    });
  }
}

function cleanupAdElements(): void {
  const adIframe = document.getElementById('bolt-iframe-modal');
  if (adIframe) adIframe.remove();
  document.querySelectorAll('[id*="bolt"], [class*="bolt"]').forEach((el) => {
    if (el.tagName === 'DIV' || el.tagName === 'IFRAME') el.remove();
  });
}

function handleAdCompletion(): void {
  setTimeout(() => {
    const rewardType = currentButtonAdType;
    currentButtonAdType = null;
    const runtime = getRuntime();
    cleanupAdElements();
    resumeAllAudio();

    if (rewardType === 'bonusLife') {
      runtime.lives += 1;
      const gameOverState = runtime.game as { scoreboard?: unknown } | null;
      if (gameOverState && 'scoreboard' in gameOverState) {
        gameOverState.scoreboard = null;
        setTimeout(() => {
          runtime.GameUtils.initScoreboard((scoreboard) => {
            (gameOverState as { scoreboard: unknown }).scoreboard = scoreboard;
            const banner = scoreboard.banner;
            if (banner && !banner.complete) {
              banner.onload = () => {};
            }
          });
        }, 100);
      }
    } else if (rewardType === 'supportMode') {
      getGameConfig().spaceshipEnabled = true;
      runtime.GameUtils.showNotification('Support Systems Engaged');
    } else if (rewardType === 'voltageBoost') {
      getGameConfig().voltageBoost = true;
      runtime.GameUtils.showNotification('boosters charged');
    }
  }, 100);
}

export function preloadAd(): void {
  if (preloadedAd || preloadStarted) return;
  if (!window.BoltSDK) {
    window.addEventListener(
      'boltSDKReady',
      () => preloadAd(),
      { once: true }
    );
    return;
  }

  preloadStarted = true;
  const adLink = 'https://play.staging-bolt.com/';
  try {
    const ad = (window.BoltSDK as { gaming: { preloadAd: (url: string, opts: unknown) => unknown } }).gaming.preloadAd(adLink, {
      type: 'untimed',
      onClaim: () => {
        handleAdCompletion();
      },
      onError: () => {
        currentButtonAdType = null;
        resumeAllAudio();
      },
    });
    preloadedAd = ad ?? null;
  } catch (error) {
    console.error('Error preloading ad:', error);
    preloadedAd = null;
    preloadStarted = false;
  }
}

function showAd(): void {
  if (!preloadedAd) return;
  try {
    pauseAllAudio();
    (preloadedAd as { show(): void }).show();
  } catch (error) {
    console.error('Error showing ad:', error);
    currentButtonAdType = null;
    resumeAllAudio();
  }
}

function handleButtonAdImpl(buttonType: string): void {
  currentButtonAdType = buttonType;
  if (preloadedAd) {
    showAd();
  } else {
    preloadAd();
    setTimeout(() => {
      if (preloadedAd) showAd();
      else currentButtonAdType = null;
    }, 1000);
  }
}

export function getAdCallback(): ((buttonType: string) => void) | null {
  return adCallback;
}

export function initAdCallback(): void {
  adCallback = handleButtonAdImpl;
  if (typeof window !== 'undefined') {
    const w = window as unknown as { handleButtonAd?: (buttonType: string) => void; handleButtonAdImpl?: (buttonType: string) => void };
    w.handleButtonAd = handleButtonAdImpl;
    w.handleButtonAdImpl = handleButtonAdImpl;
  }
}
