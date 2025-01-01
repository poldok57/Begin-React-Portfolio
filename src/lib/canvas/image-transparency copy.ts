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
    if (Math.abs(color1[0] - color2[0]) > delta) return false;
    if (Math.abs(color1[1] - color2[1]) > delta) return false;
    if (Math.abs(color1[2] - color2[2]) > delta) return false;
    return true;
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
      // let found = false;
      for (let x = startX; x >= 0 && x < width; x += directionX) {
        const index = (y * width + x) * 4;
        const pixelColor = data.slice(index, index + 4);

        // Skip already transparent pixels
        if (pixelColor[3] === 0) continue;

        if (isColorSimilar(pixelColor, color)) {
          // found = true;
          data[index + 3] = 0; // Make transparent
          break;
        } else {
          // Stop if the color is not similar
          break;
        }
      }
      // Stop if the color is not found
      // if (!found) break;
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

export const getTopCornerColors = (canvas: HTMLCanvasElement) => {
  // get canvas context
  const ctx = canvas.getContext("2d");
  // Get the color of the top-left and top-right corners
  let topLeftColor = ctx?.getImageData(0, 0, 1, 1).data ?? null;
  let topRightColor = ctx?.getImageData(canvas.width - 1, 0, 1, 1).data ?? null;

  // Function to find the first non-transparent pixel diagonally
  const findFirstNonTransparentPixel = (
    startX: number,
    startY: number,
    direction: 1 | -1
  ) => {
    const middleX = canvas.width / 2;
    for (let i = 0; i < middleX; i++) {
      const color = ctx?.getImageData(
        startX + i * direction,
        startY + i,
        1,
        1
      ).data;
      if (color && color[3] !== 0) {
        // Check if the alpha channel is not transparent
        return color;
      }
    }
    return null;
  };

  if (topLeftColor && topLeftColor[3] === 0) {
    topLeftColor = findFirstNonTransparentPixel(0, 0, 1);
  }

  if (topRightColor && topRightColor[3] === 0) {
    topRightColor = findFirstNonTransparentPixel(canvas.width - 1, 0, -1);
  }

  // Function to check if the color is close to white or light gray
  const isLightColor = (color: Uint8ClampedArray | null) => {
    if (!color) return false;
    const r = color[0];
    const g = color[1];
    const b = color[2];

    // console.log("r:", r, "g:", g, "b:", b);

    if (r > 200 && g > 200 && b > 200) {
      return true;
    }
    const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
    const minValue = Math.min(r, g, b);
    if (minValue > 180 && maxDiff < 30) {
      return true;
    }
    if (minValue > 150 && maxDiff < 25) {
      return true;
    }
    if (minValue > 120 && maxDiff < 20) {
      return true;
    }
    return false;
  };

  if (isLightColor(topLeftColor) && isLightColor(topRightColor)) {
    return null;
  }
  return { topLeft: topLeftColor, topRight: topRightColor } as CornerColors;
};
