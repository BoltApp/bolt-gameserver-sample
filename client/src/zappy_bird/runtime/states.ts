import type { GameState, Scoreboard, ButtonConfig, Pipe } from '../types';

const FB = window.FB!;

interface SplashState extends GameState {
  banner: HTMLImageElement;
  buttonConfigs: Record<string, ButtonConfig>;
}

window.Splash = function (this: SplashState) {
  this.banner = FB.GameUtils.createImage('/zappy_bird/assets/images/splash.png');
  this.buttonConfigs = FB.Buttons.configs;

  this.init = function (): void {
    FB.Sound.play(FB.Sound.swoosh);
    FB.GameUtils.initGameState();
    FB.GameUtils.initBackgroundEntities();
    FB.GameUtils.initSpaceship();

    // Preload ad for button clicks on splash screen
    if (!preloadedAd) {
      setTimeout(function () {
        preloadAd();
      }, 100);
    }
  };

  this.update = function (): void {
    FB.GameUtils.updateEntities();
    if (FB.Input.tapped && FB.ctx) {
      const x = FB.Input.x;
      const y = FB.Input.y;

      // Handle button clicks (supportMode, voltageBoost) - exclude bonusLife
      if (FB.Buttons.handleClick(x, y, this.buttonConfigs, ['bonusLife'])) {
        FB.Input.tapped = false;
        return;
      }

      // Only change to Play state if no button was clicked and lives > 0
      if (FB.lives > 0) {
        FB.changeState('Play');
        FB.Input.tapped = false;
      }
    }
  };

  this.render = function (): void {
    if (!FB.ctx) return;
    FB.GameUtils.renderLives();
    // Show support_mode and voltage_boost on splash screen, exclude bonusLife
    FB.Buttons.renderButtons(this.buttonConfigs, FB.ctx, ['bonusLife']);
    FB.GameUtils.renderNotification();

    if (FB.lives > 0) {
      FB.Draw.Image(this.banner, 66, 90);
    } else {
      FB.Draw.text('No Lives Remaining', 50, 200, 20, 'red');
      FB.Draw.text('Game Over', 80, 230, 18, 'black');
    }
  };
} as unknown as new () => SplashState;

interface PlayState extends GameState {}

window.Play = function (this: PlayState) {
  this.init = function (): void {
    FB.GameUtils.initSpaceship();
    FB.GameUtils.initPipes();

    FB.bird = new FB.Bird();
    FB.entities.push(FB.bird);
    FB.GameUtils.initFonts();

    setTimeout(() => {
      preloadAd();
    }, 100);
  };

  this.update = function (): void {
    FB.distance += 1;
    FB.GameUtils.checkLevelUp();

    if (FB.Input.tapped) {
      FB.score.taps += 1;
    }

    FB.GameUtils.updateEntities();

    if (!FB.bird) return;
    for (let i = 0; i < FB.entities.length; i += 1) {
      if (FB.entities[i].type === 'pipe') {
        const hit = FB.Collides(FB.bird, FB.entities[i] as Pipe);
        if (hit) {
          FB.Sound.play(FB.Sound.hit);
          FB.changeState('GameOver');
          break;
        }
      }
    }
  };

  this.render = function (): void {
    if (!FB.ctx) return;
    const X = FB.WIDTH / 2 - (FB.digits.length * 14) / 2;
    for (let i = 0; i < FB.digits.length; i++) {
      FB.Draw.Image(FB.fonts[Number(FB.digits[i])], X + i * 14, 10);
    }

    FB.GameUtils.renderLives();

    if (window.GAME_CONFIG?.voltageBoost) {
      FB.Draw.text('2x', FB.WIDTH - 30, 30, 12, 'black');
    }
  };
} as unknown as new () => PlayState;

interface GameOverState extends GameState {
  startTime: number;
  scoreboard: Scoreboard | null;
}

window.GameOver = function (this: GameOverState) {
  this.startTime = Date.now();
  this.scoreboard = null;

  this.init = function (): void {
    if (FB.lives > 0) {
      FB.lives -= 1;
    }

    FB.GameUtils.resetGameConfig();

    FB.GameUtils.initScoreboard((scoreboard) => {
      this.scoreboard = scoreboard;
    });
  };

  this.update = function (): void {
    if (FB.Input.tapped && FB.ctx) {
      const x = FB.Input.x;
      const y = FB.Input.y;

      const REPLAY_BUTTON_X = 102.5;
      const REPLAY_BUTTON_Y = 220;
      const REPLAY_BUTTON_WIDTH = 115;
      const REPLAY_BUTTON_HEIGHT = 70;

      if (FB.lives > 0) {
        if (x >= REPLAY_BUTTON_X && x <= REPLAY_BUTTON_X + REPLAY_BUTTON_WIDTH && 
            y >= REPLAY_BUTTON_Y && y <= REPLAY_BUTTON_Y + REPLAY_BUTTON_HEIGHT) {
          FB.changeState('Splash');
          FB.Input.tapped = false;
          return;
        }
      }

      // Handle button clicks (bonusLife, supportMode, voltageBoost)
      if (FB.Buttons.handleClick(x, y, FB.Buttons.configs, [])) {
        FB.Input.tapped = false;
        return;
      }

      if (FB.lives === 0) {
        FB.changeState('Splash');
      }
      FB.Input.tapped = false;
    }
    if (FB.bird) {
      FB.bird.update();
    }
  };

  this.render = function (): void {
    if (!FB.ctx) return;
    FB.GameUtils.renderLives();

    // Render scoreboard first (background)
    FB.GameUtils.renderScoreboard(this.scoreboard);

    // Show bonusLife button only when lives === 0
    if (FB.lives === 0) {
      const config = FB.Buttons.configs.bonusLife;
      const smoothingSettings = FB.Buttons.setupImageSmoothing(FB.ctx);
      FB.Buttons.enableImageSmoothing(FB.ctx);
      FB.Buttons.renderWithBreathing(config, FB.ctx, this.startTime);
      FB.Buttons.restoreImageSmoothing(FB.ctx, smoothingSettings);
    }

    // Show support_mode and voltage_boost buttons when lives > 0 (scoreboard_continue screen)
    // Render these AFTER scoreboard so they appear on top
    if (FB.lives > 0) {
      FB.Buttons.renderButtons(FB.Buttons.configs, FB.ctx, ['bonusLife']);
    }
  };
} as unknown as new () => GameOverState;

let preloadedAd: any = null;
let currentButtonAdType: string | null = null;

function preloadAd(): void {
  if (!window.BoltSDK) {
    console.warn('BoltSDK not initialized, waiting for initialization...');
    window.addEventListener(
      'boltSDKReady',
      () => {
        console.log('BoltSDK ready event received, preloading ad');
        preloadAd();
      },
      { once: true }
    );
    return;
  }

  const adLink = 'https://play.staging-bolt.com/';

  console.log('[AD] WARNING: Using hardcoded test ad link. onClaim may not fire if ad is not properly configured.');
  console.log('Preloading ad:', adLink);

  try {
    const ad = (window.BoltSDK as any).gaming.preloadAd(adLink, {
      type: 'untimed',
      onClaim: (): void => {
        console.log('[AD] onClaim callback fired - Ad claimed for button:', currentButtonAdType);
        handleAdCompletion(currentButtonAdType);
      },
      onError: (error: any): void => {
        console.error('[AD] onError callback - Ad error:', error);
        currentButtonAdType = null;
        resumeAllAudio();
      },
    });

    console.log('Ad object returned:', ad);
    preloadedAd = ad ?? null;
    if (preloadedAd) {
      console.log('Ad preloaded successfully', preloadedAd);
    } else {
      console.warn('preloadAd returned null');
    }
  } catch (error) {
    console.error('Error preloading ad:', error);
    preloadedAd = null;
  }
}

function showAd(): void {
  if (!preloadedAd) {
    return;
  }
  try {
    pauseAllAudio();
    console.log('Calling preloadedAd.show()...');
    (preloadedAd as any).show();
    console.log('Ad show() called');
  } catch (error) {
    console.error('Error showing ad:', error);
    currentButtonAdType = null;
    resumeAllAudio();
  }
}

window.handleButtonAd = function (buttonType: string): void {
  console.log('handleButtonAd called for:', buttonType);
  currentButtonAdType = buttonType;

  if (preloadedAd) {
    showAd();
  } else {
    console.warn('No preloaded ad available - ad may still be loading. Attempting to preload now...');
    preloadAd();
    setTimeout(() => {
      if (preloadedAd) {
        showAd();
      } else {
        console.error('Ad still not available after preload attempt - BoltSDK may not be initialized');
        currentButtonAdType = null;
      }
    }, 1000);
  }
};

function cleanupAdElements(): void {
  const adIframe = document.getElementById('bolt-iframe-modal');
  if (adIframe) {
    console.log('Removing ad iframe');
    adIframe.remove();
  }

  const boltContainers = document.querySelectorAll('[id*="bolt"], [class*="bolt"]');
  boltContainers.forEach((container) => {
    if (container.tagName === 'DIV' || container.tagName === 'IFRAME') {
      console.log('Removing Bolt element:', container.id || container.className);
      container.remove();
    }
  });
}

function handleAdCompletion(buttonType: string | null): void {
  console.log('handleAdCompletion called for:', buttonType);

  setTimeout(() => {
    cleanupAdElements();
    resumeAllAudio();

    // Handle completion based on button type
    if (buttonType === 'bonusLife') {
      // Add life and refresh scoreboard to show continue screen
      FB.lives += 1;
      console.log('Bonus life added, FB.lives is now:', FB.lives);
      // Get reference to current GameOver state - FB.game is the current state instance
      const gameOverState = FB.game as GameOverState | null;
      if (gameOverState && typeof gameOverState === 'object' && 'scoreboard' in gameOverState) {
        // Clear old scoreboard immediately so it doesn't render the old banner
        gameOverState.scoreboard = null;
        // Refresh scoreboard - this will now show scoreboard_continue since lives > 0
        // Use a shorter timeout to update faster
        setTimeout(() => {
          FB.GameUtils.initScoreboard((scoreboard) => {
            console.log('initScoreboard callback, FB.lives:', FB.lives, 'banner src:', scoreboard.banner.src);
            gameOverState.scoreboard = scoreboard;
            if (scoreboard.banner && !scoreboard.banner.complete) {
              scoreboard.banner.onload = () => {
                console.log('Scoreboard continue banner loaded via onload');
              };
            }
          });
        }, 100);
      } else {
        console.error('Could not find GameOver state to update scoreboard. FB.game:', FB.game);
      }
    } else if (buttonType === 'supportMode') {
      if (window.GAME_CONFIG) {
        window.GAME_CONFIG.spaceshipEnabled = true;
      }
      FB.GameUtils.showNotification('Support Systems Engaged');
    } else if (buttonType === 'voltageBoost') {
      if (window.GAME_CONFIG) {
        window.GAME_CONFIG.voltageBoost = true;
      }
      FB.GameUtils.showNotification('boosters charged');
    }

    currentButtonAdType = null;
  }, 100);
}

function pauseAllAudio(): void {
  // Pause background music
  if (FB.backgroundMusic && !FB.backgroundMusic.paused) {
    FB.backgroundMusic.pause();
    FB.backgroundMusicWasPlaying = true;
  } else {
    FB.backgroundMusicWasPlaying = false;
  }
  if (FB.backgroundMusicNext && !FB.backgroundMusicNext.paused) {
    FB.backgroundMusicNext.pause();
  }

  // Pause all sound channels
  if (FB.Sound && FB.Sound.channels) {
    for (let i = 0; i < FB.Sound.channels.length; i++) {
      if (FB.Sound.channels[i].channel && !FB.Sound.channels[i].channel.paused) {
        FB.Sound.channels[i].channel.pause();
      }
    }
  }
}

function resumeAllAudio(): void {
  if (FB.backgroundMusic && FB.backgroundMusicWasPlaying) {
    FB.backgroundMusic.play().catch((err: any) => {
      console.log('Background music resume failed:', err);
    });
  }
}

export {};