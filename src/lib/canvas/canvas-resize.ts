/**
 * Part of the canvas module that contains the functions to resize the element on the canvas
 */
import { BORDER } from "../mouse-position";
import { resizeSquare } from "../square-position";
import { Coordinate, Area } from "./types";

const calculateRatio = (area: Area, ratio: number, mouseOnShape: string) => {
  const newArea: Area = { ...area };
  switch (mouseOnShape) {
    case BORDER.TOP:
    case BORDER.BOTTOM:
      newArea.width = area.height * ratio;
      break;
    default:
      newArea.height = area.width / ratio;
      break;
  }
  return newArea;
};

/**
 * Function to resize the element on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, rotation, type, text}
 * @param {object} coordinate - {Coordinate}
 * @param {string} mouseOnShape - border or button where the mouse is
 */
export const resizingElement = (
  ctx: CanvasRenderingContext2D,
  size: Area,
  coordinate: Coordinate,
  lockRatio: boolean,
  mouseOnShape: string | null,
  rotation: number = 0
) => {
  if (lockRatio && !size.ratio) {
    size.ratio = Number((size.width / size.height).toFixed(3));
  }
  if (!lockRatio) size.ratio = undefined;

  if (mouseOnShape) {
    let { newArea } = resizeSquare(coordinate, size, mouseOnShape, rotation);
    if (lockRatio && size.ratio) {
      newArea = calculateRatio(newArea, size.ratio, mouseOnShape);
    }

    return newArea;
  }
  return null;
};
