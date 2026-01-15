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
        img.src = src + '?v=' + Date.now();
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
            var img = this.createImage("assets/images/numbers/font_small_" + n + '.png');
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
            var banner = that.createImage("assets/images/" + bannerName + ".png");
            var boltType = that.getBoltType(FB.score.bolts);
            var bolt = that.createImage('assets/images/bolt_' + boltType + '.png');
            var replay = that.createImage("assets/images/buttons/replay.png");
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
        
        FB.Draw.Image(scoreboard.banner, 42, 70);
        FB.Draw.Image(scoreboard.bolt, 55, 165);
        if (FB.lives > 0) {
            FB.Draw.Image(scoreboard.replay, 102.5, 260);
        } else {
            FB.Draw.text("Click anywhere to restart", 30, 280, 12, 'black');
        }
        FB.Draw.text(FB.score.bolts, 225, 174, 15, 'black');
        FB.Draw.text(scoreboard.highscore, 225, 214, 15, 'black');
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
