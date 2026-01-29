import type { Cloud, Spaceship, Laser, BottomBar, City, Pipe, Bird, Particle } from '../types';

const FB = window.FB!;

function canDraw(img: HTMLImageElement | null | undefined): boolean {
  return !!img && img.complete === true && (img.naturalWidth || img.width) > 0;
}

FB.Cloud = function (this: Cloud, x: number, y: number) {
  this.x = x;
  this.y = y;
  this.r = 30;
  this.col = 'rgba(255,255,255,1)';
  this.type = 'cloud';
  this.vx = -0.1;
  this.remove = false;

  this.update = function (): void {
    this.x += this.vx;
    if (this.x < 0 - 115) {
      this.respawn();
    }
  };

  this.render = function (): void {
    FB.Draw.circle(this.x + this.r, this.y + this.r, this.r, this.col);
    FB.Draw.circle(this.x + 55, this.y + this.r / 2, this.r / 0.88, this.col);
    FB.Draw.circle(this.x + 55, this.y + this.r + 15, this.r, this.col);
    FB.Draw.circle(this.x + 85, this.y + this.r, this.r, this.col);
  };

  this.respawn = function (): void {
    this.x = ~~(Math.random() * this.r * 2) + FB.WIDTH;
    this.y = ~~(Math.random() * FB.HEIGHT / 2);
  };
} as unknown as new (x: number, y: number) => Cloud;

FB.Spaceship = function (this: Spaceship) {
  this.type = 'spaceship';
  this.img = FB.GameUtils.createImage('/zappy_bird/assets/images/spaceship.png');
  this.x = 10;
  this.y = 70;
  this.speed = 2;

  this.update = function (): void {
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

  this.render = function (): void {
    if (!FB.ctx) return;
    if (this.img.complete && this.img.naturalWidth > 0) {
      const imgWidth = this.img.naturalWidth || 50;
      const imgHeight = this.img.naturalHeight || 50;
      const scale = 0.2;
      FB.ctx.drawImage(this.img, this.x, this.y, imgWidth * scale, imgHeight * scale);
    }
  };
} as unknown as new () => Spaceship;

FB.Laser = function (this: Laser, x: number, y: number) {
  this.x = x;
  this.y = y;
  this.vx = 5;
  this.width = 20;
  this.height = 2;
  this.type = 'laser';
  this.remove = false;

  this.update = function (): void {
    this.x += this.vx;

    if (this.x > FB.WIDTH) {
      this.remove = true;
      return;
    }

    for (let i = 0; i < FB.entities.length; i++) {
      const entity = FB.entities[i];
      if (entity.type === 'pipe') {
        const pipe = entity as Pipe;
        const laserRight = this.x + this.width;
        const laserTop = this.y;
        const laserBottom = this.y + this.height;

        const pipeTop = 0;
        const pipeBottom = pipe.centerY - 50;
        if (laserRight >= pipe.centerX && this.x <= pipe.centerX + pipe.w && laserBottom > pipeTop && laserTop < pipeBottom) {
          pipe.topDestroyed = true;
          this.remove = true;
          return;
        }

        const pipeTop2 = pipe.centerY + 50;
        const pipeBottom2 = pipe.h;
        if (laserRight >= pipe.centerX && this.x <= pipe.centerX + pipe.w && laserBottom > pipeTop2 && laserTop < pipeBottom2) {
          pipe.remove = true;
          this.remove = true;
          return;
        }
      }
    }
  };

  this.render = function (): void {
    FB.Draw.rect(this.x, this.y, this.width, this.height, '#00FFFF');
  };
} as unknown as new (x: number, y: number) => Laser;

FB.BottomBar = function (this: BottomBar, x: number, y: number, w: number) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.type = 'bottomBar';
  this.vx = -1;

  this.update = function (): void {
    this.x += this.vx;
    if (this.x < 0 - this.w) {
      this.respawn();
    }
  };

  this.render = function (): void {
    const time = FB.distance / 60;
    const breath = (Math.sin(time * 0.4) + 1) / 2;

    const greyR = 40;
    const greyG = 40;
    const greyB = 40;

    const blueR = 0;
    const blueG = 120;
    const blueB = 120;

    const tint = breath * 0.3;
    const r = greyR + (blueR - greyR) * tint;
    const g = greyG + (blueG - greyG) * tint;
    const b = greyB + (blueB - greyB) * tint;

    const color = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';

    FB.Draw.rect(this.x, this.y, this.w, 100, color);
    for (let i = 0; i < 10; i++) {
      FB.Draw.semiCircle(this.x + i * (this.w / 9), this.y, 20, 'black');
    }
  };

  this.respawn = function (): void {
    this.x = FB.WIDTH - 1;
  };
} as unknown as new (x: number, y: number, w: number) => BottomBar;

FB.City = function (this: City, x: number, y: number) {
  this.x = x;
  this.vx = -1;
  this.type = 'City';

  this.groundLine = FB.HEIGHT - 100;
  this.scale = 0.7;

  const cityNumber = Math.floor(Math.random() * 5) + 1;
  this.img = FB.GameUtils.createImage('/zappy_bird/assets/images/cityskape/city' + cityNumber + '.png');
  this.img.onload = () => {
    this.originalW = this.img.width;
    this.originalH = this.img.height;
    this.w = this.originalW * this.scale;
    this.h = this.originalH * this.scale;
    this.y = this.groundLine - this.h;
  };
  this.w = 45;
  this.h = 37.5;
  this.y = this.groundLine - this.h;

  this.update = function (): void {
    this.x += this.vx;
    if (this.x < 0 - this.w) {
      this.respawn();
    }
  };

  this.render = function (): void {
    if (!FB.ctx) return;
    if (canDraw(this.img)) {
      if (!this.originalW || this.originalW !== this.img.width) {
        this.originalW = this.img.width;
        this.originalH = this.img.height;
        this.w = this.originalW * this.scale;
        this.h = this.originalH * this.scale;
        this.y = this.groundLine - this.h;
      }
      FB.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
  };

  this.respawn = function (): void {
    let rightmostX = 0;
    for (let i = 0; i < FB.entities.length; i++) {
      if (FB.entities[i].type === 'City' && FB.entities[i].x > rightmostX) {
        rightmostX = FB.entities[i].x;
      }
    }
    this.x = Math.max(FB.WIDTH, rightmostX + 10);
    const cityNumber = Math.floor(Math.random() * 5) + 1;
    this.img = FB.GameUtils.createImage('/zappy_bird/assets/images/cityskape/city' + cityNumber + '.png');
    this.img.onload = () => {
      this.originalW = this.img.width;
      this.originalH = this.img.height;
      this.w = this.originalW * this.scale;
      this.h = this.originalH * this.scale;
      this.y = this.groundLine - this.h;
    };
  };
} as unknown as new (x: number, y: number) => City;

FB.Pipe = function (this: Pipe, x: number, w: number) {
  this.centerX = x;
  this.bolt = true;
  this.w = w;
  this.h = FB.HEIGHT - 150;
  this.vx = -1;
  this.type = 'pipe';
  this.topDestroyed = false;
  this.boltImg = FB.GameUtils.createImage('/zappy_bird/assets/images/bolt_pink.png');
  this.pipeImg = FB.GameUtils.createImage('/zappy_bird/assets/images/pipe1.png');

  this.update = function (): void {
    this.centerX += this.vx;
    if (this.centerX === 0 - this.w) {
      this.respawn();
    }
  };

  this.render = function (): void {
    if (!FB.ctx) return;

    if (this.bolt) {
      const img = this.boltImg;
      if (!canDraw(img)) return;
      const scale = 0.4;
      const imgWidth = img.width || img.naturalWidth || 20;
      const imgHeight = img.height || img.naturalHeight || 20;
      const x = this.centerX + this.w / 2 - 10 - 8;
      const y = this.centerY - 10 - 6;
      FB.ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
    }

    if (canDraw(this.pipeImg)) {
      const imgWidth = this.pipeImg.naturalWidth;
      const imgHeight = this.pipeImg.naturalHeight;

      const scale = (this.w * 3.75) / imgWidth;
      const scaledWidth = this.w * 3.75;
      const widthOffset = (scaledWidth - this.w) / 2;

      if (!this.topDestroyed) {
        const topPipeHeight = this.centerY - 50;
        if (topPipeHeight > 0) {
          let sourceHeight = topPipeHeight / scale;
          sourceHeight = Math.min(sourceHeight, imgHeight);
          const sourceY = imgHeight - sourceHeight;

          FB.ctx.drawImage(this.pipeImg, 0, sourceY, imgWidth, sourceHeight, this.centerX - widthOffset, 0, scaledWidth, topPipeHeight);
        }
      }

      const bottomPipeHeight = this.h - this.centerY;
      if (bottomPipeHeight > 0) {
        let sourceHeight = bottomPipeHeight / scale;
        sourceHeight = Math.min(sourceHeight, imgHeight);

        FB.ctx.drawImage(this.pipeImg, 0, 0, imgWidth, sourceHeight, this.centerX - widthOffset, this.centerY + 50, scaledWidth, bottomPipeHeight);
      }
    }
  };

  this.respawn = function (): void {
    this.centerY = this.randomIntFromInterval(70, 220);
    this.centerX = 320 - this.w + 160;
    this.bolt = true;
    this.topDestroyed = false;
    this.remove = false;
  };

  this.randomIntFromInterval = function (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  this.centerY = this.randomIntFromInterval(70, 220);
} as unknown as new (x: number, w: number) => Pipe;

FB.Bird = function (this: Bird): void {
  this.img = FB.GameUtils.createImage('/zappy_bird/assets/images/bird.png');
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

  this.update = function (): void {
    if (this.fr++ > 5) {
      this.fr = 0;
      if (this.iy === this.height * 3) {
        this.iy = 0;
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

  this.render = function (): void {
    FB.Draw.Sprite(this.img, this.ix, this.iy, this.width, this.height, this.vx, this.vy, this.width, this.height, this.rotation);
  };
} as unknown as new () => Bird;

FB.Particle = function (this: Particle, x: number, y: number, r: number, col: string) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.col = col;
  this.type = 'circle';

  this.dir = Math.random() * 2 > 1 ? 1 : -1;

  this.vx = ~~(Math.random() * 4) * this.dir;
  this.vy = ~~(Math.random() * 7);

  this.remove = false;

  this.update = function (): void {
    this.x += this.vx;
    this.y -= this.vy;

    this.vx *= 0.99;
    this.vy *= 0.99;

    this.vy -= 0.35;

    if (this.y > FB.HEIGHT) {
      this.remove = true;
    }
  };

  this.render = function (): void {
    FB.Draw.circle(this.x, this.y, this.r, this.col);
  };
} as unknown as new (x: number, y: number, r: number, col: string) => Particle;

export {};
