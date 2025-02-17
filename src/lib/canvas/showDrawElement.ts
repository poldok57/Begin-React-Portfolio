import {
  ThingsToDraw,
  ParamsGeneral,
  DRAW_TYPE,
} from "@/lib/canvas/canvas-defines";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";
import { CanvasPath } from "@/lib/canvas/CanvasPath";
import { CanvasShape } from "@/lib/canvas/CanvasShape";
import { CanvasDrawableObject } from "@/lib/canvas/CanvasDrawableObject";

import {
  drawDashedRectangle,
  drawDashedRedRectangle,
} from "./canvas-dashed-rect";
import { debounce } from "../utils/debounce";
import { Coordinate } from "./types";
import { isInsideSquare } from "../square-position";
import { scaledSize } from "../utils/scaledSize";

export const showDrawElement = (
  ctx: CanvasRenderingContext2D,
  element: ThingsToDraw,
  scale: number,
  withDetails: boolean = true
) => {
  if (!element || !ctx) return;

  let canvasObject: CanvasDrawableObject; // Points | CanvasPath | CanvasShape;

  switch (element.type) {
    case DRAW_TYPE.DRAW:
      canvasObject = new CanvasFreeCurve();
      break;
    case DRAW_TYPE.LINES_PATH:
    case DRAW_TYPE.ARROW:
      canvasObject = new CanvasPath(null);
      break;
    default:
      canvasObject = new CanvasShape();
      break;
  }

  canvasObject.setData(element);
  setTimeout(() => {
    canvasObject.setScale(scale);
    canvasObject.draw(ctx, withDetails);
  }, 5);
};

export const showAllDashedRectangles = (
  ctx: CanvasRenderingContext2D,
  elements: ThingsToDraw[],
  coord: Coordinate,
  scale: number = 1
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let nbFound = 0;
  const opacity = 0.3;
  let first = true;
  // Iterate from last to first element to find the last one containing coord
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    // Check if coord is inside element size
    if (isInsideSquare(coord, element.size, element.rotation)) {
      // First found element (last in z-order) gets 50% opacity
      // scale the size of the element
      const size = scaledSize(element.size, scale);

      // console.log(
      //   "drawDashedRectangle canvas size",
      //   ctx.canvas.width,
      //   ctx.canvas.height
      // );
      drawDashedRectangle(ctx, size, first ? 0.5 : opacity, element.rotation);
      if (first) {
        let lg = 0;
        if ("border" in element) {
          const border = element.border as ParamsGeneral;
          lg = border.lineWidth + (border.interval || 0);
        }
        drawDashedRedRectangle(ctx, size, 0.5, element.rotation, lg);
      }
      first = false;
      nbFound++;
    }
  }
  return nbFound;
};

export const showAllDashedRectanglesDebounced = debounce(
  showAllDashedRectangles,
  25
);
