import { Coordinate } from "./types";

export const getMouseCoordinates: (
  event: MouseEvent | Coordinate,
  canvas: HTMLCanvasElement | null
) => Coordinate | null = (event, canvas) => {
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();

  // conversion with mouse event
  if ("clientX" in event) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    } as Coordinate;
  }
  // conversion with coordinate
  return { x: event.x - rect.left, y: event.y - rect.top } as Coordinate;
};

export const getCoordinatesInCanvas: (
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
) => Coordinate = (event, canvas) => {
  const rect = canvas.getBoundingClientRect();

  // conversion with touch event
  if (event instanceof TouchEvent) {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      } as Coordinate;
    } else {
      return { x: 0, y: 0 } as Coordinate;
    }
  }
  // conversion with mouse event
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  } as Coordinate;
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
