FB.Cloud = function (x, y) {

    this.x = x;
    this.y = y;
    this.r = 30;
    this.col = 'rgba(255,255,255,1)';
    this.type = 'cloud';
    this.vx = -0.10;

    this.remove = false;

    this.update = function () {
        this.x += this.vx;
        if (this.x < (0 - 115)) {
            this.respawn();
        }
    };

    this.render = function () {
        FB.Draw.circle(this.x + this.r, (this.y + this.r), this.r, this.col);
        FB.Draw.circle(this.x + 55, (this.y + this.r / 2), this.r / 0.88, this.col);
        FB.Draw.circle(this.x + 55, (this.y + this.r + 15), this.r, this.col);
        FB.Draw.circle(this.x + 85, (this.y + this.r), this.r, this.col);
    };

    this.respawn = function () {
        this.x = ~~ (Math.random() * this.r * 2) + FB.WIDTH;
        this.y = ~~ (Math.random() * FB.HEIGHT / 2)
    };

};

FB.Spaceship = function () {
    this.type = 'spaceship';
    this.img = FB.GameUtils.createImage('assets/images/spaceship.png');
    this.x = 10;
    this.y = 70;
    this.speed = 2;
    
    this.update = function () {
        if (FB.Input.isKeyDown('w')) {
            this.y -= this.speed;
            if (this.y < 0) {
                this.y = 0;
            }
        }
        if (FB.Input.isKeyDown('s')) {
            this.y += this.speed;
            if (this.y > FB.HEIGHT - 50) {
                this.y = FB.HEIGHT - 50;
            }
        }
    };
    
    this.render = function () {
        if (this.img.complete && this.img.naturalWidth > 0) {
            var imgWidth = this.img.naturalWidth || 50;
            var imgHeight = this.img.naturalHeight || 50;
            var scale = 0.2;
            FB.ctx.drawImage(this.img, this.x, this.y, imgWidth * scale, imgHeight * scale);
        }
    };
};

FB.Laser = function (x, y) {
    this.x = x;
    this.y = y;
    this.vx = 5;
    this.width = 20;
    this.height = 2;
    this.type = 'laser';
    this.remove = false;
    
    this.update = function () {
        this.x += this.vx;
        
        if (this.x > FB.WIDTH) {
            this.remove = true;
            return;
        }
        
        for (var i = 0; i < FB.entities.length; i++) {
            var entity = FB.entities[i];
            if (entity.type === 'pipe') {
                var laserRight = this.x + this.width;
                var laserTop = this.y;
                var laserBottom = this.y + this.height;
                
                var pipeTop = 0;
                var pipeBottom = entity.centerY - 50;
                if (laserRight >= entity.centerX && 
                    this.x <= entity.centerX + entity.w &&
                    laserBottom > pipeTop && 
                    laserTop < pipeBottom) {
                    entity.topDestroyed = true;
                    this.remove = true;
                    return;
                }
                
                var pipeTop2 = entity.centerY + 50;
                var pipeBottom2 = entity.h;
                if (laserRight >= entity.centerX && 
                    this.x <= entity.centerX + entity.w &&
                    laserBottom > pipeTop2 && 
                    laserTop < pipeBottom2) {
                    entity.remove = true;
                    this.remove = true;
                    return;
                }
            }
        }
    };
    
    this.render = function () {
        FB.Draw.rect(this.x, this.y, this.width, this.height, '#00FFFF');
    };
};

FB.BottomBar = function (x, y, r) {

    this.x = x;
    this.y = y
    this.r = r;
    this.vx = -1;
    this.name = 'BottomBar';

    this.update = function () {
        this.x += this.vx;
        if (this.x < (0 - this.r)) {
            this.respawn();
        }
    };

    this.render = function () {
        var time = FB.distance / 60;
        var breath = (Math.sin(time * 0.4) + 1) / 2;
        
        var greyR = 40;
        var greyG = 40;
        var greyB = 40;
        
        var blueR = 0;
        var blueG = 120;
        var blueB = 120;
        
        var tint = breath * 0.3;
        var r = greyR + (blueR - greyR) * tint;
        var g = greyG + (blueG - greyG) * tint;
        var b = greyB + (blueB - greyB) * tint;
        
        var color = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
        
        FB.Draw.rect(this.x, this.y, this.r, 100, color);
        for (var i = 0; i < 10; i++) {
            FB.Draw.semiCircle(this.x + i * (this.r / 9), this.y, 20, 'black');
        }
    }

    this.respawn = function () {
        this.x = FB.WIDTH - 1;
    }

}

FB.City = function (x, y) {

    this.x = x;
    this.vx = -1;
    this.type = 'City';
    
    this.groundLine = FB.HEIGHT - 100;
    this.scale = 0.7;
    
    var cityNumber = Math.floor(Math.random() * 5) + 1;
    this.img = FB.GameUtils.createImage('assets/images/cityskape/city' + cityNumber + '.png');
    var that = this;
    this.img.onload = function() {
        that.originalW = that.img.width;
        that.originalH = that.img.height;
        that.w = that.originalW * that.scale;
        that.h = that.originalH * that.scale;
        that.y = that.groundLine - that.h;
    };
    this.w = 45;
    this.h = 37.5;
    this.y = this.groundLine - this.h;

    this.update = function () {
        this.x += this.vx;
        if (this.x < (0 - this.w)) {
            this.respawn();
        }
    };

    this.render = function () {
        if (this.img.complete) {
            if (!this.originalW || this.originalW !== this.img.width) {
                this.originalW = this.img.width;
                this.originalH = this.img.height;
                this.w = this.originalW * this.scale;
                this.h = this.originalH * this.scale;
                this.y = this.groundLine - this.h;
            }
            FB.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
        }
    }

    this.respawn = function () {
        var rightmostX = 0;
        for (var i = 0; i < FB.entities.length; i++) {
            if (FB.entities[i].type === 'City' && FB.entities[i].x > rightmostX) {
                rightmostX = FB.entities[i].x;
            }
        }
        this.x = Math.max(FB.WIDTH, rightmostX + 10);
        var cityNumber = Math.floor(Math.random() * 5) + 1;
        this.img = FB.GameUtils.createImage('assets/images/cityskape/city' + cityNumber + '.png');
        var that = this;
        this.img.onload = function() {
            that.originalW = that.img.width;
            that.originalH = that.img.height;
            that.w = that.originalW * that.scale;
            that.h = that.originalH * that.scale;
            that.y = that.groundLine - that.h;
        };
    }

}

FB.Pipe = function (x, w) {

    this.centerX = x;
    this.bolt = true
    this.w = w;
    this.h = FB.HEIGHT - 150;
    this.vx = -1;
    this.type = 'pipe';
    this.topDestroyed = false;
    this.boltImg = FB.GameUtils.createImage('assets/images/bolt_pink.png');
    this.pipeImg = FB.GameUtils.createImage('assets/images/pipe1.png');

    this.update = function () {
        this.centerX += this.vx;
        if (this.centerX == (0 - this.w)) {
            this.respawn();
        }
    };

    this.render = function () {

        if (this.bolt) {
            var img = this.boltImg;
            var scale = 0.4;
            var imgWidth = img.width || img.naturalWidth || 20;
            var imgHeight = img.height || img.naturalHeight || 20;
            var x = this.centerX + this.w / 2 - 10 - 8; 
            var y = this.centerY - 10 - 6;
            FB.ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
        }
        
        if (this.pipeImg.complete && this.pipeImg.naturalWidth > 0) {
            var imgWidth = this.pipeImg.naturalWidth;
            var imgHeight = this.pipeImg.naturalHeight;
            
            var scale = (this.w * 3.75) / imgWidth;
            var scaledWidth = this.w * 3.75;
            var widthOffset = (scaledWidth - this.w) / 2;
            
            if (!this.topDestroyed) {
                var topPipeHeight = this.centerY - 50;
                if (topPipeHeight > 0) {
                    var sourceHeight = topPipeHeight / scale;
                    sourceHeight = Math.min(sourceHeight, imgHeight);
                    var sourceY = imgHeight - sourceHeight;
                    
                    FB.ctx.drawImage(
                        this.pipeImg,
                        0, sourceY, imgWidth, sourceHeight,
                        this.centerX - widthOffset, 0, scaledWidth, topPipeHeight
                    );
                }
            }
            
            var bottomPipeHeight = this.h - this.centerY;
            if (bottomPipeHeight > 0) {
                var sourceHeight = bottomPipeHeight / scale;
                sourceHeight = Math.min(sourceHeight, imgHeight);
                
                FB.ctx.drawImage(
                    this.pipeImg,
                    0, 0, imgWidth, sourceHeight,
                    this.centerX - widthOffset, this.centerY + 50, scaledWidth, bottomPipeHeight
                );
            }
        }
    }

    this.respawn = function () {
        this.centerY = this.randomIntFromInterval(70, 220);
        this.centerX = 320 - this.w + 160;
        this.bolt = true;
        this.topDestroyed = false;
        this.remove = false;
    }

    this.randomIntFromInterval = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    this.centerY = this.randomIntFromInterval(70, 220);
}

FB.Bird = function () {

    this.img = FB.GameUtils.createImage('assets/images/bird.png');
    this.gravity = 0.25;
    this.width = 34;
    this.height = 24;
    this.ix = 0;
    this.iy = 0;
    this.fr = 0;
    this.vy = 180;
    this.vx = 70;
    this.velocity = 0;
    this.play = false;
    this.jump = -4.6;
    this.rotation = 0;
    this.type = 'bird';
    this.update = function () {
        if (this.fr++ > 5) {
            this.fr = 0;
            if (this.iy == this.height * 3) {
                this.iy = 0
            }
            this.iy += this.height;
        }
        if (this.play) {
            this.velocity += this.gravity;
            this.vy += this.velocity;
            if (this.vy <= 0) {
                this.vy = 0;
            }
            if (this.vy >= 370) {
                this.vy = 370;
            }
            this.rotation = Math.min((this.velocity / 10) * 90, 90);
        }
        if (FB.Input.tapped) {
            this.play = true;
            FB.Sound.play(FB.Sound.jump);
            this.velocity = this.jump;
        }
    };

    this.render = function () {
        FB.Draw.Sprite(this.img, this.ix, this.iy, this.width, this.height, this.vx, this.vy, this.width, this.height, this.rotation);
    }

}

FB.Particle = function (x, y, r, col, type) {

    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;
    this.type = type || 'circle';
    this.name = 'particle';

    this.dir = (Math.random() * 2 > 1) ? 1 : -1;

    this.vx = ~~ (Math.random() * 4) * this.dir;
    this.vy = ~~ (Math.random() * 7);

    this.remove = false;

    this.update = function () {
        this.x += this.vx;
        this.y -= this.vy;

        this.vx *= 0.99;
        this.vy *= 0.99;

        this.vy -= 0.35;

        if (this.y > FB.HEIGHT) {
            this.remove = true;
        }
    };

    this.render = function () {
        if (this.type === 'star') {
            FB.Draw.star(this.x, this.y, this.col);
        } else {
            FB.Draw.circle(this.x, this.y, this.r, this.col);
        }
    };

};
