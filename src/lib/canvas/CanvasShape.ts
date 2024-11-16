/**
 * @module canvas-shape
 * @description
 * this interface is used to draw shapes on a canvas
 */
import { Area, Coordinate, ArgsMouseOnShape } from "./types";
import {
  AllParams,
  ParamsGeneral,
  ParamsShape,
  ParamsText,
  ShapeDefinition,
  DRAWING_MODES,
} from "./canvas-defines";
import { resizingElement } from "./canvas-resize";
import { CanvasDrawableObject } from "./CanvasDrawableObject";
import { showElement } from "./canvas-elements";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";

export class CanvasShape extends CanvasDrawableObject {
  protected data: ShapeDefinition;

  constructor() {
    super();
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

  addData(data: AllParams) {
    this.data = { ...this.data, ...data };
  }
  getData(): ShapeDefinition {
    const d = this.data;

    // return d;

    const cpy: ShapeDefinition = {
      id: d.id,
      type: d.type,
      rotation: d.rotation,
      size: { ...d.size },
      general: { ...d.general },
      shape: { ...d.shape },
    };

    if (d.shape?.withBorder && d.border) cpy.border = { ...d.border };
    if ((d.type === DRAWING_MODES.TEXT || d.shape?.withText) && d.text)
      cpy.text = { ...d.text };

    if (d.type === DRAWING_MODES.IMAGE) {
      cpy.blackWhite = d.blackWhite;
      cpy.canvasImage = d.canvasImage;
      cpy.canvasImageTransparent = d.canvasImageTransparent;
    }

    return cpy;
  }

  setData(data: ShapeDefinition) {
    this.data = data;
  }

  setDataParams(params: Area | ParamsGeneral | ParamsShape | ParamsText) {
    this.data = { ...this.data, ...params } as ShapeDefinition;
  }

  setType(type: string): void {
    this.data.type = type;
    this.calculateWithTurningButtons(type);
  }
  getType() {
    return this.data.type;
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
  setDataGeneral(data: ParamsGeneral): void {
    this.data.general = { ...data };
  }
  changeRotation(rotation: number): void {
    this.data.rotation += rotation;
  }
  setRotation(rotation: number): void {
    this.data.rotation = rotation;
  }
  setDataBorder(data: ParamsGeneral) {
    this.data.border = { ...data };
  }
  setDataShape(data: ParamsShape) {
    this.data.shape = { ...data };
  }
  setDataText(data: ParamsText) {
    this.data.text = { ...data };
  }
  initData(initData: AllParams) {
    // this.data = { ...this.data, ...initData };
    this.changeData(initData);
    this.data.rotation = 0;
    if (this.data.text) {
      this.data.text.rotation = 0;
    }
    this.data.size.ratio = 0;

    this.data.canvasImage = null;
    this.data.canvasImageTransparent = null;
    this.data.withTurningButtons = true;
  }
  changeData(param: AllParams) {
    this.setDataGeneral(param.general);
    this.setDataBorder(param.border);
    this.setDataShape(param.shape);
    this.setDataText(param.text);

    this.data.type = param.mode;
  }

  setWithTurningButtons(value: boolean) {
    this.data.withTurningButtons = value;
  }
  /**
   * Function to set if the middle button should be shown
   */
  calculateWithTurningButtons(type: string | null = null): void {
    const sSize = this.getDataSize();
    if (type === null) type = this.getType();

    // don't show the middle button if the shape is a circle without text
    if (
      type === DRAWING_MODES.CIRCLE &&
      sSize.width === sSize.height &&
      !this.data.shape?.withText
    ) {
      this.data.withTurningButtons = false;
      return;
    }
    this.data.withTurningButtons = true;
  }

  setWithCornerButton(value: boolean) {
    this.data.withCornerButton = value;
  }
  setWithAllButtons(value: boolean) {
    if (value) {
      this.calculateWithTurningButtons();
    } else {
      this.data.withTurningButtons = false;
    }
    this.data.withCornerButton = value;
  }

  setRadius(radius: number) {
    if (this.data.shape) {
      this.data.shape.radius = radius;
    } else {
      this.data.shape = { radius: radius };
    }
  }
  getOpacity() {
    return this.data.general.opacity;
  }

  setCanvasImage(value: HTMLCanvasElement | null) {
    this.data.canvasImage = value;
  }
  getCanvasImage() {
    return this.data.canvasImage;
  }
  setCanvasImageTransparent(value: HTMLCanvasElement | null) {
    this.data.canvasImageTransparent = value;
  }
  getCanvasImageTransparent() {
    return this.data.canvasImageTransparent;
  }

  setBlackWhite(value: boolean) {
    this.data.blackWhite = value;
  }

  resizingElement(
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
      witchBorder
    );

    if (newCoord) {
      this.draw(ctx, lockRatio, witchBorder);
      this.setDataSize(newCoord);
      this.calculateWithTurningButtons();
    }
    return newCoord;
  }

  /**
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   */
  handleMouseOnShape(
    canvas: HTMLCanvasElement | null,
    coordinate: Coordinate | null
  ): string | null {
    if (canvas === null || !coordinate) return null;

    const argsMouseOnShape: ArgsMouseOnShape = {
      coordinate: coordinate,
      area: this.getDataSize(),
      withResize: this.data.type !== DRAWING_MODES.TEXT,
      withCornerButton: this.data.withCornerButton || false,
      withTurningButtons: this.data.withTurningButtons || false,
      maxWidth: canvas.width,
    };

    return isOnSquareBorder(argsMouseOnShape);
  }

  /**
   * Function to draw the shape on tempory canvas with throttling
   */
  drawToTrottle(
    ctx: CanvasRenderingContext2D | null,
    data: ShapeDefinition,
    withBorder: boolean,
    borderInfo?: string | null
  ) {
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    showElement(ctx, data, withBorder, borderInfo);
  }

  showElementThrottled = throttle(this.drawToTrottle, 20);
  /**
   * Function to draw the shape on the canvas
   */
  draw(
    ctx: CanvasRenderingContext2D | null,
    temporyDraw?: boolean,
    borderInfo?: string | null
  ) {
    if (temporyDraw) {
      this.showElementThrottled(ctx, this.data, temporyDraw, borderInfo);
    } else {
      if (ctx) ctx.globalAlpha = this.data.general.opacity;
      showElement(ctx, this.data, false, null);
    }
  }
}
