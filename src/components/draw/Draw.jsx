import { useRef } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControlWP } from "./DrawControl";
import { DRAWING_MODES, DEFAULT_PARAMS } from "../../lib/canvas/canvas-defines";
// import { saveCanvas } from "../../lib/canvas/canvas-size";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";

const MAX_HISTORY = 40;

export const Draw = () => {
  const canvas = useRef(null);

  let drawingParamsRef = useRef(DEFAULT_PARAMS);

  setHistoryMaxLen(MAX_HISTORY);

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };
  };

  const changeMode = (mode) => {
    switch (mode) {
      case DRAWING_MODES.UNDO:
      case DRAWING_MODES.SAVE:
        break;
      default:
        drawingParamsRef.current.mode = mode;
    }
  };

  return (
    <div className="relative block gap-8">
      <DrawCanvas canvas={canvas} getParams={getDrawingParams} />
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
