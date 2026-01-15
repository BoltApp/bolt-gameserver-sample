window.Splash = function(){
	
	this.banner = FB.GameUtils.createImage("assets/images/splash.png");
	this.buttonConfigs = FB.Buttons.configs;
	
	this.init = function(){
		FB.Sound.play(FB.Sound.swoosh);
		FB.GameUtils.initGameState();
		FB.GameUtils.initBackgroundEntities();
		FB.GameUtils.initSpaceship();
	}
	
	this.update = function(){
		FB.GameUtils.updateEntities();
		if (FB.Input.tapped) {
			var x = FB.Input.x;
			var y = FB.Input.y;
			
			if (FB.Buttons.handleClick(x, y, this.buttonConfigs, ['bonusLife'])) {
				FB.Input.tapped = false;
				return;
			}
			
			if (FB.lives > 0) {
				FB.changeState('Play');
				FB.Input.tapped = false;
			}
		}
	}
	
	this.render = function(){
		FB.GameUtils.renderLives();
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
			
			if (FB.lives === 0) {
				var config = FB.Buttons.configs.bonusLife;
				if (FB.Buttons.isPointInButton(x, y, config)) {
					config.onClick();
					var that = this;
					FB.GameUtils.initScoreboard(function(scoreboard) {
						that.scoreboard = scoreboard;
					});
					FB.Input.tapped = false;
					return;
				}
			}
			
			if (FB.lives === 0) {
				FB.changeState('Splash');
			} else {
				if (x >= 102.5 && x <= 102.5 + 115 && y >= 260 && y <= 260 + 70) {
					FB.changeState('Splash');
				}
			}
			FB.Input.tapped = false;
		}
		FB.bird.update();
	}
	
	this.render = function(){
		FB.GameUtils.renderLives();
		
		if (FB.lives === 0) {
			var config = FB.Buttons.configs.bonusLife;
			var smoothingSettings = FB.Buttons.setupImageSmoothing(FB.ctx);
			FB.Buttons.enableImageSmoothing(FB.ctx);
			FB.Buttons.renderWithBreathing(config, FB.ctx, this.startTime);
			FB.Buttons.restoreImageSmoothing(FB.ctx, smoothingSettings);
		}
		
		FB.GameUtils.renderScoreboard(this.scoreboard);
	}

}
