FB.Buttons = {
    
    getButtonX: function(config) {
        return typeof config.x === 'function' ? config.x() : config.x;
    },
    
    getButtonY: function(config) {
        return typeof config.y === 'function' ? config.y() : config.y;
    },
    
    getButtonWidth: function(config) {
        return (config.image.width || 20) * config.scale;
    },
    
    getButtonHeight: function(config) {
        return (config.image.height || 20) * config.scale;
    },
    
    isPointInButton: function(x, y, config) {
        if (!config || !config.image.complete) {
            return false;
        }
        var buttonX = this.getButtonX(config);
        var buttonY = this.getButtonY(config);
        var buttonWidth = this.getButtonWidth(config);
        var buttonHeight = this.getButtonHeight(config);
        
        return x >= buttonX && x <= buttonX + buttonWidth && 
               y >= buttonY && y <= buttonY + buttonHeight;
    },
    
    handleClick: function(x, y, buttonConfigs, excludeButtons) {
        excludeButtons = excludeButtons || [];
        for (var buttonName in buttonConfigs) {
            if (excludeButtons.indexOf(buttonName) !== -1) {
                continue;
            }
            var config = buttonConfigs[buttonName];
            if (this.isPointInButton(x, y, config)) {
                config.onClick();
                return true;
            }
        }
        return false;
    },
    
    render: function(config, ctx) {
        if (!config || !config.image.complete) {
            return;
        }
        var buttonX = this.getButtonX(config);
        var buttonY = this.getButtonY(config);
        var buttonWidth = this.getButtonWidth(config);
        var buttonHeight = this.getButtonHeight(config);
        ctx.drawImage(config.image, buttonX, buttonY, buttonWidth, buttonHeight);
    },
    
    renderWithBreathing: function(config, ctx, startTime, minSize, maxSize, speed) {
        if (!config || !config.image.complete) {
            return;
        }
        minSize = minSize || 0.6;
        maxSize = maxSize || 0.7;
        speed = speed || 4;
        
        var buttonX = this.getButtonX(config);
        var buttonY = this.getButtonY(config);
        var buttonWidth = this.getButtonWidth(config);
        var buttonHeight = this.getButtonHeight(config);
        
        var elapsedTime = (Date.now() - startTime) / 1000;
        var breath = (Math.sin(elapsedTime * speed) + 1) / 2;
        var sizeMultiplier = minSize + (breath * (maxSize - minSize));
        
        var breathingWidth = buttonWidth * sizeMultiplier;
        var breathingHeight = buttonHeight * sizeMultiplier;
        
        var breathingX = buttonX + (buttonWidth - breathingWidth) / 2;
        var breathingY = buttonY + (buttonHeight - breathingHeight) / 2;
        
        ctx.drawImage(config.image, breathingX, breathingY, breathingWidth, breathingHeight);
    },
    
    setupImageSmoothing: function(ctx) {
        return {
            smoothing: ctx.imageSmoothingEnabled,
            quality: ctx.imageSmoothingQuality
        };
    },
    
    enableImageSmoothing: function(ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    },
    
    restoreImageSmoothing: function(ctx, settings) {
        if (settings) {
            ctx.imageSmoothingEnabled = settings.smoothing;
            ctx.imageSmoothingQuality = settings.quality;
        }
    },
    
    renderButtons: function(buttonConfigs, ctx, excludeButtons) {
        excludeButtons = excludeButtons || [];
        var smoothingSettings = this.setupImageSmoothing(ctx);
        this.enableImageSmoothing(ctx);
        
        for (var buttonName in buttonConfigs) {
            if (excludeButtons.indexOf(buttonName) !== -1) {
                continue;
            }
            this.render(buttonConfigs[buttonName], ctx);
        }
        
        this.restoreImageSmoothing(ctx, smoothingSettings);
    }
};

FB.Buttons.configs = {
    bonusLife: {
        image: null, 
        scale: 0.2,
        x: 10,
        y: 10,
        onClick: function() { FB.lives += 1; }
    },
    supportMode: {
        image: null,
        scale: 0.35,
        x: function() {
            var config = FB.Buttons.configs.supportMode;
            var voltageBoostConfig = FB.Buttons.configs.voltageBoost;
            var margin = 20;
            
            if (config.image && config.image.complete && voltageBoostConfig.image && voltageBoostConfig.image.complete) {
                var supportModeWidth = config.image.width * config.scale;
                var voltageBoostWidth = voltageBoostConfig.image.width * voltageBoostConfig.scale;
                var totalWidth = supportModeWidth + margin + voltageBoostWidth;
                return FB.WIDTH / 2 - totalWidth / 2;
            }
            return FB.WIDTH / 2 - 80;
        },
        y: 280,
        onClick: function() { 
            window.GAME_CONFIG.spaceshipEnabled = true;
            FB.GameUtils.showNotification("Support Systems Engaged");
        }
    },
    voltageBoost: {
        image: null,
        scale: 0.35,
        x: function() {
            var config = FB.Buttons.configs.voltageBoost;
            var supportModeConfig = FB.Buttons.configs.supportMode;
            var margin = 20; 
            
            if (config.image && config.image.complete && supportModeConfig.image && supportModeConfig.image.complete) {
                var supportModeWidth = supportModeConfig.image.width * supportModeConfig.scale;
                var voltageBoostWidth = config.image.width * config.scale;
                var totalWidth = supportModeWidth + margin + voltageBoostWidth;
                return FB.WIDTH / 2 - totalWidth / 2 + supportModeWidth + margin;
            }
            return FB.WIDTH / 2 + 20;
        },
        y: 280,
        onClick: function() { 
            window.GAME_CONFIG.voltageBoost = true;
            FB.GameUtils.showNotification("boosters charged");
        }
    }
};

FB.Buttons.init = function() {
    FB.Buttons.configs.bonusLife.image = FB.GameUtils.createImage('assets/images/buttons/bonus_life.png');
    FB.Buttons.configs.supportMode.image = FB.GameUtils.createImage('assets/images/buttons/support_mode.png');
    FB.Buttons.configs.voltageBoost.image = FB.GameUtils.createImage('assets/images/buttons/voltage_boost.png');
};
