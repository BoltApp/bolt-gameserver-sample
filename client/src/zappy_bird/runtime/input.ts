const FB = window.FB!;

FB.Input = {
  x: 0,
  y: 0,
  tapped: false,
  keys: {} as Record<string, boolean>,

  set: function (data: { pageX: number; pageY: number }): void {
    this.x = (data.pageX - FB.offset.left) / FB.scale;
    this.y = (data.pageY - FB.offset.top) / FB.scale;
    this.tapped = true;
  },

  isKeyDown: function (key: string): boolean {
    return this.keys[key] === true;
  },
};

export {};
