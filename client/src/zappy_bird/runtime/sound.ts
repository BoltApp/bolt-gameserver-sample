import { zappyAssetUrl } from '../asset';

export interface SoundChannel {
  channel: HTMLAudioElement;
  finished: number;
}

const channels: SoundChannel[] = [];
const CHANNEL_MAX = 10;

function init(): void {
  channels.length = 0;
  for (let i = 0; i < CHANNEL_MAX; i++) {
    channels[i] = { channel: new Audio(), finished: -1 };
  }
}

function play(sound: HTMLAudioElement): void {
  if (!sound) return;
  const now = Date.now();
  const slot = channels.find((c) => c.finished < now);
  if (slot) {
    slot.finished = now + sound.duration * 1000;
    slot.channel.src = sound.src;
    slot.channel.load();
    slot.channel.play().catch(() => {
      /* Ignore NotAllowedError when user hasn't interacted yet */
    });
  }
}

init();

const SOUND_URLS = {
  jump: 'sounds/wing.ogg',
  score: 'sounds/point.ogg',
  hit: 'sounds/hit.ogg',
  die: 'sounds/die.ogg',
  swoosh: 'sounds/swooshing.ogg',
} as const;

export const Sound = {
  channels,
  channelMax: CHANNEL_MAX,
  jump: new Audio(zappyAssetUrl(SOUND_URLS.jump)),
  score: new Audio(zappyAssetUrl(SOUND_URLS.score)),
  hit: new Audio(zappyAssetUrl(SOUND_URLS.hit)),
  die: new Audio(zappyAssetUrl(SOUND_URLS.die)),
  swoosh: new Audio(zappyAssetUrl(SOUND_URLS.swoosh)),
  init,
  play,
};
