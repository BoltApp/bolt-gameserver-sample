import type { CoinPackage } from './types'

import GameGems1 from '../assets/IconGroup_ShopIcon_Gems_s_0.png'
import GameGems2 from '../assets/IconGroup_ShopIcon_Gems_s_1.png'
import GameGems3 from '../assets/IconGroup_ShopIcon_Gems_s_2.png'
import GameGems4 from '../assets/IconGroup_ShopIcon_Gems_s_3.png'
import GameGems5 from '../assets/IconGroup_ShopIcon_Gems_s_4.png'
import GameGems6 from '../assets/IconGroup_ShopIcon_Gems_s_5.png'


const BCE_LINK =
  'https://gregs-guava-myshopify.c-staging.bolt.com/c?u=7oLxSjeYAcfTFpKsK2o43r&publishable_key=zQVb4QDUzwJD.GOxcEQV1ZNbW.bb17ba147d91e23de2647182d1381b60b281a2cd47092642a2fa214229cc43de'

export const coinPackages: CoinPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 100,
    price: 0.99,
    imageUrl: GameGems1,
    bceLink: BCE_LINK,
    offsetY: 40,
    scale: 0.50,
    tier: 'starter',
  },
  {
    id: 'bronze',
    name: 'Bronze Pack',
    coins: 500,
    price: 4.99,
    imageUrl: GameGems2,
    bceLink: BCE_LINK,
    offsetY: 24,
    tier: 'bronze',
  },
  {
    id: 'silver',
    name: 'Silver Pack',
    coins: 1200,
    price: 9.99,
    bonus: 200,
    imageUrl: GameGems3,
    bceLink: BCE_LINK,
    offsetY: 20,
    tier: 'silver',
  },
  {
    id: 'gold',
    name: 'Gold Pack',
    coins: 2500,
    price: 19.99,
    bonus: 500,
    popular: true,
    imageUrl: GameGems4,
    bceLink: BCE_LINK,
    offsetY: 30,
    offsetX: 52,
    tier: 'gold',
  },
  {
    id: 'platinum',
    name: 'Platinum Pk',
    coins: 5500,
    price: 39.99,
    bonus: 1500,
    savings: '25% OFF',
    imageUrl: GameGems5,
    bceLink: BCE_LINK,
    offsetY: 10,
    offsetX: 52,
    // scale: 0.2,
    tier: 'platinum',
  },
  {
    id: 'diamond',
    name: 'Diamond Pack',
    coins: 12000,
    price: 79.99,
    bonus: 4000,
    savings: '33% OFF',
    imageUrl: GameGems6,
    bceLink: BCE_LINK,
    offsetY: 3,
    offsetX: 53,
    tier: 'diamond',
  },
  // {
  //   id: 'ultimate',
  //   name: 'Ultimate Pack',
  //   coins: 25000,
  //   price: 149.99,
  //   bonus: 10000,
  //   savings: '40% OFF',
  //   imageUrl: GameCoins,
  //   bceLink: BCE_LINK,
  // },
  // {
  //   id: 'mega',
  //   name: 'Mega Pack',
  //   coins: 50000,
  //   price: 249.99,
  //   bonus: 25000,
  //   savings: '50% OFF',
  //   imageUrl: GameCoins,
  //   bceLink: BCE_LINK,
  // },
]
