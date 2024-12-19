"use client";
import { Area } from "./types";

export function getUsedArea(
  canvas: HTMLCanvasElement | null
): { x: number; y: number; width: number; height: number } | null {
  if (canvas === null) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let top = null;
  let bottom = null;
  let left = null;
  let right = null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha > 0) {
        if (top === null) top = y;
        bottom = y;
        if (left === null || x < left) left = x;
        if (right === null || x > right) right = x;
      }
    }
  }

  if (top !== null && bottom !== null && left !== null && right !== null) {
    return {
      x: left,
      y: top,
      width: right - left + 1,
      height: bottom - top + 1,
    };
  }

  return null;
}

/**
 * Function to cut out an area from a canvas
 * @param canvas HTMLCanvasElement
 * @param area Area
 * @returns HTMLCanvasElement
 */
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
