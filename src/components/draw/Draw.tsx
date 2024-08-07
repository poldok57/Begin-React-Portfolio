import React, { Component, useRef } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControlWP } from "./DrawControl";
import {
  DEFAULT_PARAMS,
  isDrawingMode,
  GroupParams,
} from "../../lib/canvas/canvas-defines";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";

const MAX_HISTORY = 40;

export const Draw = () => {
  const canvasRef = useRef(null);

  const drawingParamsRef = useRef(DEFAULT_PARAMS);

  setHistoryMaxLen(MAX_HISTORY);

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props: GroupParams) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };
  };

  const changeMode = (mode: string) => {
    if (isDrawingMode(mode)) {
      drawingParamsRef.current.mode = mode;
    } else {
      console.error(`${Component.name} Invalid mode: `, mode);
    }
  };

  return (
    <div className="block relative gap-8">
      <DrawCanvas canvasRef={canvasRef} getParams={getDrawingParams} />
      <DrawControlWP
        trace={false}
        style={{
          top: "40px",
          position: "relative",
          zIndex: 5,
        }}
        titleBar={true}
        title="Drawing Control"
        titleHidden={false}
        draggable={false}
        resizable={true}
        close={false}
        setParams={setDrawingParams}
        changeMode={changeMode}
        drawingParams={drawingParamsRef.current}
      />
    </div>
  );
};
