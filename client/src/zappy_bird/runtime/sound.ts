import { zappyAssetUrl } from '../asset';

const channels: { channel: HTMLAudioElement; finished: number }[] = [];
const CHANNEL_MAX = 10;
let globalVolume = 0.5;
const managedElements = new Set<HTMLAudioElement>();

function init(): void {
  channels.length = 0;
  for (let i = 0; i < CHANNEL_MAX; i++) {
    channels[i] = { channel: new Audio(), finished: -1 };
  }
}

function registerElement(el: HTMLAudioElement): void {
  managedElements.add(el);
  el.volume = globalVolume;
}

function unregisterElement(el: HTMLAudioElement): void {
  managedElements.delete(el);
}

function setVolume(v: number): void {
  globalVolume = Math.max(0, Math.min(1, v));
  for (const c of channels) {
    c.channel.volume = globalVolume;
  }
  for (const el of managedElements) {
    el.volume = globalVolume;
  }
}

function play(sound: HTMLAudioElement): void {
  if (!sound) return;
  const now = Date.now();
  const slot = channels.find((c) => c.finished < now);
  if (slot) {
    slot.finished = now + sound.duration * 1000;
    slot.channel.src = sound.src;
    slot.channel.volume = globalVolume;
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
  setVolume,
  registerElement,
  unregisterElement,
  get volume() { return globalVolume; },
};
