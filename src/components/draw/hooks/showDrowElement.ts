// import { useDesignStore } from "@/lib/stores/design";
import { ThingsToDraw, DRAW_TYPE } from "@/lib/canvas/canvas-defines";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";
import { CanvasPath } from "@/lib/canvas/CanvasPath";
import { CanvasShape } from "@/lib/canvas/CanvasShape";
import { CanvasDrawableObject } from "@/lib/canvas/CanvasDrawableObject";

export const showDrowElement = (
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
    case DRAW_TYPE.PATH:
      canvasObject = new CanvasPath(null);
      break;
    default:
      canvasObject = new CanvasShape();
      break;
  }

  canvasObject.setData(element);
  canvasObject.draw(ctx, withDetails);
};
