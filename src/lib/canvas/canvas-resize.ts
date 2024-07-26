/**
 * Part of the canvas module that contains the functions to resize the element on the canvas
 */
import { BORDER } from "../mouse-position";
import { resizeSquare } from "../square-position";
import { Coordinate, Area } from "./types";
import { ShapeDefinition } from "./canvas-defines";
import { showElement } from "./canvas-elements";

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
  square: ShapeDefinition,
  coordinate: Coordinate,
  mouseOnShape: string | null
) => {
  if (square.lockRatio && !square.size.ratio) {
    square.size.ratio = square.size.width / square.size.height;
  } else {
    square.size.ratio = 0;
  }
  if (mouseOnShape) {
    let { newArea } = resizeSquare(coordinate, square.size, mouseOnShape);
    if (square.lockRatio && square.size.ratio) {
      newArea = calculateRatio(newArea, square.size.ratio, mouseOnShape);
    }

    showElement(ctx, { ...square, ...newArea });
    return newArea;
  }
  return null;
};
