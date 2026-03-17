import type { BaseEntity } from '../entities/base-entity';

/** What entities need from the runtime (Draw, Sound, entity list, etc.). Implemented by ZappyBirdRuntime. */
export interface RuntimeContext {
  Draw: {
    circle(x: number, y: number, r: number, col: string): void;
    rect(x: number, y: number, w: number, h: number, col: string | CanvasGradient): void;
    semiCircle(x: number, y: number, r: number, col: string): void;
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
    ): void;
  };
  Sound: { play(sound: HTMLAudioElement): void; jump: HTMLAudioElement };
  Input: { tapped: boolean; isKeyDown(key: string): boolean };
  WIDTH: number;
  HEIGHT: number;
  VIEW_WIDTH: number;
  VIEW_HEIGHT: number;
  playOffset: { left: number; top: number };
  ctx: CanvasRenderingContext2D | null;
  getEntities(): BaseEntity[];
  addEntity(e: BaseEntity): void;
  distance: number;
  gradients: { dawn: CanvasGradient; day: CanvasGradient; dusk: CanvasGradient; night: CanvasGradient };
  bgGrad: 'day' | 'dusk' | 'night' | 'dawn';
}
