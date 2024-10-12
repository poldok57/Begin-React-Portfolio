export type Coordinate = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Area = Coordinate &
  Size & {
    ratio?: number;
  };

export type RectPosition = {
  left: number;
  top: number;
};

export type Rectangle = RectPosition &
  Size & {
    right?: number;
    bottom?: number;
  };

export type ArgsMouseOnShape = {
  coordinate: Coordinate;
  area: Area;
  withResize: boolean;
  withCornerButton: boolean | null;
  withTurningButtons: boolean | null;
  maxWidth: number;
};

export type MouseCircle = {
  color: string;
  width: number;
  filled: boolean;
  lineWidth: number;
};

export enum LineType {
  LINE = "l",
  CURVE = "c",
}
export interface LinePath {
  type: LineType;
  end?: Coordinate | null;
  coordinates?: Coordinate | null;
  lineWidth: number;
  globalAlpha?: number | null;
  strokeStyle?: string | null;
}
