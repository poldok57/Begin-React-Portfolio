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

export interface ArgsMouseOnShape {
  coordinate: Coordinate;
  area: Area;
  withResize: boolean;
  withCornerButton: boolean | null;
  withTurningButtons: boolean | null;
  maxWidth: number;
}

export interface MouseCircle {
  color: string;
  width: number;
  filled: boolean;
  lineWidth: number;
}

export enum LineType {
  START = "s",
  LINE = "l",
  CURVE = "c",
}
export interface LinePath {
  type: LineType;
  end?: Coordinate | null;
  coordinates?: Coordinate | null;
  lineWidth?: number;
  globalAlpha?: number | null;
  strokeStyle?: string | null;
}
