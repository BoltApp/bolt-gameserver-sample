// @ts-nocheck
const FB = (window as any).FB;

FB.Draw = {

    clear: function () {
        FB.ctx.clearRect(0, 0, FB.WIDTH, FB.HEIGHT);
    },

    rect: function (x, y, w, h, col) {
        FB.ctx.fillStyle = col;
        FB.ctx.fillRect(x, y, w, h);
    },
    circle: function (x, y, r, col) {
        FB.ctx.fillStyle = col;
        FB.ctx.beginPath();
        FB.ctx.arc(x + 5, y + 5, r, 0, Math.PI * 2, true);
        FB.ctx.closePath();
        FB.ctx.fill();
    },
	Image:function(img,x,y){
    if (!img || img.complete !== true || (img.naturalWidth || img.width) <= 0) return;
		FB.ctx.drawImage(img,x,y);
	},
    Sprite: function (img, srcX, srcY, srcW, srcH, destX, destY, destW, destH, r) {
        if (!img || img.complete !== true || (img.naturalWidth || img.width) <= 0) return;
        FB.ctx.save();
        FB.ctx.translate(destX, destY);
        FB.ctx.rotate(r * (Math.PI / 180));
        FB.ctx.translate(-(destX + destW / 2), -(destY + destH / 2));
        FB.ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);
        FB.ctx.restore();
    },
    semiCircle: function (x, y, r, col) {
        FB.ctx.fillStyle = col;
        FB.ctx.beginPath();
        FB.ctx.arc(x, y, r, 0, Math.PI, false);
        FB.ctx.closePath();
        FB.ctx.fill();
    },

    text: function (string, x, y, size, col) {
        FB.ctx.font = 'bold ' + size + 'px Monospace';
        FB.ctx.fillStyle = col;
        FB.ctx.fillText(string, x, y);
    }

};

export {};
