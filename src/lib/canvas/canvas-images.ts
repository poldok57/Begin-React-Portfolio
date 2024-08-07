/**
 * Fonctions ton manipulate images in a canvas
 */
import { Area, Size } from "./types";

/**
 * Function to copy the selected zone in a virtual canvas
 * @param {object} area - {x, y, width, height} of the selected zone
 * @return {object} canvas - new canvas with the selected zone
 */
export const copyInVirtualCanvas = (
  context: CanvasRenderingContext2D,
  area: Area
): HTMLCanvasElement => {
  const imageData = context.getImageData(
    area.x,
    area.y,
    area.width,
    area.height
  );
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  const ctx = canvas.getContext("2d");
  if (ctx && imageData) {
    ctx.putImageData(imageData, 0, 0);
  }
  return canvas;
};

/**
 * Calculate the optimal size of picture in the canvas
 * @param {object} imageSize - {width, height} of the image
 * @param {object} maxSize - {width, height} of the canvas
 */
export const calculateSize = (
  imageSize: Area | Size,
  maxSize: Area | Size
): Area => {
  const ratio = imageSize.width / imageSize.height;
  const maxWidth: number = maxSize.width,
    maxHeight: number = maxSize.height;
  const maxRatio = maxWidth / maxHeight;

  let width = imageSize.width;
  let height = imageSize.height;

  if (width < maxWidth && height < maxHeight) {
    return { x: 10, y: 10, width, height } as Area;
  }
  if (ratio > maxRatio) {
    width = maxWidth;
    height = width / ratio;
  } else {
    height = maxHeight;
    width = height * ratio;
  }
  return { x: 10, y: 10, width, height } as Area;
};
