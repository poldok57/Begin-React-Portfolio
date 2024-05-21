import { coordinate } from "./canvas-basic";
import { getCoordinates, clearCanvasByCtx } from "./canvas-tools";
import { DRAWING_MODES, paramsAll } from "./canvas-defines";
import { isOnSquareBorder } from "../square-position";

export type returnMouseDown = {
  toContinue: boolean;
  toReset: boolean;
  pointer: string | null;
};
export abstract class DrawingHandler {
  protected mCanvas: HTMLCanvasElement | null = null;

  protected context: CanvasRenderingContext2D | null = null;
  protected ctxMouse: CanvasRenderingContext2D | null = null;
  protected ctxTempory: CanvasRenderingContext2D | null = null;

  protected lineWidth: number = 1;
  protected strokeStyle: string = "#000000";
  protected opacity: number = 1;

  protected type: string = DRAWING_MODES.DRAW;

  protected coordinates: coordinate = { x: 0, y: 0 };

  protected extendedMouseArea: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    if (canvas) this.setCanvas(canvas);
    this.extendedMouseArea = false;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  setMouseCanvas(canvas: HTMLCanvasElement) {
    this.ctxMouse = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  setTemporyCanvas(canvas: HTMLCanvasElement) {
    this.ctxTempory = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;
  }

  clearTemporyCanvas() {
    if (!this.ctxTempory) return;
    clearCanvasByCtx(this.ctxTempory);
  }

  setDataGeneral(data: any) {
    this.lineWidth = data.lineWidth;
    this.strokeStyle = data.strokeStyle;
    this.opacity = data.opacity;
  }

  isExtendedMouseArea(): boolean {
    return this.extendedMouseArea;
  }
  setExtendedMouseArea(value: boolean) {
    this.extendedMouseArea = value;
  }

  setCoordinates(event: MouseEvent) {
    if (!event || !this.mCanvas) return { x: 0, y: 0 };

    this.coordinates = getCoordinates(event, this.mCanvas);
    return this.coordinates;
  }

  getCoordinates() {
    return this.coordinates;
  }

  setType(type: string) {
    this.type = type;
  }
  getType() {
    return this.type;
  }

  /**
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   * @param {object} param0 - {coordinate, area, withResize, withMiddleButton}
   * @returns {string} - border or button where the mouse is
   */
  handleMouseOnShape({
    coordinate,
    area,
    withResize,
    withMiddleButton,
  }: any): string | null {
    if (this.mCanvas === null || !coordinate) return null;

    return isOnSquareBorder({
      coord: coordinate,
      area,
      withButton: true,
      withResize,
      withMiddleButton: withMiddleButton,
      maxWidth: this.mCanvas.width,
    });
  }
  startAction(): void {}
  abstract endAction(): void;
  abstract changeData(data: paramsAll): void;
  abstract initData(data: paramsAll): void;

  abstract actionMouseDown(mode: string, event: MouseEvent): returnMouseDown;
  abstract actionMouseMove(event: MouseEvent): string | null;
  abstract actionMouseUp(): void;
  abstract actionMouseLeave(): void;
  abstract actionKeyDown(event: KeyboardEvent): void;

  abstract refreshDrawing(opacity: number): void;
}
