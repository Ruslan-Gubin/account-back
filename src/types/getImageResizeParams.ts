export type getImageResizeParams = {
  buffer: Buffer;
  width?: number;
  height?: number;
  blur?: number;
  rotate?: number;
  linear?: number[];
  modulate?: number[];
  border?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    background: string;
  };
}