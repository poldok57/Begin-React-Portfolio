import React from "react";
import { useCanvas } from "./hooks/useCanvas";
import { useDrawingContext } from "@/context/DrawingContext";
import { withMousePosition } from "../windows/withMousePosition";
import { DrawList } from "./DrawList";
import { useDesignStore } from "@/lib/stores/design";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";

interface CanvasProps {
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement>;
  canvasMouseRef: React.RefObject<HTMLCanvasElement>;
  background: string;
}

const DrawListWP = withMousePosition(DrawList);

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  canvasRef,
  canvasTemporyRef,
  canvasMouseRef,
  background,
}) => {
  const { drawingParams, setDrawingParams, getDrawingParams } =
    useDrawingContext();
  const { scale, setScale, setSelectedDesignElement, refreshCanvas } =
    useDesignStore();

  const setMode = (mode: string) => {
    setDrawingParams({ mode });
  };
  const changeScale = (scale: number) => {
    setScale(scale);
    if (canvasRef.current) {
      setSelectedDesignElement(null);
      // Clear the temporary canvas
      if (canvasTemporyRef.current) {
        const temporyCtx = canvasTemporyRef.current.getContext("2d");
        if (temporyCtx) {
          clearCanvasByCtx(temporyCtx);
        }
      }

      // Clear the mouse canvas
      if (canvasMouseRef.current) {
        const mouseCtx = canvasMouseRef.current.getContext("2d");
        if (mouseCtx) {
          clearCanvasByCtx(mouseCtx);
        }
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          refreshCanvas(ctx, false);
        }
      }
    }
  };

  useCanvas({
    canvasRef,
    canvasTemporyRef,
    canvasMouseRef,
    mode: drawingParams.mode,
    setMode,
    getParams: getDrawingParams,
  });
  return (
    <>
      <div className="flex flex-row gap-1">
        {/* Scale Control */}
        <div className="flex flex-col gap-1 items-center p-2 w-40 h-16 rounded-lg border border-gray-400 shadow-md origin-left -rotate-90 translate-y-36">
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
        <div
          style={{
            position: "relative",
            height: height + 5,
            width: width + 5,
            backgroundColor: background,
          }}
          className="border-2 border-blue-300 -translate-x-32 border-spacing-2"
        >
          <canvas
            width={width}
            height={height}
            ref={canvasRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
            }}
            className="m-auto rounded-md shadow-md border-spacing-3"
          />
          <canvas
            width={width}
            height={height}
            ref={canvasMouseRef as React.RefObject<HTMLCanvasElement>}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 1,
            }}
            className="m-auto transparent"
          />
          <canvas
            width={width}
            height={height}
            ref={canvasTemporyRef as React.RefObject<HTMLCanvasElement>}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              zIndex: 2,
            }}
            className="m-auto transparent"
          />
        </div>
      </div>
      <DrawListWP
        canvasRef={canvasRef}
        temporyCanvasRef={canvasTemporyRef}
        withMinimize={true}
        style={{
          top: "120px",
          right: "40px",
          position: "fixed",
          zIndex: 5,
        }}
        withTitleBar={true}
        titleText="Design elements"
        titleHidden={false}
        draggable={false}
      />
    </>
  );
};
