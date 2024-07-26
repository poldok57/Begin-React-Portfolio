import { Area } from "./types";

const getAlphaLines = (canvas: HTMLCanvasElement): Uint8ClampedArray[] => {
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const lines: Uint8ClampedArray[] = [];

  for (let y = 0; y < canvas.height; y++) {
    const lineData = new Uint8ClampedArray(canvas.width);
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      lineData[x] = data[index + 3];
    }
    lines.push(lineData);
  }

  return lines;
};

export const imageSize = (canvas: HTMLCanvasElement | null): Area | null => {
  if (canvas === null) return null;
  const { width, height } = canvas.getBoundingClientRect();
  const lines = getAlphaLines(canvas);

  let top: number | null = null;
  let bottom: number | null = null;
  let left: number | null = null;
  let right: number | null = null;

  for (let y = 0; y < height; y++) {
    if (lines[y].some((alpha) => alpha > 0)) {
      top = y;
      break;
    }
  }

  for (let y = height - 1; y >= top!; y--) {
    if (lines[y].some((alpha) => alpha > 0)) {
      bottom = y;
      break;
    }
  }

  for (let x = 0; x < width; x++) {
    if (lines.some((line) => line[x] > 0)) {
      left = x;
      break;
    }
  }

  for (let x = width - 1; x >= left!; x--) {
    if (lines.some((line) => line[x] > 0)) {
      right = x;
      break;
    }
  }

  if (top !== null && bottom !== null && left !== null && right !== null) {
    const usedWidth = right - left + 1;
    const usedHeight = bottom - top + 1;
    return {
      width: usedWidth,
      height: usedHeight,
      x: left,
      y: top,
    };
  } else {
    return null;
  }
};

export const cutOutArea = (
  canvas: HTMLCanvasElement,
  area: Area
): HTMLCanvasElement => {
  const { x, y, width, height } = area;
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d")!;
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return tempCanvas;
};
