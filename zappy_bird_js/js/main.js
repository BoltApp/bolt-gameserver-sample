// Bolt SDK initialization (following client pattern from main.tsx)
import { BoltSDK } from '@boltpay/bolt-js';

// Initialize Bolt SDK using Vite env variables (like client does)
// Note: client uses VITE_GAME_ID, not VITE_BOLT_GAME_ID
BoltSDK.initialize({
  publishableKey: import.meta.env.VITE_BOLT_PUBLISHABLE_KEY,
  gameId: import.meta.env.VITE_GAME_ID || import.meta.env.VITE_BOLT_GAME_ID,
  environment: 'Development',
});

// Make BoltSDK available globally
window.BoltSDK = BoltSDK;

// Set backend URL from env (fallback to default)
window.BOLT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3111';

// Dispatch event to signal SDK is ready
window.dispatchEvent(new CustomEvent('boltSDKReady'));

console.log('Bolt SDK initialized successfully');
console.log('Using gameId:', import.meta.env.VITE_GAME_ID || import.meta.env.VITE_BOLT_GAME_ID);


(function() {
    window.GAME_CONFIG = {
        spaceshipEnabled: false,
        voltageBoost: false
    };
    
    var scripts = [
        'js/utils.js',
        'js/core.js',
        'js/storage.js',
        'js/sound.js',
        'js/draw.js',
        'js/input.js',
        'js/entities.js',
        'js/collision.js',
        'js/game-utils.js',
        'js/buttons.js',
        'js/states.js'
    ];
    
    var loadScript = function(src, callback) {
        var script = document.createElement('script');
        script.src = src + '?v=' + Date.now();
        script.onload = callback;
        script.onerror = function() {
            console.error('Failed to load script: ' + src);
        };
        document.head.appendChild(script);
    };
    
    var loadScripts = function(scripts, index) {
        if (index >= scripts.length) {
            return;
        }
        loadScript(scripts[index], function() {
            loadScripts(scripts, index + 1);
        });
    };
    
    function initGame() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                loadScripts(scripts, 0);
            });
        } else {
            loadScripts(scripts, 0);
        }
    }
    
    if (window.BoltSDK) {
        initGame();
    } else {
        window.addEventListener('boltSDKReady', function() {
            console.log('BoltSDK ready, initializing game');
            initGame();
        }, { once: true });
    }
})();
