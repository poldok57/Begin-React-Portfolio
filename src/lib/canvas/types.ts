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
/** Rotation lever drawn from the element center to a draggable knob. */
export interface RotationHandle {
  centerX: number;
  centerY: number;
  handleX: number;
  handleY: number;
  radius: number;
  /** Ratio along the stem where the bar leaves the shape (0..1). */
  outerStart: number;
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
