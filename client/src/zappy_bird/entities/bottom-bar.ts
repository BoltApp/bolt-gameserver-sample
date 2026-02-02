import type { RuntimeContext } from '../runtime/runtime-context';

export class BottomBarEntity {
  type = 'bottomBar' as const;
  vx = -1;
  private ctx: RuntimeContext;
  x: number;
  y: number;
  w: number;

  constructor(ctx: RuntimeContext, x: number, y: number, w: number) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.w = w;
  }

  update(): void {
    this.x += this.vx;
    const visibleLeft = -this.ctx.playOffset.left;
    if (this.x + this.w <= visibleLeft) this.respawn();
  }

  render(): void {
    for (let i = 0; i < 10; i++) {
      this.ctx.Draw.semiCircle(this.x + i * (this.w / 9), this.y, 20, 'black');
    }
  }

  respawn(): void {
    let rightmost = 0;
    for (const e of this.ctx.getEntities()) {
      if (e.type === 'bottomBar' && e !== this) {
        const bar = e as BottomBarEntity;
        const right = bar.x + bar.w;
        if (right > rightmost) rightmost = right;
      }
    }
    this.x = rightmost > 0 ? rightmost : this.x + this.w;
  }
}
