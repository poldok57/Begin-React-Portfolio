import React, { useRef, useState } from "react";
import { DrawCanvas } from "./DrawCanvas";
import { DrawControlWP } from "./DrawControl";
import { ShowAlertMessagesWP } from "@/components/alert-messages/ShowAlertMessages";
import {
  DEFAULT_PARAMS,
  // isDrawingMode,
  GroupParams,
} from "../../lib/canvas/canvas-defines";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";

const MAX_HISTORY = 40;

export const Draw = () => {
  const canvasRef = useRef(null);

  const drawingParamsRef = useRef(DEFAULT_PARAMS);
  const [mode, setMode] = useState(drawingParamsRef.current.mode);
  setHistoryMaxLen(MAX_HISTORY);

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props: GroupParams) => {
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };
  };

  // const changeMode = (mode: string) => {
  //   if (isDrawingMode(mode)) {
  //     drawingParamsRef.current.mode = mode;
  //   } else {
  //     console.error(`${Component.name} Invalid mode: `, mode);
  //   }
  // };

  return (
    <div className="flex relative flex-col gap-8 justify-center items-center py-5 w-full h-full">
      <DrawCanvas
        mode={mode}
        setMode={setMode}
        canvasRef={canvasRef}
        getParams={getDrawingParams}
      />
      <DrawControlWP
        mode={mode}
        setMode={setMode}
        trace={false}
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
        titleText="Game Message"
        style={{ position: "fixed", right: 20, bottom: 30 }}
      />
    </div>
  );
};
