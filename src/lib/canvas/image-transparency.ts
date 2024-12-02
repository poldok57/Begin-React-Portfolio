export const makeWhiteTransparent = (
  canvas: HTMLCanvasElement,
  clarityLevel: number
): HTMLCanvasElement => {
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

  let imageData: ImageData;

  if (clarityLevel === 0 || clarityLevel > 255)
    imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  else if (clarityLevel < 100)
    imageData = transparencyWhiteLevel(ctx, clarityLevel);
  else imageData = transparencyGrayLevel(ctx, clarityLevel);

  // new destination canvas
  const canvasDest = document.createElement("canvas");
  const ctxDest = canvasDest.getContext("2d")!;
  canvasDest.width = ctx.canvas.width;
  canvasDest.height = ctx.canvas.height;
  ctxDest.putImageData(imageData, 0, 0);

  return canvasDest;
};

const transparencyWhiteLevel = (
  ctx: CanvasRenderingContext2D,
  clarityLevel: number
): ImageData => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  const data = imageData.data;
  const maxWhite = 255 - clarityLevel;
  const maxTotal = 3.2 * maxWhite;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if the pixel is white (RGB value of 255, 255, 255)
    if (
      (r >= maxWhite && g >= maxWhite && b >= maxWhite) ||
      (r + g + b >= maxTotal && Math.max(r, g, b) - Math.min(r, g, b) < 10)
    ) {
      // Set the alpha channel to 0 (transparent)
      data[i + 3] = 0;
    }
  }

  return imageData;
};

export const transparencyGrayLevel = (
  ctx: CanvasRenderingContext2D,
  clarityLevel: number
): ImageData => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  clarityLevel = 255 - clarityLevel;
  // First pass: Remove the light points
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Convert the color to gray level
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

    // Remove the light points close to gray
    if (gray > clarityLevel) {
      data[i + 3] = 0; // Make transparent
    }
  }

  return imageData;
};
