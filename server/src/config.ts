const baseURL = process.env.BOLT_BASE_URL;
const apiKey = process.env.BOLT_API_KEY;
const publishableKey = process.env.BOLT_PUBLISHABLE_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!apiKey) {
  throw new Error("BOLT_API_KEY is not set");
}

if (!publishableKey) {
  throw new Error("BOLT_PUBLISHABLE_KEY is not set");
}

export const env = {
  baseURL,
  apiKey,
  publishableKey,
  jwtSecret,
  bolt: {
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
