const baseURL = process.env.BOLT_BASE_URL;
const apiKey = process.env.BOLT_API_KEY;
const publishableKey = process.env.BOLT_PUBLISHABLE_KEY;
const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const anotherEnv = process.env.ANOTHER;

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
  anotherEnv
}
