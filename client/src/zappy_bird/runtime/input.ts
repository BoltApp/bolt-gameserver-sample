export interface Offset {
  top: number;
  left: number;
}

export class Input {
  private _x = 0;
  private _y = 0;
  private _tapped = false;
  keys: Record<string, boolean> = {};
  private getOffset: () => Offset;
  private getScale: () => number;
  private getPlayOffset: () => Offset;

  constructor(getOffset: () => Offset, getScale: () => number, getPlayOffset: () => Offset) {
    this.getOffset = getOffset;
    this.getScale = getScale;
    this.getPlayOffset = getPlayOffset;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get tapped(): boolean {
    return this._tapped;
  }

  set tapped(v: boolean) {
    this._tapped = v;
  }

  set(data: { pageX: number; pageY: number }): void {
    const offset = this.getOffset();
    const scale = this.getScale();
    const playOffset = this.getPlayOffset();
    const viewX = (data.pageX - offset.left) / scale;
    const viewY = (data.pageY - offset.top) / scale;
    this._x = viewX - playOffset.left;
    this._y = viewY - playOffset.top;
    this._tapped = true;
  }

  isKeyDown(key: string): boolean {
    return this.keys[key] === true;
  }
}
