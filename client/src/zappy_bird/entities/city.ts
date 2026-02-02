import { createImage } from '../asset';
import type { RuntimeContext } from '../runtime/runtime-context';

export class CityEntity {
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
  private ctx: RuntimeContext;
  x: number;

  constructor(ctx: RuntimeContext, x: number, _y: number) {
    this.ctx = ctx;
    this.x = x;
    this.groundLine = ctx.HEIGHT - 100;
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
    const visibleLeft = -this.ctx.playOffset.left;
    if (this.x + this.w <= visibleLeft) this.respawn();
  }

  render(): void {
    if (!this.ctx.ctx) return;
    if (this.img?.complete && (this.img.naturalWidth || this.img.width) > 0) {
      if (!this.originalW || this.originalW !== this.img.width) {
        this.originalW = this.img.width;
        this.originalH = this.img.height;
        this.w = this.originalW * this.scale;
        this.h = this.originalH! * this.scale;
        this.y = this.groundLine - this.h;
      }
      this.ctx.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
  }

  respawn(): void {
    const vw = this.ctx.VIEW_WIDTH ?? this.ctx.WIDTH;
    let rightmostRight = vw;
    for (const entity of this.ctx.getEntities()) {
      if (entity.type === 'city') {
        const city = entity as CityEntity;
        const right = entity.x + (city.w ?? 45);
        if (right > rightmostRight) rightmostRight = right;
      }
    }
    this.x = rightmostRight + 10;
    const cityNumber = Math.floor(Math.random() * 5) + 1;
    this.img = createImage(`/zappy_bird/assets/images/cityskape/city${cityNumber}.png`);
    this.img.onload = () => {
      this.originalW = this.img.width;
      this.originalH = this.img.height;
      this.w = this.originalW! * this.scale;
      this.h = this.originalH! * this.scale;
      this.y = this.groundLine - this.h;
    };
  }
}
