export type PackageTier = 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'ultimate' | 'legendary';

export interface GemPackage {
  id: string
  name: string
  coins: number
  price: number
  bonus?: number
  imageUrl: string
  scale?: number // Scale for the image position
  offsetY?: number // Offset for the image position
  offsetX?: number // Offset for the image position
  bceLink: string // Bolt Checkout link for the package
  popular?: boolean
  savings?: string
  tier: PackageTier // Medieval tier system
}
