FB.Sound = {
    
    channels: [],
    channelMax: 10,
    
    init: function() {
        this.channels = [];
        for (var a = 0; a < this.channelMax; a++) {
            this.channels[a] = {
                channel: new Audio(),
                finished: -1
            };
        }
    },
    
    play: function(sound) {
        if (!sound) return;
        
        var thistime = new Date().getTime();
        for (var a = 0; a < this.channels.length; a++) {
            if (this.channels[a].finished < thistime) {
                this.channels[a].finished = thistime + sound.duration * 1000;
                this.channels[a].channel.src = sound.src;
                this.channels[a].channel.load();
                this.channels[a].channel.play();
                break;
            }
        }
    }
};

FB.Sound.init();

FB.Sound.jump = new Audio("assets/sounds/wing.ogg");
FB.Sound.score = new Audio("assets/sounds/point.ogg");
FB.Sound.hit = new Audio("assets/sounds/hit.ogg");
FB.Sound.die = new Audio("assets/sounds/die.ogg");
FB.Sound.swoosh = new Audio("assets/sounds/swooshing.ogg");

var soundJump = FB.Sound.jump;
var soundScore = FB.Sound.score;
var soundHit = FB.Sound.hit;
var soundDie = FB.Sound.die;
var soundSwoosh = FB.Sound.swoosh;

function play_sound(s) {
    FB.Sound.play(s);
}
