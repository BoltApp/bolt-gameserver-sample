import { env } from '../config'
import { gemAssetConfig } from '../configs/products-config'

/**
 * Generate asset URL for a product SKU based on environment
 * @param sku Product SKU (e.g., 'gems-100')
 * @returns Full asset URL or fallback to hardcoded staging URL
 */
export function getAssetUrlForSku(sku: string): string {
  const filename = gemAssetConfig[sku]
  
  // Fallback to hardcoded staging URL if SKU not found in config
  if (!filename) {
    console.warn(`No asset mapping found for SKU: ${sku}, using fallback`)
    return 'https://gaming.staging-bolt.com/assets/IconGroup_ShopIcon_Gems_s_0.png'
  }
  
  // Environment-specific asset path
  const assetPath = process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production' 
    ? '/assets/' 
    : '/src/assets/'
  
  // Ensure proper URL concatenation (remove trailing slash from frontendUrl if present)
  const baseUrl = env.frontendUrl.endsWith('/') ? env.frontendUrl.slice(0, -1) : env.frontendUrl
  return `${baseUrl}${assetPath}${filename}`
}
