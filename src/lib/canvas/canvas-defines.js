export const SHAPE_TYPE = {
  SQUARE: "square",
  CIRCLE: "circle",
  ONE_RADIUS_T: "radiusTop",
  ONE_RADIUS_B: "radiusBottom",
  TWO_RADIUS: "radiusHalf",
  SELECT: "select-auto",
  TEXT: "text",
};

export const DRAWING_MODES = {
  DRAW: "draw",
  LINE: "line",
  ARC: "arc",
  ERASE: "erase",
  UNDO: "undo",
  SAVE: "save",
  INIT: "init",
  CONTROL_PANEL: {
    IN: "in",
    OUT: "out",
  },
  DRAWING_CHANGE: "drawingChange",
  ...SHAPE_TYPE,
};

const LINE_MODES = [DRAWING_MODES.LINE, DRAWING_MODES.ARC];
const FREEHAND_MODES = [DRAWING_MODES.DRAW, DRAWING_MODES.ERASE];
const SHAPE_MODES = [
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.ONE_RADIUS_T,
  DRAWING_MODES.ONE_RADIUS_B,
  DRAWING_MODES.TWO_RADIUS,
  DRAWING_MODES.SELECT,
];

const ALL_DRAWING_MODES = [
  ...LINE_MODES,
  ...FREEHAND_MODES,
  ...SHAPE_MODES,
  DRAWING_MODES.TEXT,
];
export const isDrawingMode = (mode) => ALL_DRAWING_MODES.includes(mode);
export const isDrawingShape = (mode) => SHAPE_MODES.includes(mode);
export const isDrawingLine = (mode) => LINE_MODES.includes(mode);
export const isDrawingFreehand = (mode) => FREEHAND_MODES.includes(mode);
export const isDrawingAllLines = (mode) =>
  LINE_MODES.includes(mode) || FREEHAND_MODES.includes(mode);

const DEFAULT = { COLOR: "#ff0000", SIZE: 4, OPACITY: 1 };

export const mouseCircle = {
  color: "rgba(255, 255, 0,0.8)",
  width: 80,
  filled: true,
  lineWidth: 25,
};

export const DEFAULT_PARAMS = {
  mode: DRAWING_MODES.INIT,
  fixed: false,
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
    color: "#404080",
    font: "Arial",
    bold: 100,
    italic: false,
    fontSize: 20,
    rotation: 0,
  },
  border: {
    color: "#a0a0a0",
    lineWidth: 1,
    opacity: 1,
    interval: 0,
  },
  selectedArea: null,
};
