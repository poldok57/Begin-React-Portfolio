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
  canvas: HTMLCanvasElement,
  scale?: number
) => Coordinate = (event, canvas, scale = 1) => {
  const rect = canvas.getBoundingClientRect();

  // conversion with touch event
  if (event instanceof TouchEvent) {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      // console.log("touchEvent scale=", scale);
      return {
        x: (touch.clientX - rect.left) / scale,
        y: (touch.clientY - rect.top) / scale,
      } as Coordinate;
    }
    return { x: 0, y: 0 } as Coordinate;
  }
  // conversion with mouse event
  return {
    x: (event.clientX - rect.left) / scale,
    y: (event.clientY - rect.top) / scale,
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
 * Function to clear the canvas by resizing the canvas
 * @param {HTMLCanvasElement} canvas
 */
export const clearCanvas = (canvas: HTMLCanvasElement): void => {
  clearCanvasByCtx(canvas.getContext("2d"));
};

export const duplicateCanvas = (
  canvas: HTMLCanvasElement,
  withMouseEvents: boolean = false
): HTMLCanvasElement => {
  const container = canvas.parentElement ?? document.body;

  // Get main canvas z-index
  const mainCanvasZIndex = window.getComputedStyle(canvas).zIndex;

  // Create duplicate canvas
  const newCanvas = document.createElement("canvas");
  newCanvas.width = canvas.width;
  newCanvas.height = canvas.height;

  newCanvas.style.position = "absolute";
  newCanvas.style.left = "0";
  newCanvas.style.top = "0";
  newCanvas.style.zIndex = mainCanvasZIndex;
  newCanvas.className = "m-auto transparent";
  newCanvas.style.pointerEvents = withMouseEvents ? "auto" : "none";
  container?.appendChild(newCanvas);
  return newCanvas;
};
