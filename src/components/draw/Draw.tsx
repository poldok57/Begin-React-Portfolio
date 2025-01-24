import React, { useState } from "react";
import { withMousePosition } from "../windows/withMousePosition";
import { DrawControl } from "./DrawControl";
import { ShowAlertMessagesWP } from "@/components/alert-messages/ShowAlertMessages";
import { Canvas } from "./Canvas";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";
import { DrawingProvider } from "@/context/DrawingContext";

const DrawControlWP = withMousePosition(DrawControl);

const MAX_HISTORY = 40;
const MIN_SIZE = 200;
const MAX_SIZE = 1200;
const DEFAULT_WIDTH = 768;
const DEFAULT_HEIGHT = 432;

const STORE_NAME = "design-data-storage";

export const Draw = () => {
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_HEIGHT);

  setHistoryMaxLen(MAX_HISTORY);

  return (
    <DrawingProvider>
      <div className="flex relative flex-col gap-8 justify-center items-center py-5 w-full h-full">
        <div className="flex relative flex-row justify-center items-center">
          {/* Left Side Controls */}
          <div
            className="flex absolute flex-col gap-1 justify-between items-start"
            style={{
              right: `${canvasWidth + 30}px`,
              top: 0,
              height: `${Math.max(canvasHeight, 350)}px`,
              paddingTop: "100px",
              paddingBottom: "20px",
            }}
          ></div>

          {/* Canvas Container */}
          <div className="flex relative flex-col items-center">
            <Canvas
              width={canvasWidth}
              height={canvasHeight}
              storeName={STORE_NAME}
            />

            {/* Width Control */}
            <div className="flex flex-col gap-1 items-center mt-4">
              <input
                id="width-range"
                type="range"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={canvasWidth}
                onChange={(e) => setCanvasWidth(parseInt(e.target.value))}
                className="w-[300px]"
              />
              <label htmlFor="width-range" className="text-sm text-gray-500">
                Width: {canvasWidth}px
              </label>
            </div>
          </div>

          {/* Right Side Controls */}
          <div
            className="flex absolute flex-col gap-1 items-start"
            style={{
              left: `${canvasWidth}px`,
              top: 0,
            }}
          >
            {/* Height Control */}
            <div className="flex flex-col gap-1 items-center origin-top-right -rotate-90 -translate-x-28">
              <div className="flex gap-2 items-center">
                <label htmlFor="height-range" className="text-sm text-gray-500">
                  Height
                </label>
                <span className="text-xs text-gray-500">{canvasHeight}px</span>
              </div>
              <input
                id="height-range"
                type="range"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={canvasHeight}
                onChange={(e) => setCanvasHeight(parseInt(e.target.value))}
                className="w-36"
              />
            </div>
          </div>
        </div>

        <DrawControlWP
          storeName={STORE_NAME}
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
    </DrawingProvider>
  );
};
