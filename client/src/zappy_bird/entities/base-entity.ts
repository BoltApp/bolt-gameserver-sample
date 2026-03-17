export interface BaseEntity {
  type: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  width?: number;
  height?: number;
  remove?: boolean;
  update(): void;
  render(): void;
  respawn?(): void;
}
