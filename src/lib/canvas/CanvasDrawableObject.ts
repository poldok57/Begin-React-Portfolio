/**
 * @module canvas-points
 * @description
 * this interface is used to draw points on a canvas
 */

import { ThingsToDraw } from "./canvas-defines";

export abstract class CanvasDrawableObject {
  protected data: ThingsToDraw;

  constructor() {
    this.data = {
      type: "",
      rotation: 0,
      size: { x: 0, y: 0, width: 0, height: 0 },
      general: {
        color: "#000",
        lineWidth: 1,
        opacity: 1,
      },
    };
  }

  abstract draw(
    ctx: CanvasRenderingContext2D | null,
    withAdditionalInfo?: boolean,
    borderInfo?: string | null
  ): void;

  setDataType(name: string) {
    this.data.type = name;
  }
}
