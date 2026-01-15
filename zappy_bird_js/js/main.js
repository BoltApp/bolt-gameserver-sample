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
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadScripts(scripts, 0);
        });
    } else {
        loadScripts(scripts, 0);
    }
})();
