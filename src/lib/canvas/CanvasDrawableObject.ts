/**
 * @module canvas-drawable-object (abstract class)
 * @description
 * this interface is used to manage data of a drawable object on a canvas
 */

import { isOnSquareBorder } from "../square-position";
import { BORDER } from "../mouse-position";
import { coordinateIsInsideRect } from "../mouse-position";
import { scaledSize } from "../utils/scaledSize";
import { drawDashedRedRectangle } from "./canvas-dashed-rect";
import { DRAWING_MODES, ThingsToDraw } from "./canvas-defines";
import { resizingElement } from "./canvas-resize";
import { Area, ButtonArgs, Coordinate, MiddleButton, Size } from "./types";
import { debounceThrottle } from "@/lib/utils/debounce";

export const DEBOUNCE_TIME = 30;

export abstract class CanvasDrawableObject {
  protected data: ThingsToDraw;
  protected scale: number = 1;
  protected withCornerButton: boolean = true;
  protected withTurningButtons: boolean = false;
  protected btnValidPos: ButtonArgs | null = null;
  protected btnDeletePos: ButtonArgs | null = null;
  protected btnMiddlePos: MiddleButton | null = null;

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

  setDataSize(data: Area | Coordinate | Size): void {
    this.data.size = { ...this.data.size, ...data };
  }

  getDataSize(): Area {
    return { ...this.data.size };
  }

  resizingArea(
    ctx: CanvasRenderingContext2D,
    coordinates: Coordinate,
    lockRatio: boolean,
    witchBorder: string
  ): Area | null {
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

  hightLightDrawing(ctx: CanvasRenderingContext2D | null): void {
    const size = scaledSize(this.data.size, this.scale);
    drawDashedRedRectangle(ctx, size, 0.8, 0);
  }

  /**
   * check if the mouse is on a button
   * @param {Coordinate} coordinate - the coordinate of the mouse
   * @returns {string | null} - the border of the shape or null if the mouse is not on a button
   */
  isMouseOnButton(coordinate: Coordinate): string | null {
    const coord = { ...coordinate };
    if (this.scale !== 1) {
      coord.x = coord.x * this.scale;
      coord.y = coord.y * this.scale;
    }
    if (this.withCornerButton && this.btnValidPos) {
      if (coordinateIsInsideRect(coord, this.btnValidPos)) {
        return BORDER.ON_BUTTON;
      }
      if (
        this.btnDeletePos &&
        coordinateIsInsideRect(coord, this.btnDeletePos)
      ) {
        return BORDER.ON_BUTTON_DELETE;
      }
    }
    if (this.withTurningButtons && this.btnMiddlePos) {
      if (coordinateIsInsideRect(coord, this.btnMiddlePos)) {
        if (coord.x < this.btnMiddlePos.middle) return BORDER.ON_BUTTON_LEFT;
        if (coord.x > this.btnMiddlePos.middle) return BORDER.ON_BUTTON_RIGHT;
        return BORDER.INSIDE;
      }
    }
    return null;
  }

  /**
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   */
  handleMouseOnElement(coordinate: Coordinate | null): string | null {
    if (!coordinate) return null;

    const onButton = this.isMouseOnButton(coordinate);
    if (onButton) {
      return onButton;
    }

    return isOnSquareBorder({
      coordinate: coordinate,
      area: this.data.size,
      withResize: this.data.type !== DRAWING_MODES.TEXT,
      rotation: this.data.rotation ?? 0,
    });
  }
}
