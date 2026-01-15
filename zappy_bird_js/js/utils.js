window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
    };
})();

function getCookie(cname) {
    return FB.Storage.getCookie(cname);
}

function setCookie(cname, cvalue, exdays) {
    FB.Storage.setCookie(cname, cvalue, exdays);
}
