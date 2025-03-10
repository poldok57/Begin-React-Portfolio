import { ThingsToDraw, ParamsGeneral } from "@/lib/canvas/canvas-defines";

import {
  drawDashedRectangle,
  drawDashedRedRectangle,
} from "./canvas-dashed-rect";
import { debounce } from "../utils/debounce";
import { Coordinate, Size } from "./types";
import { isInsideSquare } from "../square-position";
import { scaledCoordinate, scaledSize } from "../utils/scaledSize";

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
    if (isInsideSquare(coord, element.center, element.size, element.rotation)) {
      // First found element (last in z-order) gets 50% opacity
      // scale the size of the element
      const size: Size = scaledSize(element.size, scale);
      const center = scaledCoordinate(element.center, scale);
      drawDashedRectangle(
        ctx,
        center,
        size,
        first ? 0.5 : opacity,
        element.rotation
      );
      if (first) {
        let lg = 0;
        if ("border" in element) {
          const border = element.border as ParamsGeneral;
          lg = border.lineWidth + (border.interval || 0);
        }
        drawDashedRedRectangle(ctx, center, size, 0.5, element.rotation, lg);
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
