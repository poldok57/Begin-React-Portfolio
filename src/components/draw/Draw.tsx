import React, { useRef, useState } from "react";
import { DrawControlWP } from "./DrawControl";
import { ShowAlertMessagesWP } from "@/components/alert-messages/ShowAlertMessages";
import { Canvas } from "./Canvas";
import { DEFAULT_PARAMS, GroupParams } from "../../lib/canvas/canvas-defines";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";
import { useCanvas } from "./hooks/useCanvas";

const MAX_HISTORY = 40;
const [WIDTH, HEIGHT] = [768, 432]; // 16:9 aspact ratio

export const Draw = () => {
  const canvasRef = useRef(null);
  const canvasTemporyRef = useRef(null);

  const drawingParamsRef = useRef(DEFAULT_PARAMS);
  const [mode, setMode] = useState(drawingParamsRef.current.mode);
  setHistoryMaxLen(MAX_HISTORY);

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props: GroupParams) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };
  };

  useCanvas({
    canvasRef,
    canvasTemporyRef,
    mode,
    setMode,
    getParams: getDrawingParams,
  });

  return (
    <div className="flex relative flex-col gap-8 justify-center items-center py-5 w-full h-full">
      <Canvas
        width={WIDTH}
        height={HEIGHT}
        canvasRef={canvasRef}
        canvasTemporyRef={canvasTemporyRef}
      />
      <DrawControlWP
        mode={mode}
        setMode={setMode}
        withMinimize={true}
        style={{
          top: "40px",
          position: "relative",
          zIndex: 5,
        }}
        withTitleBar={true}
        titleText="Drawing Control"
        titleHidden={false}
        minWidth={590}
        maxWidth={650}
        minHeight={315}
        draggable={false}
        resizable={true}
        close={false}
        setParams={setDrawingParams}
        drawingParams={drawingParamsRef.current}
      />
      <ShowAlertMessagesWP
        display={true}
        close={true}
        draggable={true}
        resizable={true}
        withTitleBar={true}
        titleHidden={true}
        withMinimize={true}
        titleBackground="pink"
        titleText="Drawing Messages"
        style={{ position: "fixed", right: 20, bottom: 30 }}
      />
    </div>
  );
};
