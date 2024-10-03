import React from "react";

interface CanvasProps {
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement>;
}

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  canvasRef,
  canvasTemporyRef,
}) => {
  return (
    <div
      style={{
        position: "relative",
        height: height + 5,
        width: width + 5,
      }}
      className="border-2 border-blue-300 border-spacing-2"
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
        className="m-auto bg-white rounded-md shadow-md border-spacing-3"
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
  );
};