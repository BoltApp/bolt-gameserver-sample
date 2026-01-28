// @ts-nocheck
import { zappyAssetUrl } from '../asset';

const FB = (window as any).FB;

FB.GameUtils = {
    
    resetGameConfig: function() {
        window.GAME_CONFIG.spaceshipEnabled = false;
        window.GAME_CONFIG.voltageBoost = false;
        FB.spaceship = null;
    },
    
    initGameState: function() {
        FB.distance = 0;
        FB.bg_grad = "day";
        FB.entities = [];
        FB.lasers = [];
        FB.score.taps = FB.score.bolts = 0;
        if (FB.lives === undefined || FB.lives <= 0) {
            FB.lives = 3;
        }
        this.resetGameConfig();
    },
    
    createImage: function(src) {
        var img = new Image();
        // Rewrite static code to Vite URLs for bundled assets.
        var prefix = '/zappy_bird/assets/';
        if (typeof src === 'string' && src.indexOf(prefix) === 0) {
            img.src = zappyAssetUrl(src.substring(prefix.length));
        } else {
            img.src = src;
        }
        return img;
    },
    
    updateEntities: function() {
        for (var i = 0; i < FB.entities.length; i += 1) {
            FB.entities[i].update();
        }
    },
    
    getNextGradient: function() {
        var gradients = ["day", "dusk", "night", "dawn"];
        for (var i = 0; i < gradients.length; i++) {
            if (FB.bg_grad === gradients[i]) {
                if (i == gradients.length - 1) {
                    return "day";
                } else {
                    return gradients[i + 1];
                }
            }
        }
        return "day";
    },
    
    checkLevelUp: function() {
        if ((FB.distance % 2048) === 0) {
            FB.bg_grad = this.getNextGradient();
            return true;
        }
        return false;
    },
    
    renderLives: function() {
        if (FB.lives > 0) {
            FB.Draw.text("Lives: " + FB.lives + "x", 15, 30, 12, 'black');
        }
    },
    
    initBackgroundEntities: function() {
        FB.entities.push(new FB.Cloud(30, ~~(Math.random() * FB.HEIGHT / 2)));
        FB.entities.push(new FB.Cloud(130, ~~(Math.random() * FB.HEIGHT / 2)));
        FB.entities.push(new FB.Cloud(230, ~~(Math.random() * FB.HEIGHT / 2)));
        
        for (var i = 0; i < 2; i += 1) {
            FB.entities.push(new FB.BottomBar(FB.WIDTH * i, FB.HEIGHT - 100, FB.WIDTH));
        }
        
        FB.entities.push(new FB.City(~~(Math.random() * FB.WIDTH), 0));
        FB.entities.push(new FB.City(~~(Math.random() * FB.WIDTH - 200), 0));
        FB.entities.push(new FB.City(~~(Math.random() * FB.WIDTH - 240), 0));
    },
    
    initSpaceship: function() {
        if (window.GAME_CONFIG.spaceshipEnabled) {
            FB.spaceship = new FB.Spaceship();
            FB.entities.push(FB.spaceship);
        }
    },
    
    initPipes: function() {
        FB.entities.push(new FB.Pipe(FB.WIDTH * 2, 50));
        FB.entities.push(new FB.Pipe(FB.WIDTH * 2 + FB.WIDTH / 2, 50));
        FB.entities.push(new FB.Pipe(FB.WIDTH * 3, 50));
    },
    
    initFonts: function() {
        for (var n = 0; n < 10; n++) {
            var img = this.createImage("/zappy_bird/assets/images/numbers/font_small_" + n + '.png');
            FB.fonts.push(img);
        }
        FB.digits = ["0"];
    },
    
    getBoltType: function(score) {
        if (score >= 4) return "stack";
        if (score >= 3) return "pink";
        if (score >= 2) return "blue";
        return "light_blue";
    },
    
    initScoreboard: function(callback) {
        var that = this;
        setTimeout(function() {
            FB.Sound.play(FB.Sound.die);
            var bannerName = (FB.lives > 0) ? "scoreboard_continue" : "scoreboard_game_over";
            console.log('initScoreboard: FB.lives =', FB.lives, 'selecting banner:', bannerName);
            var banner = that.createImage("/zappy_bird/assets/images/" + bannerName + ".png");
            var boltType = that.getBoltType(FB.score.bolts);
            var bolt = that.createImage('/zappy_bird/assets/images/bolt_' + boltType + '.png');
            var replay = that.createImage("/zappy_bird/assets/images/buttons/replay.png");
            var highscore = FB.Storage.getHighScore();
            
            if (callback) {
                callback({
                    banner: banner,
                    bolt: bolt,
                    replay: replay,
                    highscore: highscore
                });
            }
        }, 500);
    },
    
    renderScoreboard: function(scoreboard) {
        if (!scoreboard || !scoreboard.banner) return;
        
        // Only render if banner image is loaded
        if (!scoreboard.banner.complete || scoreboard.banner.naturalWidth === 0) {
            return;
        }
        
        // Scale both banners to 0.8 their current size
        var scale = 0.8;
        var bannerWidth = scoreboard.banner.naturalWidth * scale;
        var bannerHeight = scoreboard.banner.naturalHeight * scale;
        var bannerX = 42 + (scoreboard.banner.naturalWidth - bannerWidth) / 2;
        var bannerY = 30 + (scoreboard.banner.naturalHeight - bannerHeight) / 2;
        
        // Move scoreboard elements up to make room for support_mode and voltage_boost buttons
        FB.ctx.drawImage(scoreboard.banner, bannerX, bannerY, bannerWidth, bannerHeight);
        if (scoreboard.bolt && scoreboard.bolt.complete) {
            FB.Draw.Image(scoreboard.bolt, 70, 133);
        }
        if (FB.lives > 0) {
            if (scoreboard.replay && scoreboard.replay.complete) {
                FB.Draw.Image(scoreboard.replay, 102.5, 220);
            }
        } else {
            // Center the text and make it neon green with black outline
            var text = "Click anywhere to restart";
            FB.ctx.font = 'bold 12px Monospace';
            var textWidth = FB.ctx.measureText(text).width;
            var textX = (FB.WIDTH - textWidth) / 2;
            
            // Draw black outline
            FB.ctx.strokeStyle = '#000000';
            FB.ctx.lineWidth = 3;
            FB.ctx.strokeText(text, textX, 240);
            
            // Draw neon green fill
            FB.ctx.fillStyle = '#39ff14';
            FB.ctx.fillText(text, textX, 240);
        }
        FB.Draw.text(FB.score.bolts, 216, 140, 15, 'black');
        FB.Draw.text(scoreboard.highscore, 216, 176, 15, 'black');
    },
    
    shootLaser: function() {
        if (!window.GAME_CONFIG.spaceshipEnabled || !FB.spaceship) {
            return;
        }
        var spaceshipImgHeight = FB.spaceship.img.naturalHeight || 50;
        var spaceshipScale = 0.2;
        var laserY = FB.spaceship.y + (spaceshipImgHeight * spaceshipScale) - 20;
        FB.lasers.push(new FB.Laser(22, laserY));
    },
    
    updateLasers: function() {
        if (!window.GAME_CONFIG.spaceshipEnabled) return;
        
        for (var i = FB.lasers.length - 1; i >= 0; i--) {
            FB.lasers[i].update();
            if (FB.lasers[i].remove) {
                FB.lasers.splice(i, 1);
            }
        }
    },
    
    renderLasers: function() {
        if (!window.GAME_CONFIG.spaceshipEnabled) return;
        
        for (var i = 0; i < FB.lasers.length; i += 1) {
            FB.lasers[i].render();
        }
    },
    
    showNotification: function(message) {
        FB.notification.message = message;
        FB.notification.startTime = Date.now();
    },
    
    renderNotification: function() {
        if (!FB.notification.message || !FB.notification.startTime) {
            return;
        }
        
        var elapsed = Date.now() - FB.notification.startTime;
        if (elapsed > FB.notification.duration) {
            FB.notification.message = null;
            FB.notification.startTime = null;
            return;
        }
        
        var config = FB.notification.config;
        var text = config.prefix + FB.notification.message + config.suffix;
        
        FB.ctx.font = 'bold ' + config.fontSize + 'px Monospace';
        var textWidth = FB.ctx.measureText(text).width;
        var x = (FB.WIDTH - textWidth) / 2;
        
        FB.Draw.text(text, x, config.y, config.fontSize, config.color);
    }
};

// Stub for handleButtonAd - will be overridden in states.js
// This ensures the function exists when buttons.js loads
window.handleButtonAd = function(buttonType) {
    // This will be replaced by the real implementation in states.js
    // If this is called, it means states.js hasn't loaded yet, which shouldn't happen
    console.warn('handleButtonAd stub called - states.js should have overridden this:', buttonType);
};

export {};
