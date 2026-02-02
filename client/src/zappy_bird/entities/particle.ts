import type { RuntimeContext } from '../runtime/runtime-context';

export class ParticleEntity {
  type = 'circle' as const;
  dir: number;
  vx: number;
  vy: number;
  remove = false;
  private ctx: RuntimeContext;
  x: number;
  y: number;
  r: number;
  col: string;

  constructor(ctx: RuntimeContext, x: number, y: number, r: number, col: string) {
    this.ctx = ctx;
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
    if (this.y > this.ctx.HEIGHT) this.remove = true;
  }

  render(): void {
    this.ctx.Draw.circle(this.x, this.y, this.r, this.col);
  }
}
