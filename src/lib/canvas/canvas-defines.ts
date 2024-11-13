import { Area, MouseCircle } from "./types";

export const SHAPE_TYPE = {
  SQUARE: "square",
  CIRCLE: "circle",
  ONE_RADIUS_T: "radiusTop",
  ONE_RADIUS_B: "radiusBottom",
  TWO_RADIUS: "radiusHalf",
  SELECT: "select-auto",
  IMAGE: "image",
  TEXT: "text",
};

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
  TRANSPARENCY: "transparency",
  CUT: "cut",
  COPY: "copy",
  PASTE: "paste",
  DELETE: "delete",
  SELECT_AREA: "selectArea",
  BLACK_WHITE: "blackWhite",
};

export const DRAWING_MODES = {
  PAUSE: "pause",
  DRAW: "draw",
  LINE: "line",
  ARC: "arc",
  PATH: "path",
  CLOSED_PATH: "closedPath",
  END_PATH: "endPath",
  ERASE: "erase",

  CONTROL_PANEL: {
    IN: "in",
    OUT: "out",
  },
  CHANGE: "drawChange",
  ACTION: "drawAction",

  ...DRAWING_ACTIONS,
  ...IMAGE_ACTIONS,
  ...SHAPE_TYPE,
};

const LINE_MODES = [
  DRAWING_MODES.LINE,
  DRAWING_MODES.ARC,
  DRAWING_MODES.PATH,
  DRAWING_MODES.CLOSED_PATH,
  DRAWING_MODES.END_PATH,
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
const SELECT_MODES = [DRAWING_MODES.SELECT, DRAWING_MODES.IMAGE];

const ALL_DRAWING_MODES = [
  ...LINE_MODES,
  ...FREEHAND_MODES,
  ...SHAPE_MODES,
  ...SELECT_MODES,
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
export const isDrawingAllLines = (mode: string) =>
  isDrawingLine(mode) || isDrawingFreehand(mode);
export const isDrawingSelect = (mode: string) => SELECT_MODES.includes(mode);

const DEFAULT = {
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
};
export type ParamsShape = {
  filled?: boolean;
  radius?: number;
  withText?: boolean;
  withBorder?: boolean;
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
  filled: boolean;
  color: string;
  opacity: number;
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
};
export type GroupParams = {
  [key: string]:
    | string
    | boolean
    | ParamsGeneral
    | ParamsShape
    | ParamsText
    | ParamsPath
    | null;
};

export interface ThingsToDraw {
  type: string;
  rotation: number;
  size: Area;
  general: ParamsGeneral;
  withTurningButtons?: boolean;
  withCornerButton?: boolean;
  withResize?: boolean;
}

export interface ShapeDefinition extends ThingsToDraw {
  blackWhite?: boolean;
  canvasImage?: HTMLCanvasElement | null;
  canvasImageTransparent?: HTMLCanvasElement | null;
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
    filled: true,
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
  path: {
    filled: false,
    color: DEFAULT.PATH_COLOR,
    opacity: 0.5,
  },
};
