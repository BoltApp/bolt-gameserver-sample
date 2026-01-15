FB.Input = {

    x: 0,
    y: 0,
    tapped: false,
    keys: {},

    set: function (data) {
        this.x = (data.pageX - FB.offset.left) / FB.scale;
        this.y = (data.pageY - FB.offset.top) / FB.scale;
        this.tapped = true;

    },

    isKeyDown: function(key) {
        return this.keys[key] === true;
    }

};
