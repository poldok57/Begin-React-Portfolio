import { Area, Coordinate, LinePath, MouseCircle } from "./types";

const DRAWING_ACTIONS = {
  UNDO: "undo",
  SAVE: "save",
  LOAD: "load",
  INIT: "init",
  ABORT: "abort",
  VALID: "valid",
  CLOSE_PATH: "closePath",
  STOP_PATH: "stopPath",
};

const IMAGE_ACTIONS = {
  IMAGE_RADIUS: "imageRadius",
  CUT: "cut",
  COPY: "copy",
  PASTE: "paste",
  DELETE: "delete",
  SELECT_AREA: "selectArea",
};

export const SHAPE_TYPE = {
  SQUARE: "Square",
  CIRCLE: "Circle",
  ONE_RADIUS_T: "Radius Top",
  ONE_RADIUS_B: "Radius Bottom",
  TWO_RADIUS: "Radius Half",
  SELECT: "select-auto",
  IMAGE: "Image",
  TEXT: "Text",
};

export const DRAW_TYPE = {
  BACKGROUND: "Background",
  DRAW: "Draw",
  LINES_PATH: "Lines & Path",
  ARROW: "Arrow",
  ...SHAPE_TYPE,
};

export const DRAWING_MODES = {
  PAUSE: "pause",
  LINE: "line",
  ARC: "arc",
  ERASE: "erase",
  RELOAD: "reload",
  FIND: "find",

  CONTROL_PANEL: {
    IN: "in",
    OUT: "out",
  },
  CHANGE: "drawChange",
  ACTION: "drawAction",

  ...DRAW_TYPE,
  ...DRAWING_ACTIONS,
  ...IMAGE_ACTIONS,
  ...SHAPE_TYPE,
};

const LINE_MODES = [
  DRAWING_MODES.LINE,
  DRAWING_MODES.ARC,
  DRAWING_MODES.ARROW,
  DRAWING_MODES.LINES_PATH,
];
const FREEHAND_MODES = [
  DRAWING_MODES.DRAW,
  DRAWING_MODES.ERASE,
  DRAWING_MODES.PAUSE,
];
const SHAPE_MODES = [
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.ONE_RADIUS_T,
  DRAWING_MODES.ONE_RADIUS_B,
  DRAWING_MODES.TWO_RADIUS,
];
const PAUSE_MODES = [DRAWING_MODES.PAUSE, DRAWING_MODES.FIND];
const SELECT_MODES = [DRAWING_MODES.SELECT, DRAWING_MODES.IMAGE];

const ALL_DRAWING_MODES = [
  ...LINE_MODES,
  ...FREEHAND_MODES,
  ...SHAPE_MODES,
  ...SELECT_MODES,
  ...PAUSE_MODES,
  DRAWING_MODES.TEXT,
  DRAWING_MODES.PAUSE,
];
export const isDrawingMode = (mode: string) => ALL_DRAWING_MODES.includes(mode);
export const isDrawingShape = (mode: string) => SHAPE_MODES.includes(mode);
export const isDrawingSquare = (mode: string) =>
  isDrawingShape(mode) && mode !== DRAWING_MODES.CIRCLE;
export const isDrawingLine = (mode: string) => LINE_MODES.includes(mode);
export const isDrawingFreehand = (mode: string) =>
  FREEHAND_MODES.includes(mode);
export const isDrawingSelect = (mode: string) => SELECT_MODES.includes(mode);
export const isDrawingPause = (mode: string) => PAUSE_MODES.includes(mode);
export const DEFAULT = {
  COLOR: "#ff0000",
  SIZE: 4,
  OPACITY: 1,
  BORDER_COLOR: "#8b8080",
  PATH_COLOR: "#20d0d0",
  TEXT_COLOR: "#404080",
};

export const mouseCircle: MouseCircle = {
  color: "rgba(255, 255, 0,0.8)",
  width: 80,
  filled: true,
  lineWidth: 25,
};
export type Params = {
  [key: string]: string | number | boolean | null; // Exemple avec une union de types
};

export type EventModeAction = {
  mode: string;
  action?: string;
  filename?: string;
  name?: string;
  theme?: string;
  format?: string;
  value?: string | number | boolean;
};

export interface EventDetail extends Event {
  detail: EventModeAction;
}

export type ParamsGeneral = {
  color: string;
  lineWidth: number;
  opacity: number;
  interval?: number;
  filled?: boolean;
};
export type ParamsShape = {
  radius?: number;
  withText?: boolean;
  withBorder?: boolean;
  transparency?: number;
  blackWhite?: boolean;
};
export type ParamsText = {
  text: string;
  color: string;
  font: string;
  bold: number;
  italic: boolean;
  fontSize: number;
  rotation: number;
};
export type ParamsPath = {
  color?: string;
  opacity?: number;
};
export type ParamsArrow = {
  headSize?: number;
  padding?: number;
  curvature?: number;
};
export type AllParams = {
  mode: string;
  fixed: boolean;
  lockRatio: boolean;
  general: ParamsGeneral;
  shape: ParamsShape;
  text: ParamsText;
  border: ParamsGeneral;
  path: ParamsPath;
  arrow: ParamsArrow;
};
export type GroupParams = {
  [key: string]:
    | string
    | boolean
    | ParamsGeneral
    | ParamsShape
    | ParamsText
    | ParamsPath
    | ParamsArrow
    | null;
};

export interface ThingsToDraw {
  id: string;
  type: string;
  rotation: number;

  size: Area;
  general: ParamsGeneral;
  path?: ParamsPath;
  withTurningButtons?: boolean;
  withCornerButton?: boolean;
  erase?: boolean;
}

export interface CanvasPointsData extends ThingsToDraw {
  items: LinePath[] | Coordinate[];
}
export interface ShapeDefinition extends ThingsToDraw {
  // transparency?: number;
  canvasImage?: HTMLCanvasElement | null;
  canvasImageContext?: CanvasRenderingContext2D | null;
  canvasImageTransparent?: HTMLCanvasElement | null;
  dataURL?: string | null;
  format?: string;
  shape?: ParamsShape;
  border?: ParamsGeneral;
  text?: ParamsText;
}

export const DEFAULT_PARAMS: AllParams = {
  mode: DRAWING_MODES.INIT,
  fixed: false,
  lockRatio: false,
  general: {
    color: DEFAULT.COLOR,
    lineWidth: DEFAULT.SIZE,
    opacity: DEFAULT.OPACITY,
  },
  shape: {
    radius: 10,
    withText: false,
    withBorder: false,
  },
  text: {
    text: "",
    color: DEFAULT.TEXT_COLOR,
    font: "Arial",
    bold: 100,
    italic: false,
    fontSize: 24,
    rotation: 0,
  },
  border: {
    color: DEFAULT.BORDER_COLOR,
    lineWidth: 1,
    opacity: 1,
    interval: 0,
  },
  path: {},
  arrow: {
    headSize: 15,
    padding: 0,
    curvature: 0.1,
  },
};
