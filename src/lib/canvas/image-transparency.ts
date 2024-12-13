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

export interface CornerColors {
  topRight?: Uint8ClampedArray | null;
  topLeft?: Uint8ClampedArray | null;
  bottomRight?: Uint8ClampedArray | null;
  bottomLeft?: Uint8ClampedArray | null;
}

export const makeCornerTransparent = (
  canvas: HTMLCanvasElement,
  delta: number,
  colors: CornerColors
): HTMLCanvasElement => {
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const newCanvas = document.createElement("canvas");
  const ctxNew = newCanvas.getContext("2d")!;
  newCanvas.width = width;
  newCanvas.height = height;

  // Function to check if two colors are similar within a tolerance (delta)
  const isColorSimilar = (
    color1: Uint8ClampedArray,
    color2: Uint8ClampedArray
  ): boolean => {
    const rDiff = Math.abs(color1[0] - color2[0]);
    const gDiff = Math.abs(color1[1] - color2[1]);
    const bDiff = Math.abs(color1[2] - color2[2]);
    return rDiff <= delta && gDiff <= delta && bDiff <= delta;
  };

  // Function to make the corner transparent if the color is similar
  const makeCornerTransparentIfSimilar = (
    startX: number,
    startY: number,
    color: Uint8ClampedArray | null | undefined,
    directionX: 1 | -1,
    directionY: 1 | -1
  ) => {
    if (!color) return;

    for (let y = startY; y >= 0 && y < height; y += directionY) {
      for (let x = startX; x >= 0 && x < width; x += directionX) {
        const index = (y * width + x) * 4;
        const pixelColor = data.slice(index, index + 4);

        // Skip already transparent pixels
        if (pixelColor[3] === 0) continue;

        if (isColorSimilar(pixelColor, color)) {
          data[index + 3] = 0; // Make transparent
        } else {
          // Stop if the color is not similar
          break;
        }
      }
    }
  };

  // Apply transparency to each corner
  makeCornerTransparentIfSimilar(0, 0, colors.topLeft, 1, 1);
  makeCornerTransparentIfSimilar(width - 1, 0, colors.topRight, -1, 1);
  makeCornerTransparentIfSimilar(0, height - 1, colors.bottomLeft, 1, -1);
  makeCornerTransparentIfSimilar(
    width - 1,
    height - 1,
    colors.bottomRight,
    -1,
    -1
  );

  // Put the modified image data into the new canvas
  ctxNew.putImageData(imageData, 0, 0);

  return newCanvas;
};
