import React, { useRef, useState } from "react";
import { withMousePosition } from "../windows/withMousePosition";
import { DrawControl } from "./DrawControl";
import { ShowAlertMessagesWP } from "@/components/alert-messages/ShowAlertMessages";
import { Canvas } from "./Canvas";
import { DEFAULT_PARAMS, GroupParams } from "../../lib/canvas/canvas-defines";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";
import { useCanvas } from "./hooks/useCanvas";
import { DrawList } from "./DrawList";

const DrawControlWP = withMousePosition(DrawControl);
const DrawListWP = withMousePosition(DrawList);

const MAX_HISTORY = 40;
const [WIDTH, HEIGHT] = [768, 432]; // 16:9 aspact ratio

export const Draw = () => {
  const canvasRef = useRef(null);
  const canvasTemporyRef = useRef(null);

  const drawingParamsRef = useRef(DEFAULT_PARAMS);
  const [mode, setMode] = useState(drawingParamsRef.current.mode);
  const [background, setBackground] = useState("#f0f0f0f0");
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
      <div className="flex flex-row justify-center items-center">
        <Canvas
          width={WIDTH}
          height={HEIGHT}
          canvasRef={canvasRef}
          canvasTemporyRef={canvasTemporyRef}
          background={background}
        />
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col items-center">
            <label
              htmlFor="background-range"
              className="mb-2 text-sm text-gray-500"
            >
              Background
            </label>
            <input
              id="background-range"
              type="range"
              min="0"
              max="255"
              defaultValue={parseInt(background.slice(1), 16)}
              onChange={(e) => {
                const grayValue = e.target.value;
                const hexValue = `#${parseInt(grayValue)
                  .toString(16)
                  .padStart(2, "0")
                  .repeat(3)}`;
                setBackground(hexValue);
              }}
              className="w-32 h-64 -rotate-90"
            />
          </div>
        </div>
      </div>
      <DrawListWP
        canvasRef={canvasRef}
        canvasTemporyRef={canvasTemporyRef}
        withMinimize={true}
        style={{
          top: "40px",
          right: "40px",
          position: "absolute",
          zIndex: 5,
        }}
        withTitleBar={true}
        titleText="Design elements"
        titleHidden={false}
        draggable={false}
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
