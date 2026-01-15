FB.Storage = {
    
    getCookie: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    },
    
    setCookie: function(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    },
    
    getHighScore: function() {
        var savedscore = this.getCookie("highscore");
        if (savedscore !== "") {
            var hs = parseInt(savedscore) || 0;
            if (hs < FB.score.bolts) {
                hs = FB.score.bolts;
                this.setCookie("highscore", hs, 999);
            }
            return hs;
        } else {
            this.setCookie("highscore", FB.score.bolts, 999);
            return FB.score.bolts;
        }
    }
};
