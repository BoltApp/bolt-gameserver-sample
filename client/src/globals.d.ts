/// <reference types="vite/client" />

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