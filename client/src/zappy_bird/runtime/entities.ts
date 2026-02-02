import type { Cloud, Spaceship, Laser, BottomBar, City, Pipe, Bird, Particle } from '../types';

function canDraw(img: HTMLImageElement | null | undefined): boolean {
  return !!img && img.complete === true && (img.naturalWidth || img.width) > 0;
}

/** Shape of Draw needed by entities (structural; matches Draw class and ZappyBirdRuntime.Draw). */
export interface EntitiesState {
  Draw: {
    circle(x: number, y: number, r: number, col: string): void;
    rect(x: number, y: number, w: number, h: number, col: string | CanvasGradient): void;
    semiCircle(x: number, y: number, r: number, col: string): void;
    Sprite(
      img: HTMLImageElement,
      srcX: number,
      srcY: number,
      srcW: number,
      srcH: number,
      destX: number,
      destY: number,
      destW: number,
      destH: number,
      r: number
    ): void;
  };
  Sound: { play(sound: HTMLAudioElement): void; jump: HTMLAudioElement };
  Input: { tapped: boolean; isKeyDown(key: string): boolean };
  WIDTH: number;
  HEIGHT: number;
  ctx: CanvasRenderingContext2D | null;
  entities: { type: string; x: number; update(): void; render(): void }[];
  distance: number;
}

class CloudEntity implements Cloud {
  type = 'cloud' as const;
  r = 30;
  col = 'rgba(255,255,255,1)';
  vx = -0.1;
  remove = false;
  private state: EntitiesState;
  x: number;
  y: number;

  constructor(state: EntitiesState, x: number, y: number) {
    this.state = state;
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.x += this.vx;
    if (this.x < 0 - 115) this.respawn();
  }

  render(): void {
    this.state.Draw.circle(this.x + this.r, this.y + this.r, this.r, this.col);
    this.state.Draw.circle(this.x + 55, this.y + this.r / 2, this.r / 0.88, this.col);
    this.state.Draw.circle(this.x + 55, this.y + this.r + 15, this.r, this.col);
    this.state.Draw.circle(this.x + 85, this.y + this.r, this.r, this.col);
  }

  respawn(): void {
    this.x = ~~(Math.random() * this.r * 2) + this.state.WIDTH;
    this.y = ~~(Math.random() * this.state.HEIGHT / 2);
  }
}

class SpaceshipEntity implements Spaceship {
  type = 'spaceship' as const;
  img: HTMLImageElement;
  x = 10;
  y = 70;
  speed = 2;
  private state: EntitiesState;

  constructor(state: EntitiesState, createImage: (src: string) => HTMLImageElement) {
    this.state = state;
    this.img = createImage('/zappy_bird/assets/images/spaceship.png');
  }

  update(): void {
    if (this.state.Input.isKeyDown('w')) {
      this.y -= this.speed;
      if (this.y < 0) this.y = 0;
    }
    if (this.state.Input.isKeyDown('s')) {
      this.y += this.speed;
      if (this.y > this.state.HEIGHT - 50) this.y = this.state.HEIGHT - 50;
    }
  }

  render(): void {
    if (!this.state.ctx) return;
    if (this.img.complete && this.img.naturalWidth > 0) {
      const imgWidth = this.img.naturalWidth || 50;
      const imgHeight = this.img.naturalHeight || 50;
      const scale = 0.2;
      this.state.ctx.drawImage(this.img, this.x, this.y, imgWidth * scale, imgHeight * scale);
    }
  }
}

class LaserEntity implements Laser {
  type = 'laser' as const;
  vx = 5;
  width = 20;
  height = 2;
  remove = false;
  private state: EntitiesState;
  x: number;
  y: number;

  constructor(state: EntitiesState, x: number, y: number) {
    this.state = state;
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.x += this.vx;
    if (this.x > this.state.WIDTH) {
      this.remove = true;
      return;
    }
    for (const entity of this.state.entities) {
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
  }

  render(): void {
    this.state.Draw.rect(this.x, this.y, this.width, this.height, '#00FFFF');
  }
}

class BottomBarEntity implements BottomBar {
  type = 'bottomBar' as const;
  vx = -1;
  private state: EntitiesState;
  x: number;
  y: number;
  w: number;

  constructor(state: EntitiesState, x: number, y: number, w: number) {
    this.state = state;
    this.x = x;
    this.y = y;
    this.w = w;
  }

  update(): void {
    this.x += this.vx;
    if (this.x < 0 - this.w) this.respawn();
  }

  render(): void {
    const time = this.state.distance / 60;
    const breath = (Math.sin(time * 0.4) + 1) / 2;
    const greyR = 40, greyG = 40, greyB = 40;
    const blueR = 0, blueG = 120, blueB = 120;
    const tint = breath * 0.3;
    const r = greyR + (blueR - greyR) * tint;
    const g = greyG + (blueG - greyG) * tint;
    const b = greyB + (blueB - greyB) * tint;
    this.state.Draw.rect(this.x, this.y, this.w, 100, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
    for (let i = 0; i < 10; i++) {
      this.state.Draw.semiCircle(this.x + i * (this.w / 9), this.y, 20, 'black');
    }
  }

  respawn(): void {
    this.x = this.state.WIDTH - 1;
  }
}

class CityEntity implements City {
  type = 'city' as const;
  vx = -1;
  groundLine: number;
  scale = 0.7;
  img: HTMLImageElement;
  originalW?: number;
  originalH?: number;
  w = 45;
  h = 37.5;
  y: number;
  private state: EntitiesState;
  private createImage: (src: string) => HTMLImageElement;
  x: number;

  constructor(state: EntitiesState, createImage: (src: string) => HTMLImageElement, x: number, _y: number) {
    this.state = state;
    this.createImage = createImage;
    this.x = x;
    this.groundLine = state.HEIGHT - 100;
    const cityNumber = Math.floor(Math.random() * 5) + 1;
    this.img = createImage(`/zappy_bird/assets/images/cityskape/city${cityNumber}.png`);
    this.img.onload = () => {
      this.originalW = this.img.width;
      this.originalH = this.img.height;
      this.w = this.originalW! * this.scale;
      this.h = this.originalH! * this.scale;
      this.y = this.groundLine - this.h;
    };
    this.y = this.groundLine - this.h;
  }

  update(): void {
    this.x += this.vx;
    if (this.x < 0 - this.w) this.respawn();
  }

  render(): void {
    if (!this.state.ctx) return;
    if (canDraw(this.img)) {
      if (!this.originalW || this.originalW !== this.img.width) {
        this.originalW = this.img.width;
        this.originalH = this.img.height;
        this.w = this.originalW * this.scale;
        this.h = this.originalH! * this.scale;
        this.y = this.groundLine - this.h;
      }
      this.state.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
  }

  respawn(): void {
    let rightmostX = 0;
    for (const entity of this.state.entities) {
      if (entity.type === 'city' && entity.x > rightmostX) {
        rightmostX = entity.x;
      }
    }
    this.x = Math.max(this.state.WIDTH, rightmostX + 10);
    const cityNumber = Math.floor(Math.random() * 5) + 1;
    this.img = this.createImage(`/zappy_bird/assets/images/cityskape/city${cityNumber}.png`);
    this.img.onload = () => {
      this.originalW = this.img.width;
      this.originalH = this.img.height;
      this.w = this.originalW! * this.scale;
      this.h = this.originalH! * this.scale;
      this.y = this.groundLine - this.h;
    };
  }
}

class PipeEntity implements Pipe {
  type = 'pipe' as const;
  centerX: number;
  bolt = true;
  w: number;
  h: number;
  vx = -1;
  topDestroyed = false;
  boltImg: HTMLImageElement;
  pipeImg: HTMLImageElement;
  centerY: number;
  remove = false;
  private state: EntitiesState;

  get x(): number {
    return this.centerX;
  }
  get y(): number {
    return this.centerY;
  }

  constructor(state: EntitiesState, createImage: (src: string) => HTMLImageElement, x: number, w: number) {
    this.state = state;
    this.centerX = x;
    this.w = w;
    this.h = state.HEIGHT - 150;
    this.boltImg = createImage('/zappy_bird/assets/images/bolt_pink.png');
    this.pipeImg = createImage('/zappy_bird/assets/images/pipe1.png');
    this.centerY = this.randomIntFromInterval(70, 220);
  }

  update(): void {
    this.centerX += this.vx;
    if (this.centerX === 0 - this.w) this.respawn();
  }

  render(): void {
    if (!this.state.ctx) return;
    if (this.bolt) {
      const img = this.boltImg;
      if (!canDraw(img)) return;
      const scale = 0.4;
      const imgWidth = img.width || img.naturalWidth || 20;
      const imgHeight = img.height || img.naturalHeight || 20;
      const x = this.centerX + this.w / 2 - 10 - 8;
      const y = this.centerY - 10 - 6;
      this.state.ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
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
          this.state.ctx.drawImage(this.pipeImg, 0, sourceY, imgWidth, sourceHeight, this.centerX - widthOffset, 0, scaledWidth, topPipeHeight);
        }
      }
      const bottomPipeHeight = this.h - this.centerY;
      if (bottomPipeHeight > 0) {
        let sourceHeight = bottomPipeHeight / scale;
        sourceHeight = Math.min(sourceHeight, imgHeight);
        this.state.ctx.drawImage(this.pipeImg, 0, 0, imgWidth, sourceHeight, this.centerX - widthOffset, this.centerY + 50, scaledWidth, bottomPipeHeight);
      }
    }
  }

  respawn(): void {
    this.centerY = this.randomIntFromInterval(70, 220);
    this.centerX = 320 - this.w + 160;
    this.bolt = true;
    this.topDestroyed = false;
    this.remove = false;
  }

  randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

class BirdEntity implements Bird {
  type = 'bird' as const;
  img: HTMLImageElement;
  gravity = 0.25;
  width = 34;
  height = 24;
  ix = 0;
  iy = 0;
  fr = 0;
  vy = 180;
  vx = 70;
  velocity = 0;
  play = false;
  jump = -4.6;
  rotation = 0;
  private state: EntitiesState;

  get x(): number {
    return this.vx;
  }
  get y(): number {
    return this.vy;
  }

  constructor(state: EntitiesState, createImage: (src: string) => HTMLImageElement) {
    this.state = state;
    this.img = createImage('/zappy_bird/assets/images/bird.png');
  }

  update(): void {
    if (this.fr++ > 5) {
      this.fr = 0;
      if (this.iy === this.height * 3) this.iy = 0;
      this.iy += this.height;
    }
    if (this.play) {
      this.velocity += this.gravity;
      this.vy += this.velocity;
      if (this.vy <= 0) this.vy = 0;
      if (this.vy >= 370) this.vy = 370;
      this.rotation = Math.min((this.velocity / 10) * 90, 90);
    }
    if (this.state.Input.tapped) {
      this.play = true;
      this.state.Sound.play(this.state.Sound.jump);
      this.velocity = this.jump;
    }
  }

  render(): void {
    this.state.Draw.Sprite(this.img, this.ix, this.iy, this.width, this.height, this.vx, this.vy, this.width, this.height, this.rotation);
  }
}

class ParticleEntity implements Particle {
  type = 'circle' as const;
  dir: number;
  vx: number;
  vy: number;
  remove = false;
  private state: EntitiesState;
  x: number;
  y: number;
  r: number;
  col: string;

  constructor(state: EntitiesState, x: number, y: number, r: number, col: string) {
    this.state = state;
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = col;
    this.dir = Math.random() * 2 > 1 ? 1 : -1;
    this.vx = ~~(Math.random() * 4) * this.dir;
    this.vy = ~~(Math.random() * 7);
  }

  update(): void {
    this.x += this.vx;
    this.y -= this.vy;
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.vy -= 0.35;
    if (this.y > this.state.HEIGHT) this.remove = true;
  }

  render(): void {
    this.state.Draw.circle(this.x, this.y, this.r, this.col);
  }
}

export function createEntities(
  state: EntitiesState,
  createImage: (src: string) => HTMLImageElement
) {
  return {
    Cloud: (x: number, y: number) => new CloudEntity(state, x, y),
    Spaceship: () => new SpaceshipEntity(state, createImage),
    Laser: (x: number, y: number) => new LaserEntity(state, x, y),
    BottomBar: (x: number, y: number, w: number) => new BottomBarEntity(state, x, y, w),
    City: (x: number, y: number) => new CityEntity(state, createImage, x, y),
    Pipe: (x: number, w: number) => new PipeEntity(state, createImage, x, w),
    Bird: () => new BirdEntity(state, createImage),
    Particle: (x: number, y: number, r: number, col: string) => new ParticleEntity(state, x, y, r, col),
  };
}
