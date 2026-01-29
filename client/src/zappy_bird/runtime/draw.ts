
const FB = window.FB!;

FB.Draw = {
  clear: function (): void {
    if (!FB.ctx) return;
    FB.ctx.clearRect(0, 0, FB.WIDTH, FB.HEIGHT);
  },

  rect: function (x: number, y: number, w: number, h: number, col: string | CanvasGradient): void {
    if (!FB.ctx) return;
    FB.ctx.fillStyle = col;
    FB.ctx.fillRect(x, y, w, h);
  },

  circle: function (x: number, y: number, r: number, col: string): void {
    if (!FB.ctx) return;
    FB.ctx.fillStyle = col;
    FB.ctx.beginPath();
    FB.ctx.arc(x + 5, y + 5, r, 0, Math.PI * 2, true);
    FB.ctx.closePath();
    FB.ctx.fill();
  },

  Image: function (img: HTMLImageElement, x: number, y: number): void {
    if (!FB.ctx || !img || img.complete !== true || (img.naturalWidth || img.width) <= 0) return;
    FB.ctx.drawImage(img, x, y);
  },

  Sprite: function (
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
    if (!FB.ctx || !img || img.complete !== true || (img.naturalWidth || img.width) <= 0) return;
    FB.ctx.save();
    FB.ctx.translate(destX, destY);
    FB.ctx.rotate(r * (Math.PI / 180));
    FB.ctx.translate(-(destX + destW / 2), -(destY + destH / 2));
    FB.ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
    FB.ctx.restore();
  },

  semiCircle: function (x: number, y: number, r: number, col: string): void {
    if (!FB.ctx) return;
    FB.ctx.fillStyle = col;
    FB.ctx.beginPath();
    FB.ctx.arc(x, y, r, 0, Math.PI, false);
    FB.ctx.closePath();
    FB.ctx.fill();
  },

  text: function (string: string, x: number, y: number, size: number, col: string): void {
    if (!FB.ctx) return;
    FB.ctx.font = 'bold ' + size + 'px Monospace';
    FB.ctx.fillStyle = col;
    FB.ctx.fillText(string, x, y);
  },
};

export {};
