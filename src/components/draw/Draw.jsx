import { useRef } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControlWP } from "./DrawControl";
import { DRAWING_MODES, DEFAULT_PARAMS } from "../../lib/canvas/canvas-defines";
import { saveCanvas } from "../../lib/canvas/canvas-size";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";

const MAX_HISTORY = 40;

export const Draw = () => {
  const canvas = useRef(null);
  const startCoordinate = useRef(null);

  let drawingParamsRef = useRef(DEFAULT_PARAMS);

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
        drawingParamsRef.current.rotation = 0;

        break;
      case DRAWING_MODES.SAVE:
        if (canvas.current) {
          if (option == null) {
            option = "my-drawing";
          }
          let area = null;
          if (drawingParamsRef.current.mode === DRAWING_MODES.SELECT) {
            area = drawingParamsRef.current.selectedArea;
          }
          console.log("saveCanvas", area);
          saveCanvas(canvas.current, option, area);
        }
        break;
      default:
        drawingParamsRef.current.mode = mode;
    }
  };
  setHistoryMaxLen(MAX_HISTORY);
  return (
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
  );
};
