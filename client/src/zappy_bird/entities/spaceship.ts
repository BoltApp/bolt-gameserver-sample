import { createImage } from '../asset';
import type { RuntimeContext } from '../runtime/runtime-context';

export class SpaceshipEntity {
  type = 'spaceship' as const;
  img: HTMLImageElement;
  x = 10;
  y = 70;
  speed = 2;
  private ctx: RuntimeContext;

  constructor(ctx: RuntimeContext) {
    this.ctx = ctx;
    this.img = createImage('/zappy_bird/assets/images/spaceship.png');
  }

  update(): void {
    if (this.ctx.Input.isKeyDown('w')) {
      this.y -= this.speed;
      if (this.y < 0) this.y = 0;
    }
    if (this.ctx.Input.isKeyDown('s')) {
      this.y += this.speed;
      if (this.y > this.ctx.HEIGHT - 50) this.y = this.ctx.HEIGHT - 50;
    }
  }

  render(): void {
    if (!this.ctx.ctx) return;
    if (this.img.complete && this.img.naturalWidth > 0) {
      const imgWidth = this.img.naturalWidth || 50;
      const imgHeight = this.img.naturalHeight || 50;
      const scale = 0.2;
      this.ctx.ctx.drawImage(this.img, this.x, this.y, imgWidth * scale, imgHeight * scale);
    }
  }
}
