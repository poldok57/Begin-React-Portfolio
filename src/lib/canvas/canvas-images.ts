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
  canvas: HTMLCanvasElement,
  area: Area
): HTMLCanvasElement => {
  // Create a new canvas with the selected dimensions
  const newCanvas = document.createElement("canvas");
  newCanvas.width = area.width;
  newCanvas.height = area.height;

  const ctx = newCanvas.getContext("2d", { willReadFrequently: true });
  if (ctx) {
    // Draw the selected area directly from the source canvas
    ctx.drawImage(
      canvas, // Source canvas
      area.x,
      area.y, // Source coordinates
      area.width,
      area.height, // Source dimensions
      0,
      0, // Destination coordinates
      area.width,
      area.height // Destination dimensions
    );
  }
  return newCanvas;
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

  let width = Math.round(imageSize.width);
  let height = Math.round(imageSize.height);

  if (width < maxWidth && height < maxHeight) {
    return { x: 10, y: 10, width, height } as Area;
  }
  if (ratio > maxRatio) {
    width = maxWidth;
    height = Math.round(width / ratio);
  } else {
    height = maxHeight;
    width = Math.round(height * ratio);
  }
  return { x: 10, y: 10, width, height } as Area;
};

export const compressImage = (canvasImage: HTMLCanvasElement) => {
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");

  tempCanvas.width = canvasImage.width / 2;
  tempCanvas.height = canvasImage.height / 2;

  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvasImage, 0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL("image/png");
  }
  return null;
};
