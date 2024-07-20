import React, { Component, useRef } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControlWP } from "./DrawControl";
import { DEFAULT_PARAMS, isDrawingMode } from "../../lib/canvas/canvas-defines";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";

const MAX_HISTORY = 40;

export const Draw = () => {
  const canvasRef = useRef(null);

  let drawingParamsRef = useRef(DEFAULT_PARAMS);

  setHistoryMaxLen(MAX_HISTORY);

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };
  };

  const changeMode = (mode) => {
    if (isDrawingMode(mode)) {
      drawingParamsRef.current.mode = mode;
    } else {
      console.error(`${Component.name} Invalid mode: `, mode);
    }
  };

  return (
    <div className="relative block gap-8">
      <DrawCanvas canvasRef={canvasRef} getParams={getDrawingParams} />
      <DrawControlWP
        trace={false}
        style={{
          top: "30px",
          position: "relative",
          marginTop: 10,
        }}
        titleBar={true}
        title="Drawing Control"
        titleHidden={false}
        locked={true}
        close={false}
        setParams={setDrawingParams}
        changeMode={changeMode}
        drawingParams={drawingParamsRef.current}
      />
    </div>
  );
};
