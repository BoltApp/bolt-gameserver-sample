import { createImage } from '../asset';
import type { RuntimeContext } from '../runtime/runtime-context';

export class PipeEntity {
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
  private ctx: RuntimeContext;

  get x(): number {
    return this.centerX;
  }
  get y(): number {
    return this.centerY;
  }

  constructor(ctx: RuntimeContext, x: number, w: number) {
    this.ctx = ctx;
    this.centerX = x;
    this.w = w;
    this.h = ctx.HEIGHT - 150;
    this.boltImg = createImage('/zappy_bird/assets/images/bolt_pink.png');
    this.pipeImg = createImage('/zappy_bird/assets/images/pipe1.png');
    this.centerY = this.randomIntFromInterval(70, 220);
  }

  update(): void {
    this.centerX += this.vx;
    const visibleLeft = -this.ctx.playOffset.left;
    if (this.centerX + this.w / 2 <= visibleLeft) this.respawn();
  }

  render(): void {
    if (!this.ctx.ctx || this.remove) return;
    if (this.bolt) {
      const img = this.boltImg;
      if (!img?.complete || (img.naturalWidth || img.width) <= 0) return;
      const scale = 0.4;
      const imgWidth = img.width || img.naturalWidth || 20;
      const imgHeight = img.height || img.naturalHeight || 20;
      const x = this.centerX + this.w / 2 - 10 - 8;
      const y = this.centerY - 10 - 6;
      this.ctx.ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
    }
    if (this.pipeImg?.complete && (this.pipeImg.naturalWidth || this.pipeImg.width) > 0) {
      const imgWidth = this.pipeImg.naturalWidth;
      const imgHeight = this.pipeImg.naturalHeight;
      const scale = (this.w * 3.75) / imgWidth;
      const scaledWidth = this.w * 3.75;
      const widthOffset = (scaledWidth - this.w) / 2;
      const topPad = this.ctx.playOffset?.top ?? 0;
      if (!this.topDestroyed) {
        const topPipeHeight = this.centerY - 50;
        if (topPipeHeight > 0) {
          const destY = -topPad;
          const destHeight = topPipeHeight + topPad;
          let sourceHeight = destHeight / scale;
          sourceHeight = Math.min(sourceHeight, imgHeight);
          const sourceY = imgHeight - sourceHeight;
          this.ctx.ctx.drawImage(this.pipeImg, 0, sourceY, imgWidth, sourceHeight, this.centerX - widthOffset, destY, scaledWidth, destHeight);
        }
      }
      const bottomPipeHeight = this.h - this.centerY;
      if (bottomPipeHeight > 0) {
        let sourceHeight = bottomPipeHeight / scale;
        sourceHeight = Math.min(sourceHeight, imgHeight);
        this.ctx.ctx.drawImage(this.pipeImg, 0, 0, imgWidth, sourceHeight, this.centerX - widthOffset, this.centerY + 50, scaledWidth, bottomPipeHeight);
      }
    }
  }

  respawn(): void {
    this.centerY = this.randomIntFromInterval(70, 220);
    const vw = this.ctx.VIEW_WIDTH ?? this.ctx.WIDTH;
    let rightmostCenter = vw + this.w;
    for (const e of this.ctx.getEntities()) {
if (e.type === 'pipe' && !(e as PipeEntity).remove) {
      const pipe = e as PipeEntity;
        if (pipe.centerX > rightmostCenter) rightmostCenter = pipe.centerX;
      }
    }
    this.centerX = rightmostCenter + 160;
    this.bolt = true;
    this.topDestroyed = false;
    this.remove = false;
  }

  randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
