/**
 * @module canvas-drawable-object (abstract class)
 * @description
 * this interface is used to manage data of a drawable object on a canvas
 */

import { isOnSquareBorder } from "../square-position";
import { BORDER } from "../mouse-position";
import { coordinateIsInsideRect } from "../mouse-position";
import { scaledCoordinate, scaledSize } from "../utils/scaledSize";
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
  private area: Area | null = null;

  constructor() {
    this.data = {
      id: "",
      type: "",
      rotation: 0,
      center: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
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

  setData(data: ThingsToDraw, _toEdit?: boolean): Promise<void> {
    this.data = { ...data };
    // console.log("data", data, "center", data.center);
    this.area = {
      x: data.center.x - data.size.width / 2,
      y: data.center.y - data.size.height / 2,
      width: data.size.width,
      height: data.size.height,
    };
    return Promise.resolve();
  }

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

  setDataSize(size: Size): void {
    this.data.size = { ...size };
    this.area = null;
  }

  private coordinateToArea(ratio?: number): void {
    this.area = {
      x: this.data.center.x - this.data.size.width / 2,
      y: this.data.center.y - this.data.size.height / 2,
      width: this.data.size.width,
      height: this.data.size.height,
    };
    if (ratio) {
      this.area.ratio = ratio;
    }
  }
  setArea(area: Area): void {
    const ratio = area.ratio;
    this.area = { ...area, ratio };
    this.data.size = {
      width: area.width,
      height: area.height,
    };
    this.data.center = {
      x: this.area.x + this.area.width / 2,
      y: this.area.y + this.area.height / 2,
    };
  }

  getArea(): Area {
    if (this.area === null) {
      this.coordinateToArea();
    }
    return { ...this.area } as Area;
  }

  setRatio(ratio: number): void {
    if (this.area) {
      this.area.ratio = ratio;
    } else {
      this.coordinateToArea(ratio);
    }
  }

  getDataSize(): Size {
    return this.data.size;
  }

  getDataCenter(): Coordinate {
    return this.data.center;
  }

  setDataCenter(center: Coordinate): void {
    this.data.center = center;
    this.area = null;
  }

  changeRotation(rotation: number): void {
    this.data.rotation = (this.data.rotation + rotation + 360) % 360;
  }
  setRotation(rotation: number): void {
    this.data.rotation = rotation;
  }
  getRotation() {
    return this.data.rotation;
  }

  /**
   * Change the position of the path
   * @param offset - The offset to move the path
   */
  move(offset: Coordinate) {
    this.data.center.x += offset.x;
    this.data.center.y += offset.y;
    this.area = null;
  }

  resizingArea(
    ctx: CanvasRenderingContext2D,
    coordinates: Coordinate,
    lockRatio: boolean,
    witchBorder: string
  ): Area | null {
    const newArea = resizingElement(
      ctx,
      this.getArea(),
      coordinates,
      lockRatio,
      witchBorder,
      this.data.rotation
    );

    if (newArea) {
      this.setArea(newArea);
      this.debounceDraw(ctx, true, witchBorder);
    }
    return newArea;
  }

  hightLightDrawing(ctx: CanvasRenderingContext2D | null): void {
    const size = scaledSize(this.data.size, this.scale);
    const center = scaledCoordinate(this.data.center, this.scale);
    drawDashedRedRectangle(ctx, center, size, 0.8, this.data.rotation);
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
      center: this.data.center,
      size: this.data.size,
      withResize: this.data.type !== DRAWING_MODES.TEXT,
      rotation: this.data.rotation ?? 0,
    });
  }
}
