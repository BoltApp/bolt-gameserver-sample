/// <reference types="vite/client" />

// vite-imagetools: query-param image imports return a URL string by default.
// Using wildcards here because TypeScript can't resolve arbitrary query strings.
declare module "*.png?w=160&format=webp" {
  const src: string;
  export default src;
}

declare global {
    interface Window {
      BoltSDK?: any;
      BOLT_BACKEND_URL?: string;
      GAME_CONFIG?: {
        spaceshipEnabled: boolean;
        voltageBoost: boolean;
      };
      FB?: any;
    }
  }
  
  export {};