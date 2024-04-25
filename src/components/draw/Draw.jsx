import { useRef } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControl } from "./DrawControl";

const DEFAULT_COLOR = "#ff0000";
const DEFAULT_SIZE = 4;
const DEFAULT_OPACITY = 1;

export const DRAWING_MODES = {
  DRAW: "draw",
  LINE: "line",
  SQUARE: "square",
  CIRCLE: "circle",
  TEXT: "text",
  ERASE: "erase",
  UNDO: "undo",
  SAVE: "save",
  INIT: "init",
  DRAWING_CHANGE: "drawingChange",
};
export const ALL_DRAWING_MODES = [
  DRAWING_MODES.DRAW,
  DRAWING_MODES.LINE,
  DRAWING_MODES.SQUARE,
  DRAWING_MODES.CIRCLE,
  DRAWING_MODES.TEXT,
];

export const Draw = () => {
  const canvas = useRef(null);
  const history = useRef([]);
  const startCoordinate = useRef(null);
  let drawingParamsRef = useRef({
    mode: DRAWING_MODES.INIT,
    fixed: false,
    color: DEFAULT_COLOR,
    lineWidth: DEFAULT_SIZE,
    opacity: DEFAULT_OPACITY,
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
      width: 1,
      interval: 1,
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
        if (!canvas.current) break;
        if (history.current.length > 0) {
          // Restore the last saved state
          // const lastState = history.current.pop();
          let lastState = history.current.pop();
          if (history.current.length > 0) {
            lastState = history.current[history.current.length - 1];
          }
          const ctx = canvas.current.getContext("2d");
          ctx.putImageData(lastState.image, 0, 0);
          startCoordinate.current = lastState.startCoordinate;
        }

        // console.log("Undo...", history.current.length);
        break;
      case DRAWING_MODES.ERASE:
        canvas.current
          .getContext("2d")
          .clearRect(0, 0, canvas.current.width, canvas.current.height);
        history.current = [];
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
    <div className="flex flex-col gap-8">
      <DrawCanvas
        canvas={canvas}
        history={history}
        startCoordinate={startCoordinate}
        getParams={getDrowingParams}
      />
      <DrawControl
        setParams={setDrawingParams}
        changeMode={changeMode}
        drawingParams={drawingParamsRef.current}
      />
    </div>
  );
};
