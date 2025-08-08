import { type Product } from '@shared-types';

export type GemPackage = Product & GemPackageConfigs[string];

export interface GemPackageConfigs {
  [sku: string]: {
    imageUrl: string
    scale?: number
    offsetY?: number
    offsetX?: number
  }
}
