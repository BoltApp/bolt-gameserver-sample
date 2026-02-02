import { createImage } from '../asset';
import type { RuntimeContext } from '../runtime/runtime-context';

export class BirdEntity {
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
  private ctx: RuntimeContext;

  get x(): number {
    return this.vx;
  }
  get y(): number {
    return this.vy;
  }

  constructor(ctx: RuntimeContext) {
    this.ctx = ctx;
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
    if (this.ctx.Input.tapped) {
      this.play = true;
      this.ctx.Sound.play(this.ctx.Sound.jump);
      this.velocity = this.jump;
    }
  }

  render(): void {
    this.ctx.Draw.Sprite(this.img, this.ix, this.iy, this.width, this.height, this.vx, this.vy, this.width, this.height, this.rotation);
  }
}
