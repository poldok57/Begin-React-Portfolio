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
    right: number;
    bottom: number;
  };

export type ArgsMouseOnShape = {
  coordinate: Coordinate;
  area: Area;
  withResize: boolean;
  withCornerButton: boolean | null;
  withMiddleButtons: boolean | null;
  maxWidth: number;
};

export type MouseCircle = {
  color: string;
  width: number;
  filled: boolean;
  lineWidth: number;
};
