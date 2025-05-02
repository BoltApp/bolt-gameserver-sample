import { BoltSDK } from './index';

const baseURL = process.env.BOLT_BASE_URL;
const apiKey = process.env.BOLT_API_KEY;
const publishableKey = process.env.BOLT_PUBLISHABLE_KEY;

if (!apiKey) {
  throw new Error('BOLT_API_KEY is not set');
}

if (!publishableKey) {
  throw new Error('BOLT_PUBLISHABLE_KEY is not set');
}

// Create a new BoltSDK instance
const sdk = new BoltSDK(apiKey, publishableKey, baseURL);

/** ---------------------
 *        Products
 * ---------------------- */

// List all products in your app
await sdk.products.getAllProducts().then(console.log).catch(console.error);

// Get a specific product
await sdk.products.getProduct('example-product-id').then(console.log).catch(console.error);

/** ---------------------
 *      Subscriptions
 * ---------------------- */

// List all owned products for a user (subscriptions)
await sdk.subscriptions.getAllSubscriptionsForUser('test@test.com').then(console.log).catch(console.error);

// See if a user owns a product (subscription)
await sdk.subscriptions.getSubscription('sub_123').then(console.log).catch(console.error);

// Remove user's ownership of a product (subscription)
await sdk.subscriptions.cancelSubscription('sub_123').then(console.log).catch(console.error);