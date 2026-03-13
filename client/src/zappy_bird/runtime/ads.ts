import type { ZappyBirdRuntime } from './runtime';
import { initScoreboard, showNotification } from './utils';
import { BoltSDK } from '@boltpay/bolt-js';


let runtimeRef: ZappyBirdRuntime | null = null;
let preloadedAd: unknown = null;
let currentButtonAdType: string | null = null;
let adCallback: ((buttonType: string) => void) | null = null;
let preloadStarted = false;

function pauseAllAudio(): void {
  const r = runtimeRef;
  if (!r) return;
  if (r.backgroundMusic && !r.backgroundMusic.paused) {
    r.backgroundMusic.pause();
    r.backgroundMusicWasPlaying = true;
  } else {
    r.backgroundMusicWasPlaying = false;
  }
  if (r.backgroundMusicNext && !r.backgroundMusicNext.paused) {
    r.backgroundMusicNext.pause();
  }
  if (r.Sound?.channels) {
    for (let i = 0; i < r.Sound.channels.length; i++) {
      const ch = r.Sound.channels[i].channel;
      if (ch && !ch.paused) ch.pause();
    }
  }
}

function resumeAllAudio(): void {
  const r = runtimeRef;
  if (!r) return;
  if (r.backgroundMusic && r.backgroundMusicWasPlaying) {
    r.backgroundMusic.play().catch((err: unknown) => {
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
    cleanupAdElements();
    resumeAllAudio();
    preloadedAd = null;
    preloadStarted = false;
    preloadAd();
    const rewardType = currentButtonAdType;
    currentButtonAdType = null;
    const r = runtimeRef;
    if (!r) return;

    if (rewardType === 'bonusLife') {
      r.lives += 1;
      const gameOverState = r.game as { scoreboard?: unknown } | null;
      if (gameOverState && 'scoreboard' in gameOverState) {
        gameOverState.scoreboard = null;
        setTimeout(() => {
          initScoreboard(r, (scoreboard) => {
            (gameOverState as { scoreboard: unknown }).scoreboard = scoreboard;
            const banner = scoreboard.banner;
            if (banner && !banner.complete) {
              banner.onload = () => {};
            }
          });
        }, 100);
      }
    } else if (rewardType === 'supportMode') {
      r.spaceshipEnabled = true;
      showNotification(r, 'Support Systems Engaged');
    } else if (rewardType === 'voltageBoost') {
      r.voltageBoost = true;
      showNotification(r, 'boosters charged');
    }
  }, 100);
}

export function preloadAd(): void {
  if (preloadedAd || preloadStarted) return;
  if (!BoltSDK) {
    window.addEventListener(
      'boltSDKReady',
      () => preloadAd(),
      { once: true }
    );
    return;
  }

  preloadStarted = true;
 
  try {
    const ad = (BoltSDK.gaming.preloadAd({
      onClaim: () => {
        handleAdCompletion();
      },
    }));
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

export function registerAdCallback(runtime: ZappyBirdRuntime): void {
  runtimeRef = runtime;
  adCallback = handleButtonAdImpl;
  if (typeof window !== 'undefined') {
    const w = window as unknown as { handleButtonAd?: (buttonType: string) => void; handleButtonAdImpl?: (buttonType: string) => void };
    w.handleButtonAd = handleButtonAdImpl;
    w.handleButtonAdImpl = handleButtonAdImpl;
  }
}
