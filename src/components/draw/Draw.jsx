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
  ERASE: "erase",
  UNDO: "undo",
  SAVE: "save",
  INIT: "init",
};

// Draw exercise
export const Draw = () => {
  const canvas = useRef(null);
  const history = useRef([]);
  const drawingParams = {
    color: DEFAULT_COLOR,
    width: DEFAULT_SIZE,
    opacity: DEFAULT_OPACITY,
    mode: DRAWING_MODES.INIT,
  };

  const getDrowingParams = () => {
    return drawingParams;
  };

  const setDrowingParams = ({ color, width, opacity, mode }) => {
    if (color !== null && color !== undefined) {
      drawingParams.color = color;
    }
    if (width !== null && width !== undefined) {
      drawingParams.width = width;
    }
    if (opacity !== null && opacity !== undefined) {
      drawingParams.opacity = opacity / 100;
    }
    if (mode !== null && mode !== undefined) {
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
            ctx.putImageData(lastState, 0, 0);
          }

          // console.log("Undo...", history.current.length);
          break;
        case DRAWING_MODES.ERASE:
          canvas.current
            .getContext("2d")
            .clearRect(0, 0, canvas.current.width, canvas.current.height);
          history.current = [];
          drawingParams.mode = DRAWING_MODES.INIT;
          break;
        case DRAWING_MODES.SAVE:
          if (canvas.current) {
            const dataURL = canvas.current.toDataURL();
            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "my-drawing.png";
            link.click();
          }
          break;
        default:
          drawingParams.mode = mode;
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <DrawCanvas
        canvas={canvas}
        history={history}
        getParams={getDrowingParams}
      />
      <DrawControl
        setParams={setDrowingParams}
        color={drawingParams.color}
        width={drawingParams.width}
        opacity={drawingParams.opacity * 100}
        defaultMode={DRAWING_MODES.DRAW}
      />
    </div>
  );
};
