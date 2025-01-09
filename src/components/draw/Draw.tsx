import React, { useRef, useState, useEffect } from "react";
import { withMousePosition } from "../windows/withMousePosition";
import { DrawControl } from "./DrawControl";
import { ShowAlertMessagesWP } from "@/components/alert-messages/ShowAlertMessages";
import { Canvas } from "./Canvas";
import { DEFAULT_PARAMS, GroupParams } from "../../lib/canvas/canvas-defines";
import { setHistoryMaxLen } from "../../lib/canvas/canvas-history";
import { clearCanvas } from "@/lib/canvas/canvas-tools";

import { useCanvas } from "./hooks/useCanvas";
import { adjustBrightness } from "../../lib/utils/colors";
import { DrawList } from "./DrawList";
import { ColorResult, SliderPicker } from "react-color";
import { X } from "lucide-react";
import { useDesignStore } from "@/lib/stores/design";

const DrawControlWP = withMousePosition(DrawControl);
const DrawListWP = withMousePosition(DrawList);

const MAX_HISTORY = 40;
const MIN_SIZE = 200;
const MAX_SIZE = 1200;
const DEFAULT_WIDTH = 768;
const DEFAULT_HEIGHT = 432;

export const Draw = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTemporyRef = useRef<HTMLCanvasElement>(null);
  const canvasMouseRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  const drawingParamsRef = useRef(DEFAULT_PARAMS);
  const [mode, setMode] = useState(drawingParamsRef.current.mode);
  const [background, setBackground] = useState("#f0f0f0");
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_HEIGHT);
  const [baseColor, setBaseColor] = useState("#0000bb");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [intensity, setIntensity] = useState(100);

  const { scale, setScale, setSelectedDesignElement, refreshCanvas } =
    useDesignStore();
  setHistoryMaxLen(MAX_HISTORY);

  const getDrawingParams = () => {
    return drawingParamsRef.current;
  };

  const setDrawingParams = (props: GroupParams) => {
    // console.log("setDrawingParams", props);
    drawingParamsRef.current = { ...drawingParamsRef.current, ...props };
  };

  const changeScale = (scale: number) => {
    setScale(scale);
    if (canvasRef.current) {
      setSelectedDesignElement(null);
      // Clear the temporary canvas
      if (canvasTemporyRef.current) {
        clearCanvas(canvasTemporyRef.current);
      }

      // Clear the mouse canvas
      if (canvasMouseRef.current) {
        clearCanvas(canvasMouseRef.current);
      }
      refreshCanvas(canvasRef.current, false);
    }
  };

  useCanvas({
    canvasRef,
    canvasTemporyRef,
    canvasMouseRef,
    mode,
    setMode,
    getParams: getDrawingParams,
  });

  const handleIntensityChange = (newIntensity: number) => {
    setIntensity(newIntensity);
    setBackground(adjustBrightness(baseColor, newIntensity));
  };

  const handleColorChange = (color: ColorResult) => {
    const newColor = color.hex;
    setBaseColor(newColor);
    setBackground(adjustBrightness(newColor, intensity));
  };

  const updateCanvasPosition = () => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setCanvasPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  useEffect(() => {
    updateCanvasPosition();

    const handleResize = () => {
      updateCanvasPosition();
    };

    const handleScroll = () => {
      updateCanvasPosition();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [canvasWidth, canvasHeight]);

  return (
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
        >
          {/* Scale Control */}
          <div className="flex flex-col gap-1 items-center p-2 rounded-lg border border-gray-400 shadow-md origin-left -rotate-90 translate-x-36 translate-y-12">
            <div className="flex gap-2 items-center">
              <label htmlFor="scale-range" className="text-sm text-gray-500">
                Scale
              </label>
              <span className="text-xs text-gray-500">{scale}</span>
            </div>
            <input
              id="scale-range"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => changeScale(parseFloat(e.target.value))}
              className="w-36"
            />
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={canvasContainerRef}
          className="flex relative flex-col items-center"
        >
          <Canvas
            width={canvasWidth}
            height={canvasHeight}
            canvasRef={canvasRef}
            canvasTemporyRef={canvasTemporyRef}
            canvasMouseRef={canvasMouseRef}
            background={background}
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
          className="flex absolute flex-col gap-1 justify-between items-start"
          style={{
            left: `${canvasWidth + 30}px`,
            top: 0,
            height: `${Math.max(canvasHeight, 350)}px`,
            paddingTop: "100px",
            paddingBottom: "20px",
          }}
        >
          {/* Height Control */}
          <div className="flex flex-col gap-1 items-center origin-left -rotate-90 translate-y-8">
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

          {/* Background Control */}
          <div className="flex flex-col gap-1 items-center origin-left -rotate-90 translate-y-8">
            <div className="flex gap-2 items-center">
              <label
                htmlFor="background-range"
                className="text-sm text-gray-500"
              >
                Background
              </label>
              <div className="rotate-90">
                <div
                  className="w-6 h-6 border border-gray-300 cursor-pointer hover:border-gray-500"
                  style={{ backgroundColor: background }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                />
              </div>
            </div>
            <input
              id="background-range"
              type="range"
              min="0"
              max="200"
              value={intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      <DrawListWP
        canvasRef={canvasRef}
        canvasTemporyRef={canvasTemporyRef}
        setMode={setMode}
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

      {showColorPicker && (
        <div
          className="fixed z-10 p-4 rounded-lg shadow-xl bg-base-100"
          style={{
            left: `${canvasPosition.x + canvasWidth - 200}px`,
            top: `${canvasPosition.y + (canvasHeight * 3) / 4}px`,
            transform: "translateY(-50%)",
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold">Background Color</span>
              <button
                className="btn btn-sm btn-circle"
                onClick={() => setShowColorPicker(false)}
              >
                <X size={14} />
              </button>
            </div>
            <SliderPicker
              color={baseColor}
              onChange={handleColorChange}
              className="w-36"
            />
          </div>
        </div>
      )}
    </div>
  );
};
