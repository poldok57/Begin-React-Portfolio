/**
 * @module canvas-points
 * @description
 * this interface is used to draw points on a canvas
 */

import { ThingsToDraw } from "./canvas-defines";
import { Area, Coordinate } from "./types";

export abstract class CanvasDrawableObject {
  protected data: ThingsToDraw;

  constructor() {
    this.data = {
      id: "",
      type: "",
      rotation: 0,
      size: { x: 0, y: 0, width: 0, height: 0 },
      general: {
        color: "#000",
        lineWidth: 1,
        opacity: 0,
      },
    };
  }

  abstract draw(
    ctx: CanvasRenderingContext2D | null,
    withAdditionalInfo?: boolean,
    borderInfo?: string | null
  ): void;

  abstract getData(): ThingsToDraw | null;

  abstract setData(data: ThingsToDraw): void;

  setDataType(name: string) {
    this.data.type = name;
  }

  setDataId(id: string) {
    this.data.id = id;
  }
  getDataId() {
    return this.data.id;
  }

  setDataSize(data: Area | Coordinate): void {
    if ("width" in data && "height" in data) {
      this.data.size = { ...data };
    } else {
      this.data.size = { ...this.data.size, ...data };
    }
  }

  getDataSize(): Area {
    return { ...this.data.size };
  }
}
