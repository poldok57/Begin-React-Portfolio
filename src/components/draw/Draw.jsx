import { useRef } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControlWP } from "./DrawControl";
import { HistoryProvider } from "./DrawHistory";
import { SHAPE_TYPE } from "../../lib/canvas-elements";

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
export const ALL_DRAWING_MODES = [
  DRAWING_MODES.DRAW,
  DRAWING_MODES.ERASE,
  DRAWING_MODES.LINE,
  DRAWING_MODES.ARC,
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.TEXT,
];

const DEFAULT_COLOR = "#ff0000";
const DEFAULT_SIZE = 4;
const DEFAULT_OPACITY = 1;
const MAX_HISTORY = 20;

export const Draw = () => {
  const canvas = useRef(null);
  const startCoordinate = useRef(null);

  let drawingParamsRef = useRef({
    mode: DRAWING_MODES.INIT,
    fixed: false,
    general: {
      color: DEFAULT_COLOR,
      lineWidth: DEFAULT_SIZE,
      opacity: DEFAULT_OPACITY,
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
    },
    border: {
      color: "#a0a0a0",
      lineWidth: 1,
      opacity: 1,
      interval: 0,
    },
  });

  const getDrowingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };

    if (drawingParamsRef.current.opacity > 1)
      drawingParamsRef.current.opacity /= 100;
  };
  const changeMode = (mode, option = null) => {
    switch (mode) {
      case DRAWING_MODES.UNDO:
        break;
      case DRAWING_MODES.RESET:
        canvas.current
          .getContext("2d")
          .clearRect(0, 0, canvas.current.width, canvas.current.height);
        startCoordinate.current = null;
        drawingParamsRef.current.mode = DRAWING_MODES.INIT;
        break;
      case DRAWING_MODES.SAVE:
        if (canvas.current) {
          if (option == null) {
            option = "my-drawing";
          }
          const dataURL = canvas.current.toDataURL();
          const link = document.createElement("a");
          link.href = dataURL;
          link.download = option + ".png";
          link.click();
        }
        break;
      default:
        drawingParamsRef.current.mode = mode;
    }
  };

  return (
    <HistoryProvider maxLen={MAX_HISTORY}>
      <div className="relative block gap-8">
        <DrawCanvas
          canvas={canvas}
          startCoordinate={startCoordinate}
          getParams={getDrowingParams}
        />
        <DrawControlWP
          trace={false}
          style={{
            top: "30px",
            position: "relative",
            marginTop: 10,
          }}
          titleBar="true"
          title="Drawing Control"
          titleHidden="false"
          locked={true}
          close="false"
          setParams={setDrawingParams}
          changeMode={changeMode}
          drawingParams={drawingParamsRef.current}
        />
      </div>
    </HistoryProvider>
  );
};
