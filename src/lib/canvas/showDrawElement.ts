// import { useDesignStore } from "@/lib/stores/design";
import { ThingsToDraw, DRAW_TYPE } from "@/lib/canvas/canvas-defines";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";
import { CanvasPath } from "@/lib/canvas/CanvasPath";
import { CanvasShape } from "@/lib/canvas/CanvasShape";
import { CanvasDrawableObject } from "@/lib/canvas/CanvasDrawableObject";

import { drawDashedRectangle } from "./canvas-dashed-rect";
import { debounce } from "../utils/debounce";
import { Coordinate } from "./types";
import { isInsideSquare } from "../square-position";

export const showDrawElement = (
  ctx: CanvasRenderingContext2D,
  element: ThingsToDraw,
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
    canvasObject.draw(ctx, withDetails);
  }, 5);
};

export const showAllDashedRectangles = (
  ctx: CanvasRenderingContext2D,
  elements: ThingsToDraw[],
  coord: Coordinate
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let nbFound = 0;
  let opacity = 0.8;
  // Iterate from last to first element to find the last one containing coord
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    // Check if coord is inside element size
    if (isInsideSquare(coord, element.size, element.rotation)) {
      // First found element (last in z-order) gets 50% opacity
      drawDashedRectangle(ctx, element.size, opacity, element.rotation);
      opacity = 0.3;
      nbFound++;
    }
  }
  return nbFound;
};

export const showAllDashedRectanglesDebounced = debounce(
  showAllDashedRectangles,
  25
);
