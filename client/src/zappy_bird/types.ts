export interface GameEntity {
    type: string;
    x: number;
    y: number;
    vx?: number;
    vy?: number;
    width?: number;
    height?: number;
    remove?: boolean;
    update(): void;
    render(): void;
    respawn?(): void;
  }
  
  export interface Bird extends GameEntity {
    type: 'bird';
    img: HTMLImageElement;
    gravity: number;
    width: number;
    height: number;
    ix: number;
    iy: number;
    fr: number;
    vy: number;
    vx: number;
    velocity: number;
    play: boolean;
    jump: number;
    rotation: number;
  }
  
  export interface Pipe extends GameEntity {
    type: 'pipe';
    centerX: number;
    centerY: number;
    bolt: boolean;
    w: number;
    h: number;
    vx: number;
    topDestroyed: boolean;
    boltImg: HTMLImageElement;
    pipeImg: HTMLImageElement;
    respawn(): void;
    randomIntFromInterval(min: number, max: number): number;
  }
  
  export interface City extends GameEntity {
    type: 'city';
    vx: number;
    groundLine: number;
    scale: number;
    img: HTMLImageElement;
    originalW?: number;
    originalH?: number;
    w: number;
    h: number;
    respawn(): void;
  }
  
  export interface Cloud extends GameEntity {
    type: 'cloud';
    r: number;
    col: string;
    vx: number;
    respawn(): void;
  }
  
  export interface Spaceship extends GameEntity {
    type: 'spaceship';
    img: HTMLImageElement;
    speed: number;
  }
  
  export interface Laser extends GameEntity {
    type: 'laser';
    vx: number;
    width: number;
    height: number;
  }
  
  export interface BottomBar extends GameEntity {
    type: 'bottomBar';
    w: number;
    vx: number;
    respawn(): void;
  }
  
  
  export interface Particle extends GameEntity {
    type: 'circle';
    r: number;
    col: string;
    dir: number;
    vx: number;
    vy: number;
  }
  
  export interface GameState {
    init(): void;
    update(): void;
    render(): void;
  }
  
  export interface Scoreboard {
    banner: HTMLImageElement;
    bolt: HTMLImageElement;
    replay: HTMLImageElement;
    highscore: number;
  }
  
  export interface SoundChannel {
    channel: HTMLAudioElement;
    finished: number;
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
  
  export interface Offset {
    top: number;
    left: number;
  }
  
  export interface Score {
    taps: number;
    bolts: number;
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
  
  export interface ZappyBirdRuntime {
    WIDTH: number;
    HEIGHT: number;
    scale: number;
    devicePixelRatio: number;
    offset: Offset;
    entities: GameEntity[];
    currentWidth: number | null;
    currentHeight: number | null;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    score: Score;
    distance: number;
    digits: string[];
    fonts: HTMLImageElement[];
    lasers: Laser[];
    lives: number;
    backgroundMusic: HTMLAudioElement | null;
    backgroundMusicNext: HTMLAudioElement | null;
    backgroundMusicWasPlaying: boolean;
    gameReady: boolean;
    clickToBeginStartTime: number | null;
    notification: Notification;
    RATIO: number | null;
    bgGrad: 'day' | 'dusk' | 'night' | 'dawn';
    game: GameState | null;
    ua: string | null;
    android: boolean | null;
    ios: boolean | null;
    gradients: Gradients;
    _rafId: number;
    _clickToBeginRafId: number;
    _running: boolean;
    _handlers: EventHandlers;
    _lastTime?: number;
    _accum?: number;
    bird?: Bird;
    spaceship?: Spaceship | null;
  
    // Methods
    setupHighDPICanvas(): void;
    resize(): void;
    showIntroVideo(): void;
    renderClickToBegin(): void;
    showClickToBegin(): void;
    startBackgroundMusic(): void;
    changeState(state: 'Splash' | 'Play' | 'GameOver'): void;
    startGame(): void;
    update(): void;
    render(): void;
    loop(): void;
  
    // Sub-objects
    Draw: {
      clear(): void;
      rect(x: number, y: number, w: number, h: number, col: string | CanvasGradient): void;
      circle(x: number, y: number, r: number, col: string): void;
      Image(img: HTMLImageElement, x: number, y: number): void;
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
      semiCircle(x: number, y: number, r: number, col: string): void;
      text(string: string, x: number, y: number, size: number, col: string): void;
    };
  
    Input: {
      x: number;
      y: number;
      tapped: boolean;
      keys: Record<string, boolean>;
      set(data: { pageX: number; pageY: number }): void;
      isKeyDown(key: string): boolean;
    };
  
    Storage: {
      getItem(key: string): string;
      setItem(key: string, value: string): void;
      getHighScore(currentScore: number): number;
    };
  
    Sound: {
      channels: SoundChannel[];
      channelMax: number;
      jump: HTMLAudioElement;
      score: HTMLAudioElement;
      hit: HTMLAudioElement;
      die: HTMLAudioElement;
      swoosh: HTMLAudioElement;
      init(): void;
      play(sound: HTMLAudioElement): void;
    };
  
    GameUtils: {
      resetGameConfig(): void;
      initGameState(): void;
      createImage(src: string): HTMLImageElement;
      updateEntities(): void;
      getNextGradient(): 'day' | 'dusk' | 'night' | 'dawn';
      checkLevelUp(): boolean;
      renderLives(): void;
      initBackgroundEntities(): void;
      initSpaceship(): void;
      initPipes(): void;
      initFonts(): void;
      getBoltType(score: number): string;
      initScoreboard(callback: (scoreboard: Scoreboard) => void): void;
      renderScoreboard(scoreboard: Scoreboard | null): void;
      shootLaser(): void;
      updateLasers(): void;
      renderLasers(): void;
      showNotification(message: string): void;
      renderNotification(): void;
    };
  
    Buttons: {
      configs: Record<string, ButtonConfig>;
      getButtonX(config: ButtonConfig): number;
      getButtonY(config: ButtonConfig): number;
      getButtonWidth(config: ButtonConfig): number;
      getButtonHeight(config: ButtonConfig): number;
      getSideBySideButtonX(buttonName: 'supportMode' | 'voltageBoost', otherButtonName: 'supportMode' | 'voltageBoost'): number;
      isPointInButton(x: number, y: number, config: ButtonConfig): boolean;
      handleClick(x: number, y: number, buttonConfigs: Record<string, ButtonConfig>, excludeButtons: string[]): boolean;
      render(config: ButtonConfig, ctx: CanvasRenderingContext2D): void;
      renderWithBreathing(
        config: ButtonConfig,
        ctx: CanvasRenderingContext2D,
        startTime: number,
        minSize?: number,
        maxSize?: number,
        speed?: number
      ): void;
      renderButtons(configs: Record<string, ButtonConfig>, ctx: CanvasRenderingContext2D, excludeButtons: string[]): void;
      setupImageSmoothing(ctx: CanvasRenderingContext2D): { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality };
      enableImageSmoothing(ctx: CanvasRenderingContext2D): void;
      restoreImageSmoothing(ctx: CanvasRenderingContext2D, settings: { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality }): void;
      init(): void;
    };
  
    collides(bird: Bird, pipe: Pipe): boolean;
  
    // Entity factories (call to create instance, not constructors)
    Cloud: (x: number, y: number) => Cloud;
    Spaceship: () => Spaceship;
    Laser: (x: number, y: number) => Laser;
    BottomBar: (x: number, y: number, w: number) => BottomBar;
    City: (x: number, y: number) => City;
    Pipe: (x: number, w: number) => Pipe;
    Bird: () => Bird;
    Particle: (x: number, y: number, r: number, col: string) => Particle;
  }
  
  export interface ButtonConfig {
    image: HTMLImageElement | null;
    scale: number;
    x: number | (() => number);
    y: number | (() => number);
    onClick(): void;
  }