export const SHAPE_TYPE = {
  SQUARE: "square",
  CIRCLE: "circle",
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
  RESET: "reset",
  CONTROL_PANEL: {
    IN: "in",
    OUT: "out",
  },
  DRAWING_CHANGE: "drawingChange",
  ...SHAPE_TYPE,
};
const ALL_DRAWING_MODES = [
  DRAWING_MODES.DRAW,
  DRAWING_MODES.ERASE,
  DRAWING_MODES.LINE,
  DRAWING_MODES.ARC,
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.TEXT,
];

const LINE_MODES = [DRAWING_MODES.DRAW, DRAWING_MODES.LINE, DRAWING_MODES.ARC];

const SHAPE_MODES = [
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.TEXT,
];
export const isDrawingMode = (mode) => ALL_DRAWING_MODES.includes(mode);
export const isDrowingLine = (mode) => LINE_MODES.includes(mode);
export const isDrawingShape = (mode) => SHAPE_MODES.includes(mode);

const DEFAULT = { COLOR: "#ff0000", SIZE: 4, OPACITY: 1 };

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
};
