/**
 * @module canvas-points
 * @description
 * this interface is used to draw points on a canvas
 */

import { ThingsToDraw } from "./canvas-defines";
import { resizingElement } from "./canvas-resize";
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

  resizingArea(
    ctx: CanvasRenderingContext2D,
    coordinates: Coordinate,
    lockRatio: boolean,
    witchBorder: string
  ) {
    const newCoord = resizingElement(
      ctx,
      this.data.size,
      coordinates,
      lockRatio,
      witchBorder,
      this.data.rotation
    );

    if (newCoord) {
      this.draw(ctx, lockRatio, witchBorder);
      this.setDataSize(newCoord);
    }
    return newCoord;
  }
}
