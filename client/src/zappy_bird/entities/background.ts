import type { RuntimeContext } from '../runtime/runtime-context';

const PLAY_HEIGHT = 480;
const GROUND_BAND_HEIGHT = 100;

export class BackgroundEntity {
  type = 'background' as const;
  x = 0;
  y = 0;
  private ctx: RuntimeContext;

  constructor(ctx: RuntimeContext) {
    this.ctx = ctx;
  }

  update(): void {}

  private getGroundBreathColor(distance: number): string {
    const time = distance / 60;
    const breath = (Math.sin(time * 0.4) + 1) / 2;
    const tint = breath * 0.3;
    const r = Math.round(40 + (0 - 40) * tint);
    const g = Math.round(40 + (120 - 40) * tint);
    const b = Math.round(40 + (120 - 40) * tint);
    return `rgb(${r},${g},${b})`;
  }

  private renderGround(): void {
    const { Draw, VIEW_WIDTH, VIEW_HEIGHT, playOffset, distance } = this.ctx;
    const groundTop = playOffset.top + (PLAY_HEIGHT - GROUND_BAND_HEIGHT);
    const groundHeight = VIEW_HEIGHT - groundTop;
    if (groundHeight <= 0) return;
    Draw.rect(0, groundTop, VIEW_WIDTH, groundHeight, this.getGroundBreathColor(distance));
  }

  render(): void {
    if (!this.ctx.ctx) return;
    this.ctx.ctx.save();
    this.ctx.ctx.translate(-this.ctx.playOffset.left, -this.ctx.playOffset.top);
    this.ctx.Draw.rect(0, 0, this.ctx.VIEW_WIDTH, this.ctx.VIEW_HEIGHT, this.ctx.gradients[this.ctx.bgGrad]);
    this.renderGround();
    this.ctx.ctx.restore();
  }
}
