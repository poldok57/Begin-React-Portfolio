import { useEffect, useRef } from "react";

// Draw exercise
export const DrawCanvas = ({ canvas }) => {
  const isDrawing = useRef(false);
  const lastCoordinate = useRef(null);

  const startDrawing = (event) => {
    isDrawing.current = true;
    lastCoordinate.current = [event.clientX, event.clientY];
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastCoordinate.current = null;
  };

  const draw = (event) => {
    if (isDrawing.current) {
      const canvasElement = canvas.current;
      const context = canvasElement.getContext("2d");
      const [x, y] = [event.clientX, event.clientY];
      const [lastX, lastY] = lastCoordinate.current;
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.stroke();
      lastCoordinate.current = [x, y];
    }
  };

  useEffect(() => {
    const canvasElement = canvas.current;
    const context = canvasElement.getContext("2d");

    canvasElement.addEventListener("mousedown", startDrawing);
    canvasElement.addEventListener("mousemove", draw);
    canvasElement.addEventListener("mouseup", stopDrawing);

    return () => {
      canvasElement.removeEventListener("mousedown", startDrawing);
      canvasElement.removeEventListener("mousemove", draw);
      canvasElement.removeEventListener("mouseup", stopDrawing);
    };
  }, [canvas, draw]);

  return (
    <canvas
      onMouseDown={startDrawing}
      onMouseMove={draw}
      width={560}
      height={315}
      ref={canvas}
      className="m-auto rounded-md bg-white shadow-md"
    />
  );
};
