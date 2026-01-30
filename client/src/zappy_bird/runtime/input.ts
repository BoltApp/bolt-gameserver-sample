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

  constructor(getOffset: () => Offset, getScale: () => number) {
    this.getOffset = getOffset;
    this.getScale = getScale;
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
    this._x = (data.pageX - offset.left) / scale;
    this._y = (data.pageY - offset.top) / scale;
    this._tapped = true;
  }

  isKeyDown(key: string): boolean {
    return this.keys[key] === true;
  }
}
