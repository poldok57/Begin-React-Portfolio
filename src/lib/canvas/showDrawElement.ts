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
      canvasObject = new CanvasPath(null);
      break;
    default:
      canvasObject = new CanvasShape();
      break;
  }

  canvasObject.setData(element);
  canvasObject.draw(ctx, withDetails);
};

// export const isInside = (size: Area, angle: number, coord: Coordinate) => {
//   if (angle === 0) {
//     // Si pas de rotation, calcul simple
//     return (
//       coord.x >= size.x &&
//       coord.x <= size.x + size.width &&
//       coord.y >= size.y &&
//       coord.y <= size.y + size.height
//     );
//   }

//   // Calculer le centre du rectangle
//   const centerX = size.x + size.width / 2;
//   const centerY = size.y + size.height / 2;

//   // Transformer les coordonnées du point pour annuler la rotation
//   const angleRad = (angle * Math.PI) / 180;
//   const cos = Math.cos(-angleRad);
//   const sin = Math.sin(-angleRad);

//   // Translater le point par rapport au centre de rotation
//   const dx = coord.x - centerX;
//   const dy = coord.y - centerY;

//   // Appliquer la rotation inverse
//   const rotatedX = dx * cos - dy * sin + centerX;
//   const rotatedY = dx * sin + dy * cos + centerY;

//   // Vérifier si le point transformé est dans le rectangle non-rotaté
//   return (
//     rotatedX >= size.x &&
//     rotatedX <= size.x + size.width &&
//     rotatedY >= size.y &&
//     rotatedY <= size.y + size.height
//   );
// };

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
