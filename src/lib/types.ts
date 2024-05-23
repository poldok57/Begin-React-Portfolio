export type Coordinate = {
  x: number;
  y: number;
};

export type Surface = {
  width: number;
  height: number;
};
export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
  ratio?: number;
};

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
export type RectPosition = {
  left: number;
  top: number;
};
export type ArgsMouseOnShape = {
  coordinate: Coordinate;
  area: Area;
  withResize: boolean;
  withCornerButton: boolean | null;
  withMiddleButtons: boolean | null;
  maxWidth: number;
};
