import crypto from 'crypto'

const baseURL = process.env.BOLT_BASE_URL;
const apiKey = process.env.BOLT_API_KEY;
const publishableKey = process.env.BOLT_PUBLISHABLE_KEY;
let jwtSecret = process.env.JWT_SECRET;

if (!baseURL) {
  throw new Error("BOLT_BASE_URL is not set")
}

if (!apiKey) {
  throw new Error("BOLT_API_KEY is not set");
}

if (!publishableKey) {
  throw new Error("BOLT_PUBLISHABLE_KEY is not set");
}

if (!jwtSecret) {
  console.warn("JWT_SECRET is not set, generating a temporary secret. Authentications will expire on restart.")
  jwtSecret = crypto.randomBytes(64).toString('hex')
}

export const env = {
  baseURL,
  apiKey,
  publishableKey,
  jwtSecret
}
