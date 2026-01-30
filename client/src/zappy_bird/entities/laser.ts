import type { PipeEntity } from './pipe';
import type { RuntimeContext } from '../runtime/runtime-context';

export class LaserEntity {
  type = 'laser' as const;
  vx = 5;
  width = 20;
  height = 2;
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
    if (this.x > this.ctx.WIDTH) {
      this.remove = true;
      return;
    }
    for (const entity of this.ctx.getEntities()) {
      if (entity.type === 'pipe') {
        const pipe = entity as PipeEntity;
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
    this.ctx.Draw.rect(this.x, this.y, this.width, this.height, '#00FFFF');
  }
}
