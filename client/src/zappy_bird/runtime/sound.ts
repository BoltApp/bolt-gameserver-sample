// @ts-nocheck

import { zappyAssetUrl } from '../asset';

export function installSound() {
  const FB = (window as any).FB;

  FB.Sound = {
    channels: [],
    channelMax: 10,

    init: function () {
      this.channels = [];
      for (var a = 0; a < this.channelMax; a++) {
        this.channels[a] = {
          channel: new Audio(),
          finished: -1,
        };
      }
    },

    play: function (sound) {
      if (!sound) return;

      var thistime = new Date().getTime();
      for (var a = 0; a < this.channels.length; a++) {
        if (this.channels[a].finished < thistime) {
          this.channels[a].finished = thistime + sound.duration * 1000;
          this.channels[a].channel.src = sound.src;
          this.channels[a].channel.load();
          this.channels[a].channel.play();
          break;
        }
      }
    },
  };

  FB.Sound.init();

  FB.Sound.jump = new Audio(zappyAssetUrl('sounds/wing.ogg'));
  FB.Sound.score = new Audio(zappyAssetUrl('sounds/point.ogg'));
  FB.Sound.hit = new Audio(zappyAssetUrl('sounds/hit.ogg'));
  FB.Sound.die = new Audio(zappyAssetUrl('sounds/die.ogg'));
  FB.Sound.swoosh = new Audio(zappyAssetUrl('sounds/swooshing.ogg'));
}

