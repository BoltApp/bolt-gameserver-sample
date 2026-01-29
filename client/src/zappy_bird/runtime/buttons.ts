import type { ButtonConfig } from '../types';

const FB = window.FB!;

declare function handleButtonAd(buttonType: string): void;

FB.Buttons = {
  configs: {} as Record<string, ButtonConfig>,
  init: function (): void {},
  getButtonX: function (config: ButtonConfig): number {
    return typeof config.x === 'function' ? config.x() : config.x;
  },

  getButtonY: function (config: ButtonConfig): number {
    return typeof config.y === 'function' ? config.y() : config.y;
  },

  getButtonWidth: function (config: ButtonConfig): number {
    return (config.image.width || 20) * config.scale;
  },

  getButtonHeight: function (config: ButtonConfig): number {
    return (config.image.height || 20) * config.scale;
  },

  getSideBySideButtonX: function (buttonName: 'supportMode' | 'voltageBoost', otherButtonName: 'supportMode' | 'voltageBoost'): number {
    const config = FB.Buttons.configs[buttonName];
    const otherConfig = FB.Buttons.configs[otherButtonName];
    const margin = 20;
    const fallbackOffset = buttonName === 'supportMode' ? -80 : 20;

    if (config.image?.complete && otherConfig.image?.complete) {
      const buttonWidth = config.image.width * config.scale;
      const otherWidth = otherConfig.image.width * otherConfig.scale;
      const totalWidth = buttonWidth + margin + otherWidth;
      const startX = FB.WIDTH / 2 - totalWidth / 2;
      return buttonName === 'supportMode' ? startX : startX + buttonWidth + margin;
    }
    return FB.WIDTH / 2 + fallbackOffset;
  },

  isPointInButton: function (x: number, y: number, config: ButtonConfig | null | undefined): boolean {
    if (!config) {
      return false;
    }
    let buttonWidth: number, buttonHeight: number;
    if (config.image && config.image.complete && config.image.width && config.image.height) {
      buttonWidth = config.image.width * config.scale;
      buttonHeight = config.image.height * config.scale;
    } else if (config.image && (config.image.width || config.image.height)) {
      buttonWidth = (config.image.width || 100) * config.scale;
      buttonHeight = (config.image.height || 50) * config.scale;
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
  },

  handleClick: function (x: number, y: number, buttonConfigs: Record<string, ButtonConfig>, excludeButtons: string[]): boolean {
    excludeButtons = excludeButtons || [];
    for (const buttonName in buttonConfigs) {
      if (excludeButtons.includes(buttonName)) {
        continue;
      }
      const config = buttonConfigs[buttonName];
      if (this.isPointInButton(x, y, config)) {
        config.onClick();
        return true;
      }
    }
    return false;
  },

  render: function (config: ButtonConfig, ctx: CanvasRenderingContext2D): void {
    if (!config || !config.image.complete) {
      return;
    }
    const buttonX = this.getButtonX(config);
    const buttonY = this.getButtonY(config);
    const buttonWidth = this.getButtonWidth(config);
    const buttonHeight = this.getButtonHeight(config);
    ctx.drawImage(config.image, buttonX, buttonY, buttonWidth, buttonHeight);
  },

  renderWithBreathing: function (
    config: ButtonConfig,
    ctx: CanvasRenderingContext2D,
    startTime: number,
    minSize?: number,
    maxSize?: number,
    speed?: number
  ): void {
    if (!config || !config.image.complete) {
      return;
    }
    minSize = minSize || 0.6;
    maxSize = maxSize || 0.7;
    speed = speed || 4;

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

    ctx.drawImage(config.image, breathingX, breathingY, breathingWidth, breathingHeight);
  },

  setupImageSmoothing: function (ctx: CanvasRenderingContext2D): { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality } {
    return {
      imageSmoothingEnabled: ctx.imageSmoothingEnabled,
      imageSmoothingQuality: ctx.imageSmoothingQuality,
    };
  },

  enableImageSmoothing: function (ctx: CanvasRenderingContext2D): void {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  },

  restoreImageSmoothing: function (
    ctx: CanvasRenderingContext2D,
    settings: { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality }
  ): void {
    if (settings) {
      ctx.imageSmoothingEnabled = settings.imageSmoothingEnabled;
      ctx.imageSmoothingQuality = settings.imageSmoothingQuality;
    }
  },

  renderButtons: function (buttonConfigs: Record<string, ButtonConfig>, ctx: CanvasRenderingContext2D, excludeButtons: string[]): void {
    excludeButtons = excludeButtons || [];
    const smoothingSettings = this.setupImageSmoothing(ctx);
    this.enableImageSmoothing(ctx);

    for (const buttonName in buttonConfigs) {
      if (excludeButtons.includes(buttonName)) {
        continue;
      }
      this.render(buttonConfigs[buttonName], ctx);
    }

    this.restoreImageSmoothing(ctx, smoothingSettings);
  },
};

FB.Buttons.configs = {
  bonusLife: {
    image: null as HTMLImageElement | null,
    scale: 0.2,
    x: 0,
    y: 0,
    onClick: function (): void {
      handleButtonAd('bonusLife');
    },
  },
  supportMode: {
    image: null as HTMLImageElement | null,
    scale: 0.35,
    x: function (): number {
      return FB.Buttons.getSideBySideButtonX('supportMode', 'voltageBoost');
    },
    y: 290,
    onClick: function (): void {
      handleButtonAd('supportMode');
    },
  },
  voltageBoost: {
    image: null as HTMLImageElement | null,
    scale: 0.35,
    x: function (): number {
      return FB.Buttons.getSideBySideButtonX('voltageBoost', 'supportMode');
    },
    y: 290,
    onClick: function (): void {
      handleButtonAd('voltageBoost');
    },
  },
} as Record<string, ButtonConfig>;

FB.Buttons.init = function (): void {
  FB.Buttons.configs.bonusLife.image = FB.GameUtils.createImage('/zappy_bird/assets/images/buttons/bonus_life.png');
  FB.Buttons.configs.supportMode.image = FB.GameUtils.createImage('/zappy_bird/assets/images/buttons/support_mode.png');
  FB.Buttons.configs.voltageBoost.image = FB.GameUtils.createImage('/zappy_bird/assets/images/buttons/voltage_boost.png');
};

export {};
