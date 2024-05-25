import { Coordinate } from "../types";

export const getCoordinates: (
  event: MouseEvent,
  canvas: HTMLCanvasElement | null
) => Coordinate | null = (event, canvas) => {
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();

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

export const makeWhiteTransparent = (
  canvas: HTMLCanvasElement | null,
  canvasDest: HTMLCanvasElement | null,
  delta: number
): void => {
  if (canvas === null) return;
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const maxWhite = 255 - delta;
  const maxTotal = 3 * maxWhite;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Check if the pixel is white (RGB value of 255, 255, 255)
    if (
      (r >= maxWhite && g >= maxWhite && b >= maxWhite) ||
      r + g + b >= maxTotal
    ) {
      // Set the alpha channel to 0 (transparent)
      data[i + 3] = 0;
    }
  }
  if (canvasDest === null) {
    // Put the modified image data back to the canvas
    ctx.putImageData(imageData, 0, 0);
    return;
  }
  // Create a new canvas to put the modified image data
  canvasDest.width = canvas.width;
  canvasDest.height = canvas.height;
  const ctxDest: CanvasRenderingContext2D = canvasDest.getContext("2d")!;
  ctxDest.putImageData(imageData, 0, 0);
};
