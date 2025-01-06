/**
 * @module canvas-drawable-object (abstract class)
 * @description
 * this interface is used to manage data of a drawable object on a canvas
 */

import { ThingsToDraw } from "./canvas-defines";
import { resizingElement } from "./canvas-resize";
import { Area, Coordinate } from "./types";
import { debounceThrottle } from "@/lib/utils/debounce";

export const DEBOUNCE_TIME = 30;

export abstract class CanvasDrawableObject {
  protected data: ThingsToDraw;
  protected scale: number = 1;

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
    this.debounceDraw = debounceThrottle(
      this.debouncedDraw.bind(this),
      DEBOUNCE_TIME,
      DEBOUNCE_TIME * 2
    );
  }

  abstract draw(
    ctx: CanvasRenderingContext2D | null,
    withAdditionalInfo?: boolean,
    borderInfo?: string | null
  ): void;

  private debouncedDraw(
    ctx: CanvasRenderingContext2D | null,
    withAdditionalInfo?: boolean,
    borderInfo?: string | null
  ) {
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.draw(ctx, withAdditionalInfo, borderInfo);
  }

  debounceDraw: (
    ctx: CanvasRenderingContext2D | null,
    withAdditionalInfo?: boolean,
    borderInfo?: string | null
  ) => void | null;

  abstract getData(): ThingsToDraw | null;

  abstract setData(data: ThingsToDraw, toEdit?: boolean): void;

  setDataType(name: string) {
    this.data.type = name;
  }

  setDataId(id: string) {
    this.data.id = id;
  }
  getDataId() {
    return this.data.id;
  }

  setScale(scale: number) {
    this.scale = scale;
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
      this.setDataSize(newCoord);
      this.debounceDraw(ctx, true, witchBorder);
    }
    return newCoord;
  }
}
