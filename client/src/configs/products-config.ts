import type { GemPackageConfigs } from '../types'

import GameGems1 from '../assets/IconGroup_ShopIcon_Gems_s_0.png'
import GameGems2 from '../assets/IconGroup_ShopIcon_Gems_s_1.png'
import GameGems3 from '../assets/IconGroup_ShopIcon_Gems_s_2.png'
import GameGems4 from '../assets/IconGroup_ShopIcon_Gems_s_3.png'
import GameGems5 from '../assets/IconGroup_ShopIcon_Gems_s_4.png'
import GameGems6 from '../assets/IconGroup_ShopIcon_Gems_s_5.png'

export const gemConfig: GemPackageConfigs = {
  'gems-100': {
    imageUrl: GameGems1,
    offsetY: 40,
    scale: 0.50,
  },
  'gems-500': {
    imageUrl: GameGems2,
    offsetY: 24,
  },
  'gems-1400': {
    imageUrl: GameGems3,
    offsetY: 20,
  },
  'gems-3000': {
    imageUrl: GameGems4,
    offsetY: 30,
    offsetX: 52,
  },
  'gems-7000': {
    imageUrl: GameGems5,
    offsetY: 10,
    offsetX: 52,
  },
  'gems-16000': {
    imageUrl: GameGems6,
    offsetY: 3,
    offsetX: 53,
  },  
}
