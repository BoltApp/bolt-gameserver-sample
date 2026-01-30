import type { RuntimeContext } from '../runtime/runtime-context';

export class CloudEntity {
  type = 'cloud' as const;
  r = 30;
  col = 'rgba(255,255,255,1)';
  vx = -0.1;
  remove = false;
  private ctx: RuntimeContext;
  x: number;
  y: number;

  constructor(ctx: RuntimeContext, x: number, y: number) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
  }

  update(): void {
    this.x += this.vx;
    const visibleLeft = -this.ctx.playOffset.left;
    if (this.x + 115 <= visibleLeft) this.respawn();
  }

  render(): void {
    this.ctx.Draw.circle(this.x + this.r, this.y + this.r, this.r, this.col);
    this.ctx.Draw.circle(this.x + 55, this.y + this.r / 2, this.r / 0.88, this.col);
    this.ctx.Draw.circle(this.x + 55, this.y + this.r + 15, this.r, this.col);
    this.ctx.Draw.circle(this.x + 85, this.y + this.r, this.r, this.col);
  }

  respawn(): void {
    const vw = this.ctx.VIEW_WIDTH ?? this.ctx.WIDTH;
    let rightmost = vw - 1;
    for (const e of this.ctx.getEntities()) {
      if (e.type === 'cloud' && e.x > rightmost) rightmost = e.x;
    }
    this.x = rightmost + 100 + ~~(Math.random() * 40);
    const topPad = this.ctx.playOffset?.top ?? 0;
    this.y = Math.floor(-topPad + Math.random() * (this.ctx.HEIGHT / 2 + topPad));
  }
}
