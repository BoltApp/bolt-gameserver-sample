import { createImage } from '../asset';
import type { ZappyBirdRuntime } from './runtime';
import type { ButtonConfig } from './shared-types';

export type ButtonConfigs = Record<string, ButtonConfig>;

export function initButtons(
  runtime: ZappyBirdRuntime,
  getAdCallback: () => ((buttonType: string) => void) | null
): ButtonConfigs {
  const configs: ButtonConfigs = {};
  const triggerAd = (buttonType: string): void => {
    const cb =
      getAdCallback() ??
      (typeof window !== 'undefined' ? (window as unknown as { handleButtonAd?: (t: string) => void }).handleButtonAd : undefined);
    cb?.(buttonType);
  };
  configs.bonusLife = {
    image: null,
    scale: 0.2,
    x: 0,
    y: 0,
    onClick: () => triggerAd('bonusLife'),
  };
  configs.supportMode = {
    image: null,
    scale: 0.35,
    x: () => getSideBySideButtonX(configs, 'supportMode', 'voltageBoost', runtime.WIDTH),
    y: 290,
    onClick: () => triggerAd('supportMode'),
  };
  configs.voltageBoost = {
    image: null,
    scale: 0.35,
    x: () => getSideBySideButtonX(configs, 'voltageBoost', 'supportMode', runtime.WIDTH),
    y: 290,
    onClick: () => triggerAd('voltageBoost'),
  };
  const base = '/zappy_bird/assets/images/buttons/';
  configs.bonusLife!.image = createImage(`${base}bonus_life.png`);
  configs.supportMode!.image = createImage(`${base}support_mode.png`);
  configs.voltageBoost!.image = createImage(`${base}voltage_boost.png`);
  return configs;
}

function getButtonX(config: ButtonConfig): number {
  return typeof config.x === 'function' ? config.x() : config.x;
}

function getButtonY(config: ButtonConfig): number {
  return typeof config.y === 'function' ? config.y() : config.y;
}

function getButtonWidth(config: ButtonConfig): number {
  return (config.image?.width || 20) * config.scale;
}

function getButtonHeight(config: ButtonConfig): number {
  return (config.image?.height || 20) * config.scale;
}

function getSideBySideButtonX(
  configs: ButtonConfigs,
  buttonName: 'supportMode' | 'voltageBoost',
  otherButtonName: 'supportMode' | 'voltageBoost',
  width: number
): number {
  const config = configs[buttonName];
  const otherConfig = configs[otherButtonName];
  const margin = 20;
  const fallbackOffset = buttonName === 'supportMode' ? -80 : 20;
  if (config?.image?.complete && otherConfig?.image?.complete) {
    const buttonWidth = config.image.width * config.scale;
    const otherWidth = otherConfig.image.width * otherConfig.scale;
    const totalWidth = buttonWidth + margin + otherWidth;
    const startX = width / 2 - totalWidth / 2;
    return buttonName === 'supportMode' ? startX : startX + buttonWidth + margin;
  }
  return width / 2 + fallbackOffset;
}

function isPointInButton(x: number, y: number, config: ButtonConfig | null | undefined): boolean {
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
  const buttonX = getButtonX(config);
  const buttonY = getButtonY(config);
  return x >= buttonX && x <= buttonX + buttonWidth && y >= buttonY && y <= buttonY + buttonHeight;
}

export function handleClick(
  x: number,
  y: number,
  buttonConfigs: ButtonConfigs,
  excludeButtons: string[]
): boolean {
  for (const buttonName in buttonConfigs) {
    if (excludeButtons.includes(buttonName)) continue;
    const config = buttonConfigs[buttonName];
    if (isPointInButton(x, y, config)) {
      config.onClick();
      return true;
    }
  }
  return false;
}

function renderButton(config: ButtonConfig, ctx: CanvasRenderingContext2D): void {
  if (!config?.image?.complete) return;
  const buttonX = getButtonX(config);
  const buttonY = getButtonY(config);
  const buttonWidth = getButtonWidth(config);
  const buttonHeight = getButtonHeight(config);
  if (config.image) ctx.drawImage(config.image, buttonX, buttonY, buttonWidth, buttonHeight);
}

export function renderWithBreathing(
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
  const buttonX = getButtonX(config);
  const buttonY = getButtonY(config);
  const buttonWidth = getButtonWidth(config);
  const buttonHeight = getButtonHeight(config);
  const elapsedTime = (Date.now() - startTime) / 1000;
  const breath = (Math.sin(elapsedTime * speed) + 1) / 2;
  const sizeMultiplier = minSize + breath * (maxSize - minSize);
  const breathingWidth = buttonWidth * sizeMultiplier;
  const breathingHeight = buttonHeight * sizeMultiplier;
  const breathingX = buttonX + (buttonWidth - breathingWidth) / 2;
  const breathingY = buttonY + (buttonHeight - breathingHeight) / 2;
  if (config.image) ctx.drawImage(config.image, breathingX, breathingY, breathingWidth, breathingHeight);
}

export function setupImageSmoothing(
  ctx: CanvasRenderingContext2D
): { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality } {
  return {
    imageSmoothingEnabled: ctx.imageSmoothingEnabled,
    imageSmoothingQuality: ctx.imageSmoothingQuality,
  };
}

export function enableImageSmoothing(ctx: CanvasRenderingContext2D): void {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

export function restoreImageSmoothing(
  ctx: CanvasRenderingContext2D,
  settings: { imageSmoothingEnabled: boolean; imageSmoothingQuality: ImageSmoothingQuality }
): void {
  ctx.imageSmoothingEnabled = settings.imageSmoothingEnabled;
  ctx.imageSmoothingQuality = settings.imageSmoothingQuality;
}

export function renderButtons(
  buttonConfigs: ButtonConfigs,
  ctx: CanvasRenderingContext2D,
  excludeButtons: string[]
): void {
  const smoothingSettings = setupImageSmoothing(ctx);
  enableImageSmoothing(ctx);
  for (const buttonName in buttonConfigs) {
    if (excludeButtons.includes(buttonName)) continue;
    renderButton(buttonConfigs[buttonName], ctx);
  }
  restoreImageSmoothing(ctx, smoothingSettings);
}
