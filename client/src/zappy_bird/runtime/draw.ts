export class Draw {
  private ctx: CanvasRenderingContext2D | null;
  private viewWidth: number;
  private viewHeight: number;

  constructor(ctx: CanvasRenderingContext2D | null, viewWidth: number, viewHeight: number) {
    this.ctx = ctx;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  setViewSize(viewWidth: number, viewHeight: number): void {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  clear(): void {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
  }

  rect(x: number, y: number, w: number, h: number, col: string | CanvasGradient): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = col;
    this.ctx.fillRect(x, y, w, h);
  }

  circle(x: number, y: number, r: number, col: string): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = col;
    this.ctx.beginPath();
    this.ctx.arc(x + 5, y + 5, r, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fill();
  }

  Image(img: HTMLImageElement, x: number, y: number): void {
    if (!this.ctx || !img?.complete || (img.naturalWidth || img.width) <= 0) return;
    this.ctx.drawImage(img, x, y);
  }

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
  ): void {
    if (!this.ctx || !img?.complete || (img.naturalWidth || img.width) <= 0) return;
    this.ctx.save();
    this.ctx.translate(destX, destY);
    this.ctx.rotate(r * (Math.PI / 180));
    this.ctx.translate(-(destX + destW / 2), -(destY + destH / 2));
    this.ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
    this.ctx.restore();
  }

  semiCircle(x: number, y: number, r: number, col: string): void {
    if (!this.ctx) return;
    this.ctx.fillStyle = col;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI, false);
    this.ctx.closePath();
    this.ctx.fill();
  }

  text(string: string, x: number, y: number, size: number, col: string): void {
    if (!this.ctx) return;
    this.ctx.font = `bold ${size}px Monospace`;
    this.ctx.fillStyle = col;
    this.ctx.fillText(string, x, y);
  }
}
