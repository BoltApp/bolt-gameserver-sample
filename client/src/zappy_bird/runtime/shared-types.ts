/** Types shared by runtime modules and the main types contract. No dependency on ../types. */

export interface Scoreboard {
  banner: HTMLImageElement;
  bolt: HTMLImageElement;
  replay: HTMLImageElement;
  highscore: number;
}

export interface Score {
  taps: number;
  bolts: number;
}

export interface NotificationConfig {
  fontSize: number;
  color: string;
  y: number;
  prefix: string;
  suffix: string;
}

export interface Notification {
  message: string | null;
  startTime: number | null;
  duration: number;
  config: NotificationConfig;
}

export interface Gradients {
  dawn: CanvasGradient;
  day: CanvasGradient;
  dusk: CanvasGradient;
  night: CanvasGradient;
}

export interface EventHandlers {
  click: (e: MouseEvent) => void;
  touchstart: (e: TouchEvent) => void;
  touchmove: (e: TouchEvent) => void;
  touchend: (e: TouchEvent) => void;
  keydown: (e: KeyboardEvent) => void;
  keyup: (e: KeyboardEvent) => void;
  resize: () => void;
}

export interface ButtonConfig {
  image: HTMLImageElement | null;
  scale: number;
  x: number | (() => number);
  y: number | (() => number);
  onClick(): void;
}

