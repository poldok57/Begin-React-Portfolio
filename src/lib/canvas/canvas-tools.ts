import { Coordinate } from "./types";

export const getMouseCoordinates: (
  event: MouseEvent,
  canvas: HTMLCanvasElement | null
) => Coordinate | null = (event, canvas) => {
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();

  const coord: Coordinate = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
  return coord;
};

/**
 * Function to clear the contect canvas
 * @param {HTMLCanvasElement} canvas
 */
export const clearCanvasByCtx = (
  context: CanvasRenderingContext2D | null
): void => {
  if (!context) return;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
};
/**
 * Function to clear the canvas
 * @param {HTMLCanvasElement} canvas
 */
export const clearCanvas = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("2d");
  clearCanvasByCtx(context);
};
