var FB = {
    WIDTH: 320,
    HEIGHT: 480,
    scale: 1,
    devicePixelRatio: 1,
    offset: {
        top: 0,
        left: 0
    },
    entities: [],
    currentWidth: null,
    currentHeight: null,
    canvas: null,
    ctx: null,
    score: {
        taps: 0,
        bolts: 0
    },
    distance: 0,
	digits:[],
	fonts:[],
	lasers: [],
	lives: 3,
	backgroundMusic: null,
	backgroundMusicNext: null,
	gameReady: false,
	clickToBeginStartTime: null,
	notification: {
		message: null,
		startTime: null,
		duration: 2000,
		config: {
			fontSize: 10,
			color: '#39ff14',
			y: 12,
			prefix: '+ ',
			suffix: ' +'
		}
	},

    RATIO: null,
    bg_grad: "day",
	game:null,
    currentWidth: null,
    currentHeight: null,
    canvas: null,
    ctx: null,
    ua: null,
    android: null,
    ios: null,
    gradients: {},
    init: function () {
        FB.RATIO = FB.WIDTH / FB.HEIGHT;
        FB.currentWidth = FB.WIDTH;
        FB.currentHeight = FB.HEIGHT;
        FB.canvas = document.getElementsByTagName('canvas')[0];
        FB.ctx = FB.canvas.getContext('2d');
        
        FB.devicePixelRatio = window.devicePixelRatio || 1;
        FB.setupHighDPICanvas();
        
        FB.ua = navigator.userAgent.toLowerCase();
        FB.android = FB.ua.indexOf('android') > -1 ? true : false;
        FB.ios = (FB.ua.indexOf('iphone') > -1 || FB.ua.indexOf('ipad') > -1) ? true : false;

        var grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
        grad.addColorStop(0, '#036');
        grad.addColorStop(0.5, '#69a');
        grad.addColorStop(1, 'yellow');
        FB.gradients.dawn = grad;

        grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
        grad.addColorStop(0, '#69a');
        grad.addColorStop(0.5, '#9cd');
        grad.addColorStop(1, '#fff');
        FB.gradients.day = grad;

        grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
        grad.addColorStop(0, '#036');
        grad.addColorStop(0.3, '#69a');
        grad.addColorStop(1, 'pink');
        FB.gradients.dusk = grad;

        grad = FB.ctx.createLinearGradient(0, 0, 0, FB.HEIGHT);
        grad.addColorStop(0, '#036');
        grad.addColorStop(1, 'black');
        FB.gradients.night = grad;

        window.addEventListener('click', function (e) {
            if (!FB.gameReady) return;
            e.preventDefault();
            FB.Input.set(e);
        }, false);

        window.addEventListener('touchstart', function (e) {
            if (!FB.gameReady) return;
            e.preventDefault();
            FB.Input.set(e.touches[0]);
        }, false);
        window.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
        window.addEventListener('touchend', function (e) {
            e.preventDefault();
        }, false);
        
        window.addEventListener('keydown', function (e) {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                FB.GameUtils.shootLaser();
            }
            FB.Input.keys[e.key.toLowerCase()] = true;
        }, false);
        
        window.addEventListener('keyup', function (e) {
            FB.Input.keys[e.key.toLowerCase()] = false;
        }, false);

        FB.Buttons.init();
        
        FB.resize();
        
        FB.showIntroVideo();

    },
    
    showIntroVideo: function() {
        var video = document.getElementById('intro-video');
        if (!video) {
            FB.showClickToBegin();
            return;
        }
        
        var isFirstTime = !localStorage.getItem('hasSeenIntro');
        var wasRefreshed = performance.getEntriesByType('navigation')[0] && 
                          performance.getEntriesByType('navigation')[0].type === 'reload';
        
        if (!isFirstTime && !wasRefreshed) {
            var hasSeenInSession = sessionStorage.getItem('hasSeenIntro');
            if (hasSeenInSession === 'true') {
                video.classList.add('hidden');
                FB.showClickToBegin();
                return;
            }
        }
        
        if (isFirstTime) {
            localStorage.setItem('hasSeenIntro', 'true');
        }
        
        video.addEventListener('ended', function() {
            video.classList.add('hidden');
            sessionStorage.setItem('hasSeenIntro', 'true');
            FB.showClickToBegin();
        }, { once: true });
        
        video.addEventListener('error', function() {
            video.classList.add('hidden');
            FB.showClickToBegin();
        }, { once: true });
        
        video.play().catch(function() {
            video.classList.add('hidden');
            FB.showClickToBegin();
        });
    },
    
    showClickToBegin: function() {
        var clickToBegin = document.getElementById('click-to-begin');
        if (!clickToBegin) {
            FB.startGame();
            return;
        }
        
        FB.clickToBeginStartTime = Date.now();
        clickToBegin.classList.remove('hidden');
        
        var handleClick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            clickToBegin.classList.add('hidden');
            clickToBegin.removeEventListener('click', handleClick);
            clickToBegin.removeEventListener('touchstart', handleClick);
            FB.startBackgroundMusic();
            FB.gameReady = true;
            FB.Input.tapped = false;
            FB.clickToBeginStartTime = null;
            setTimeout(function() {
                FB.startGame();
            }, 50);
        };
        
        clickToBegin.addEventListener('click', handleClick, { once: true });
        clickToBegin.addEventListener('touchstart', handleClick, { once: true });
        
        FB.renderClickToBegin();
    },
    
    renderClickToBegin: function() {
        var clickToBegin = document.getElementById('click-to-begin');
        if (!clickToBegin || clickToBegin.classList.contains('hidden') || !FB.clickToBeginStartTime) {
            return;
        }
        
        var textElement = document.getElementById('click-to-begin-text');
        if (!textElement) return;
        
        var elapsedTime = (Date.now() - FB.clickToBeginStartTime) / 1000;
        var breath = (Math.sin(elapsedTime * 4) + 1) / 2;
        var sizeMultiplier = 0.9 + (breath * 0.1);
        
        var baseSize = 20;
        var currentSize = baseSize * sizeMultiplier;
        textElement.style.fontSize = currentSize + 'px';
        
        requestAnimationFrame(FB.renderClickToBegin);
    },
    
    startBackgroundMusic: function() {
        if (!FB.backgroundMusic) {
            var musicSrc = 'assets/sounds/Static Demo Master 1 [Original Soundtrack by Sanyi].mp3';
            FB.backgroundMusic = new Audio(musicSrc);
            FB.backgroundMusicNext = new Audio(musicSrc);
            FB.backgroundMusic.preload = 'auto';
            FB.backgroundMusicNext.preload = 'auto';
            
            var switchToNext = function() {
                var temp = FB.backgroundMusic;
                FB.backgroundMusic = FB.backgroundMusicNext;
                FB.backgroundMusicNext = temp;
                FB.backgroundMusicNext.currentTime = 0;
                FB.backgroundMusic.addEventListener('ended', switchToNext);
            };
            
            FB.backgroundMusic.addEventListener('timeupdate', function() {
                if (this.duration && this.currentTime > this.duration - 0.02 && FB.backgroundMusicNext.paused) {
                    FB.backgroundMusicNext.play().catch(function() {});
                }
            });
            
            FB.backgroundMusic.addEventListener('ended', switchToNext);
        }
        FB.backgroundMusic.play().catch(function(err) {
            console.log('Background music play failed:', err);
        });
    },
    
    startGame: function() {
        FB.changeState("Splash");
        FB.loop();
    },

    setupHighDPICanvas: function() {
        FB.canvas.width = FB.WIDTH * FB.devicePixelRatio;
        FB.canvas.height = FB.HEIGHT * FB.devicePixelRatio;
        
        FB.canvas.style.width = FB.WIDTH + 'px';
        FB.canvas.style.height = FB.HEIGHT + 'px';
        
        FB.ctx.scale(FB.devicePixelRatio, FB.devicePixelRatio);
        
        FB.ctx.imageSmoothingEnabled = true;
        FB.ctx.imageSmoothingQuality = 'high';
    },

    resize: function () {

        FB.currentHeight = window.innerHeight;
        FB.currentWidth = FB.currentHeight * FB.RATIO;

        if (FB.android || FB.ios) {
            document.body.style.height = (window.innerHeight + 50) + 'px';
        }

        FB.canvas.style.width = FB.currentWidth + 'px';
        FB.canvas.style.height = FB.currentHeight + 'px';

        FB.scale = FB.currentWidth / FB.WIDTH;
        FB.offset.top = FB.canvas.offsetTop;
        FB.offset.left = FB.canvas.offsetLeft;

        window.setTimeout(function () {
            window.scrollTo(0, 1);
        }, 1);
    },
		            
    update: function () {
        FB.game.update();
        FB.Input.tapped = false;
        FB.GameUtils.updateLasers();
    },

    render: function () {

        FB.Draw.rect(0, 0, FB.WIDTH, FB.HEIGHT, FB.gradients[FB.bg_grad]);
		 
        FB.GameUtils.renderLasers();
        
        for (i = 0; i < FB.entities.length; i += 1) {
            FB.entities[i].render();
        }
		
		FB.game.render();
		
    },

    loop: function () {

        requestAnimFrame(FB.loop);

        FB.update();
        FB.render();
    },
	changeState: function(state) {    				 
		FB.game = new window[state]();
		FB.game.init();
	}
};

window.addEventListener('load', FB.init, false);
window.addEventListener('resize', FB.resize, false);
