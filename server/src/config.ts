import crypto from 'crypto'

const baseURL = process.env.BOLT_BASE_URL;
if (!baseURL) {
  throw new Error("BOLT_BASE_URL is not set")
}

const apiKey = process.env.BOLT_API_KEY;
if (!apiKey) {
  throw new Error("BOLT_API_KEY is not set");
}

const publishableKey = process.env.BOLT_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error("BOLT_PUBLISHABLE_KEY is not set");
}

const gameId = process.env.BOLT_GAME_ID || 'default-game-id';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.warn("JWT_SECRET is not set, generating a temporary secret. Authentications will expire on restart.")
  jwtSecret = crypto.randomBytes(64).toString('hex')
}

const frontendUrl = process.env.FRONTEND_URL || 'https://gaming.staging-bolt.com';

export const env = {
  baseURL,
  apiKey,
  publishableKey,
  jwtSecret,
  frontendUrl,
  bolt: {
    gameId,
    links: {
      'gems-100': process.env.BOLT_CHECKOUT_STARTER,
      'gems-500': process.env.BOLT_CHECKOUT_BRONZE,
      'gems-1400': process.env.BOLT_CHECKOUT_SILVER,
      'gems-3000': process.env.BOLT_CHECKOUT_GOLD,
      'gems-7000': process.env.BOLT_CHECKOUT_PLATINUM,
      'gems-16000': process.env.BOLT_CHECKOUT_DIAMOND,
    } as Record<string, string>,
  }
}
