// @ts-nocheck
const FB = (window as any).FB;

window.Splash = function(){
	
	this.banner = FB.GameUtils.createImage("/zappy_bird/assets/images/splash.png");
	this.buttonConfigs = FB.Buttons.configs;
	
	this.init = function(){
		FB.Sound.play(FB.Sound.swoosh);
		FB.GameUtils.initGameState();
		FB.GameUtils.initBackgroundEntities();
		FB.GameUtils.initSpaceship();
		
		// Preload ad for button clicks on splash screen
		if (!preloadedAd) {
			setTimeout(function() {
				preloadAd();
			}, 100);
		}
	}
	
	this.update = function(){
		FB.GameUtils.updateEntities();
		if (FB.Input.tapped) {
			var x = FB.Input.x;
			var y = FB.Input.y;
			
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
	}
	
	this.render = function(){
		FB.GameUtils.renderLives();
		// Show support_mode and voltage_boost on splash screen, exclude bonusLife
		FB.Buttons.renderButtons(this.buttonConfigs, FB.ctx, ['bonusLife']);
		FB.GameUtils.renderNotification();
		
		if (FB.lives > 0) {
			FB.Draw.Image(this.banner, 66, 90);
		} else {
			FB.Draw.text("No Lives Remaining", 50, 200, 20, 'red');
			FB.Draw.text("Game Over", 80, 230, 18, 'black');
		}
	}

}

window.Play = function(){
	
	this.init = function(){
		FB.GameUtils.initSpaceship();
		FB.GameUtils.initPipes();
		
		FB.bird = new FB.Bird();
		FB.entities.push(FB.bird);
		FB.GameUtils.initFonts();

		setTimeout(function() {
			preloadAd();
		}, 100);
	}
	
	this.update = function() { 
		FB.distance += 1;
		FB.GameUtils.checkLevelUp();

		if (FB.Input.tapped) {
			FB.score.taps += 1;
		}

		FB.GameUtils.updateEntities();
		
		for (var i = 0; i < FB.entities.length; i += 1) {
			if (FB.entities[i].type === 'pipe') {
				var hit = FB.Collides(FB.bird, FB.entities[i]);
				if (hit) {
					FB.Sound.play(FB.Sound.hit);
					FB.changeState('GameOver');
					break;
				}
			}
		}
	}
	
	this.render = function() { 
		var X = (FB.WIDTH / 2 - (FB.digits.length * 14) / 2);
		for (var i = 0; i < FB.digits.length; i++) {
			FB.Draw.Image(FB.fonts[Number(FB.digits[i])], X + (i * 14), 10);
		}
		
		FB.GameUtils.renderLives();
		
		if (window.GAME_CONFIG.voltageBoost) {
			FB.Draw.text("2x", FB.WIDTH - 30, 30, 12, 'black');
		}
	}

}

window.GameOver = function(){
	
	this.startTime = Date.now();
	this.scoreboard = null;
	
	this.init = function(){
		if (FB.lives > 0) {
			FB.lives -= 1;
		}
		
		FB.GameUtils.resetGameConfig();
		
		var that = this;
		FB.GameUtils.initScoreboard(function(scoreboard) {
			that.scoreboard = scoreboard;
		});
	}
	
	this.update = function(){
		if (FB.Input.tapped) {
			var x = FB.Input.x;
			var y = FB.Input.y;
			
			// Check replay button FIRST (before other buttons) - it should NOT trigger ads
			if (FB.lives > 0) {
				// Replay button at y: 220
				if (x >= 102.5 && x <= 102.5 + 115 && y >= 220 && y <= 220 + 70) {
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
		FB.bird.update();
	}
	
	this.render = function(){
		FB.GameUtils.renderLives();
		
		// Render scoreboard first (background)
		FB.GameUtils.renderScoreboard(this.scoreboard);
		
		// Show bonusLife button only when lives === 0
		if (FB.lives === 0) {
			var config = FB.Buttons.configs.bonusLife;
			var smoothingSettings = FB.Buttons.setupImageSmoothing(FB.ctx);
			FB.Buttons.enableImageSmoothing(FB.ctx);
			FB.Buttons.renderWithBreathing(config, FB.ctx, this.startTime);
			FB.Buttons.restoreImageSmoothing(FB.ctx, smoothingSettings);
		}
		
		// Show support_mode and voltage_boost buttons when lives > 0 (scoreboard_continue screen)
		// Render these AFTER scoreboard so they appear on top
		if (FB.lives > 0) {
			FB.Buttons.renderButtons(FB.Buttons.configs, FB.ctx, ['bonusLife']);
		}
	}

}

function initializeBackgroundEntities() {
	if (window.GAME_CONFIG.spaceshipEnabled) {
		FB.spaceship = new FB.Spaceship();
		FB.entities.push(FB.spaceship);
	}
	FB.entities.push(new FB.Cloud(30, ~~ (Math.random() * FB.HEIGHT / 2)));
	FB.entities.push(new FB.Cloud(130, ~~ (Math.random() * FB.HEIGHT / 2)));
	FB.entities.push(new FB.Cloud(230, ~~ (Math.random() * FB.HEIGHT / 2)));
	for (i = 0; i < 2; i += 1) {
		FB.entities.push(new FB.BottomBar(FB.WIDTH * i, FB.HEIGHT - 100, FB.WIDTH));
	}
	FB.entities.push(new FB.Tree(~~(Math.random() * FB.WIDTH), FB.HEIGHT - 160));
	FB.entities.push(new FB.Tree(~~(Math.random() * FB.WIDTH + 50), FB.HEIGHT - 160));
	FB.entities.push(new FB.Tree(~~(Math.random() * FB.WIDTH + 100), FB.HEIGHT - 160));
}

var preloadedAd = null;
var currentButtonAdType = null;

function preloadAd() {
	if (!window.BoltSDK) {
		console.warn('BoltSDK not initialized, waiting for initialization...');
		window.addEventListener('boltSDKReady', function() {
			console.log('BoltSDK ready event received, preloading ad');
			preloadAd();
		}, { once: true });
		return;
	}
	
	var adLink = "https://play.staging-bolt.com/";
	
	console.log('[AD] WARNING: Using hardcoded test ad link. onClaim may not fire if ad is not properly configured.');
	console.log('Preloading ad:', adLink);
	
	try {
		var ad = window.BoltSDK.gaming.preloadAd(adLink, {
			type: "untimed",
			onClaim: function() {
				console.log('[AD] onClaim callback fired - Ad claimed for button:', currentButtonAdType);
				handleAdCompletion(currentButtonAdType);
			},
			onError: function(error) {
				console.error('[AD] onError callback - Ad error:', error);
				currentButtonAdType = null;
				// Resume audio on error
				resumeAllAudio();
				// Don't change state on error, just clear the button type
			}
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

window.handleButtonAd = function(buttonType) {
	console.log('handleButtonAd called for:', buttonType);
	currentButtonAdType = buttonType;
	
	if (preloadedAd) {
		try {
			// Only pause audio when ad is actually about to show
			pauseAllAudio();
			console.log('Calling preloadedAd.show()...');
			preloadedAd.show();
			console.log('Ad show() called');
		} catch (error) {
			console.error('Error showing ad:', error);
			currentButtonAdType = null;
			resumeAllAudio();
		}
	} else {
		console.warn('No preloaded ad available - ad may still be loading. Attempting to preload now...');
		// Try to preload the ad immediately if it's not ready
		preloadAd();
		// If BoltSDK isn't ready, this will set up a listener
		// Otherwise, wait a moment for preload to complete
		setTimeout(function() {
			if (preloadedAd) {
				try {
					pauseAllAudio();
					console.log('Calling preloadedAd.show() after delayed preload...');
					preloadedAd.show();
					console.log('Ad show() called');
				} catch (error) {
					console.error('Error showing ad after preload:', error);
					currentButtonAdType = null;
					resumeAllAudio();
				}
			} else {
				console.error('Ad still not available after preload attempt - BoltSDK may not be initialized');
				currentButtonAdType = null;
			}
		}, 1000);
	}
};

function handleAdCompletion(buttonType) {
	console.log('handleAdCompletion called for:', buttonType);
	
	setTimeout(function() {
		// Clean up ad iframe
		var adIframe = document.getElementById('bolt-iframe-modal');
		if (adIframe) {
			console.log('Removing ad iframe');
			adIframe.remove();
		}
		
		var boltContainers = document.querySelectorAll('[id*="bolt"], [class*="bolt"]');
		boltContainers.forEach(function(container) {
			if (container.tagName === 'DIV' || container.tagName === 'IFRAME') {
				console.log('Removing Bolt element:', container.id || container.className);
				container.remove();
			}
		});
		
		// Resume all audio
		resumeAllAudio();
		
		// Handle completion based on button type
		if (buttonType === 'bonusLife') {
			// Add life and refresh scoreboard to show continue screen
			FB.lives += 1;
			console.log('Bonus life added, FB.lives is now:', FB.lives);
			// Get reference to current GameOver state - FB.game is the current state instance
			var gameOverState = FB.game;
			if (gameOverState && typeof gameOverState === 'object' && gameOverState.scoreboard !== undefined) {
				// Clear old scoreboard immediately so it doesn't render the old banner
				gameOverState.scoreboard = null;
				// Refresh scoreboard - this will now show scoreboard_continue since lives > 0
				// Use a shorter timeout to update faster
				setTimeout(function() {
					FB.GameUtils.initScoreboard(function(scoreboard) {
						console.log('initScoreboard callback, FB.lives:', FB.lives, 'banner src:', scoreboard.banner.src);
						// Set the scoreboard - renderScoreboard will wait for image to load
						gameOverState.scoreboard = scoreboard;
						// Force image load with cache busting
						if (scoreboard.banner && !scoreboard.banner.complete) {
							scoreboard.banner.onload = function() {
								console.log('Scoreboard continue banner loaded via onload');
							};
						}
					});
				}, 100);
			} else {
				console.error('Could not find GameOver state to update scoreboard. FB.game:', FB.game);
			}
		} else if (buttonType === 'supportMode') {
			window.GAME_CONFIG.spaceshipEnabled = true;
			FB.GameUtils.showNotification("Support Systems Engaged");
		} else if (buttonType === 'voltageBoost') {
			window.GAME_CONFIG.voltageBoost = true;
			FB.GameUtils.showNotification("boosters charged");
		}
		
		currentButtonAdType = null;
	}, 100);
}

function pauseAllAudio() {
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
		for (var i = 0; i < FB.Sound.channels.length; i++) {
			if (FB.Sound.channels[i].channel && !FB.Sound.channels[i].channel.paused) {
				FB.Sound.channels[i].channel.pause();
			}
		}
	}
}

function resumeAllAudio() {
	// Resume background music if it was playing
	if (FB.backgroundMusic && FB.backgroundMusicWasPlaying) {
		FB.backgroundMusic.play().catch(function(err) {
			console.log('Background music resume failed:', err);
		});
	}
}

export {};