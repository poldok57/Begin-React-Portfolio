export interface Coordinate {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Area extends Coordinate, Size {
  ratio?: number;
}

export interface RectPosition {
  left: number;
  top: number;
}

export interface Rectangle extends RectPosition, Size {
  right?: number;
  bottom?: number;
}

export interface ButtonArgs extends Rectangle {
  radius: number;
  centerX: number;
  centerY: number;
}
export interface RectangleArgs {
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  width?: number;
  right?: number;
  height?: number;
  bottom?: number;
}
export interface MiddleButton extends Rectangle {
  middle: number;
  axeX1: number;
  axeX2: number;
  axeY: number;
  radius: number;
  bottom: number;
}

export interface MouseCircle {
  color: string;
  width: number;
  filled: boolean;
  lineWidth: number;
  globalAlpha?: number | null;
}

export enum LineType {
  START = "s",
  LINE = "l",
  CURVE = "c",
  ARROW = "a",
}
export interface LinePath {
  type: LineType;
  end?: Coordinate | null;
  coordinates?: Coordinate | null;
  lineWidth?: number;
  globalAlpha?: number | null;
  strokeStyle?: string | null;
  headSize?: number;
  padding?: number;
  curvature?: number;
}
