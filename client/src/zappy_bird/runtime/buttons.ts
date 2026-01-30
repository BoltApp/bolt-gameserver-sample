import type { ButtonConfig } from '../types';
import type { ZappyBirdRuntime } from '../types';

export class Button {
  configs: Record<string, ButtonConfig> = {};
  private readonly state: ZappyBirdRuntime;
  private readonly getAdCallback: () => ((buttonType: string) => void) | null;

  constructor(
    state: ZappyBirdRuntime,
    getAdCallback: () => ((buttonType: string) => void) | null
  ) {
    this.state = state;
    this.getAdCallback = getAdCallback;
    const triggerAd = (buttonType: string): void => {
      const cb =
        this.getAdCallback() ??
        (typeof window !== 'undefined' ? (window as unknown as { handleButtonAd?: (t: string) => void }).handleButtonAd : undefined);
      cb?.(buttonType);
    };
    this.configs.bonusLife = {
      image: null,
      scale: 0.2,
      x: 0,
      y: 0,
      onClick: () => triggerAd('bonusLife'),
    };
    this.configs.supportMode = {
      image: null,
      scale: 0.35,
      x: () => this.getSideBySideButtonX('supportMode', 'voltageBoost'),
      y: 290,
      onClick: () => triggerAd('supportMode'),
    };
    this.configs.voltageBoost = {
      image: null,
      scale: 0.35,
      x: () => this.getSideBySideButtonX('voltageBoost', 'supportMode'),
      y: 290,
      onClick: () => triggerAd('voltageBoost'),
    };
  }

  getButtonX(config: ButtonConfig): number {
    return typeof config.x === 'function' ? config.x() : config.x;
  }

  getButtonY(config: ButtonConfig): number {
    return typeof config.y === 'function' ? config.y() : config.y;
  }

  getButtonWidth(config: ButtonConfig): number {
    return (config.image?.width || 20) * config.scale;
  }

  getButtonHeight(config: ButtonConfig): number {
    return (config.image?.height || 20) * config.scale;
  }

  getSideBySideButtonX(
    buttonName: 'supportMode' | 'voltageBoost',
    otherButtonName: 'supportMode' | 'voltageBoost'
  ): number {
    const config = this.configs[buttonName];
    const otherConfig = this.configs[otherButtonName];
    const margin = 20;
    const fallbackOffset = buttonName === 'supportMode' ? -80 : 20;
    if (config?.image?.complete && otherConfig?.image?.complete) {
      const buttonWidth = config.image.width * config.scale;
      const otherWidth = otherConfig.image.width * otherConfig.scale;
      const totalWidth = buttonWidth + margin + otherWidth;
      const startX = this.state.WIDTH / 2 - totalWidth / 2;
      return buttonName === 'supportMode' ? startX : startX + buttonWidth + margin;
    }
    return this.state.WIDTH / 2 + fallbackOffset;
  }

  isPointInButton(x: number, y: number, config: ButtonConfig | null | undefined): boolean {
    if (!config) return false;
    let buttonWidth: number, buttonHeight: number;
    if (config.image?.complete && config.image.width && config.image.height) {
      buttonWidth = config.image.width * config.scale;
      buttonHeight = config.image.height * config.scale;
    } else if (config.image?.width || config.image?.height) {
      buttonWidth = (config.image?.width || 100) * config.scale;
      buttonHeight = (config.image?.height || 50) * config.scale;
    } else {
      if (config.scale === 0.35) {
        buttonWidth = 100 * config.scale;
        buttonHeight = 50 * config.scale;
      } else if (config.scale === 0.2) {
        buttonWidth = 80 * config.scale;
        buttonHeight = 80 * config.scale;
      } else {
        return false;
      }
    }
    const buttonX = this.getButtonX(config);
    const buttonY = this.getButtonY(config);
    return x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight;
  }

  handleClick(
    x: number,
    y: number,
    buttonConfigs: Record<string, ButtonConfig>,
    excludeButtons: string[]
  ): boolean {
    for (const buttonName in buttonConfigs) {
      if (excludeButtons.includes(buttonName)) continue;
      const config = buttonConfigs[buttonName];
      if (this.isPointInButton(x, y, config)) {
        config.onClick();
        return true;
      }
    }
    return false;
  }

  render(config: ButtonConfig, ctx: CanvasRenderingContext2D): void {
    if (!config?.image?.complete) return;
    const buttonX = this.getButtonX(config);
    const buttonY = this.getButtonY(config);
    const buttonWidth = this.getButtonWidth(config);
    const buttonHeight = this.getButtonHeight(config);
    if (config.image) ctx.drawImage(config.image, buttonX, buttonY, buttonWidth, buttonHeight);
  }

  renderWithBreathing(
    config: ButtonConfig,
    ctx: CanvasRenderingContext2D,
    startTime: number,
    minSize?: number,
    maxSize?: number,
    speed?: number
  ): void {
    if (!config?.image?.complete) return;
    minSize = minSize ?? 0.6;
    maxSize = maxSize ?? 0.7;
    speed = speed ?? 4;
    const buttonX = this.getButtonX(config);
    const buttonY = this.getButtonY(config);
    const buttonWidth = this.getButtonWidth(config);
    const buttonHeight = this.getButtonHeight(config);
    const elapsedTime = (Date.now() - startTime) / 1000;
    const breath = (Math.sin(elapsedTime * speed) + 1) / 2;
    const sizeMultiplier = minSize + breath * (maxSize - minSize);
    const breathingWidth = buttonWidth * sizeMultiplier;
    const breathingHeight = buttonHeight * sizeMultiplier;
    const breathingX = buttonX + (buttonWidth - breathingWidth) / 2;
    const breathingY = buttonY + (buttonHeight - breathingHeight) / 2;
    if (config.image) ctx.drawImage(config.image, breathingX, breathingY, breathingWidth, breathingHeight);
  }

  setupImageSmoothing(
    ctx: CanvasRenderingContext2D
  ): { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality } {
    return {
      imageSmoothingEnabled: ctx.imageSmoothingEnabled,
      imageSmoothingQuality: ctx.imageSmoothingQuality,
    };
  }

  enableImageSmoothing(ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  restoreImageSmoothing(
    ctx: CanvasRenderingContext2D,
    settings: { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality }
  ): void {
    ctx.imageSmoothingEnabled = settings.imageSmoothingEnabled;
    ctx.imageSmoothingQuality = settings.imageSmoothingQuality;
  }

  renderButtons(
    buttonConfigs: Record<string, ButtonConfig>,
    ctx: CanvasRenderingContext2D,
    excludeButtons: string[]
  ): void {
    const smoothingSettings = this.setupImageSmoothing(ctx);
    this.enableImageSmoothing(ctx);
    for (const buttonName in buttonConfigs) {
      if (excludeButtons.includes(buttonName)) continue;
      this.render(buttonConfigs[buttonName], ctx);
    }
    this.restoreImageSmoothing(ctx, smoothingSettings);
  }

  init(): void {
    const base = '/zappy_bird/assets/images/buttons/';
    this.configs.bonusLife!.image = this.state.GameUtils.createImage(`${base}bonus_life.png`);
    this.configs.supportMode!.image = this.state.GameUtils.createImage(`${base}support_mode.png`);
    this.configs.voltageBoost!.image = this.state.GameUtils.createImage(`${base}voltage_boost.png`);
  }
}
