import { Coordinate } from "../../lib/canvas/types";
import {
  basicLine,
  drawingCircle,
  drawPoint,
  hatchedCircle,
  hightLightMouseCursor,
} from "../../lib/canvas/canvas-basic";
import { DrawingHandler, returnMouseDown } from "./DrawingHandler";

import {
  DRAWING_MODES,
  mouseCircle,
  AllParams,
} from "../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class DrawFreehand extends DrawingHandler {
  private drawing: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.ctxMouse = null;
    this.ctxTempory = null;
    this.extendedMouseArea = false;
    this.setType(DRAWING_MODES.DRAW);
  }

  initData(initData: AllParams): void {
    this.setType(initData.mode);
    this.changeData(initData);
  }
  changeData(data: AllParams): void {
    this.setDataGeneral(data.general);
    if (this.ctxMouse === null) return;
    this.ctxMouse.lineWidth = data.general.lineWidth;
    this.ctxMouse.strokeStyle = data.general.color;
  }

  setDrawing(drawing: boolean) {
    this.drawing = drawing;
  }
  isDrawing() {
    return this.drawing;
  }

  setCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  setMouseCanvas(canvas: HTMLCanvasElement | null) {
    if (canvas === null) {
      console.error("setMouseCanvas canvas is null");
      return;
    }
    this.ctxMouse = canvas.getContext("2d");
  }

  setTemporyCanvas(canvas: HTMLCanvasElement | null) {
    if (canvas === null) {
      console.error("setTemporyCanvas canvas is null");
      return;
    }
    this.ctxTempory = canvas.getContext("2d");
  }

  // setStartCoordinates(_coord: Coordinate | null = null) {}

  isExtendedMouseArea() {
    return this.extendedMouseArea;
  }

  setExtendedMouseArea(value: boolean) {
    this.extendedMouseArea = value;
  }

  refreshDrawing() {}
  /**
   * Function follow the cursor on the canvas
   * @param {DRAWING_MODES} mode
   */
  followCursor() {
    const ctxMouse = this.ctxMouse;
    if (ctxMouse === null) {
      console.error("ctxMouse is null");
      return;
    }

    clearCanvasByCtx(ctxMouse);
    ctxMouse.globalAlpha = 0.4;

    const coord = this.getCoordinates() as Coordinate;

    switch (this.getType()) {
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        // ctxMouse.lineWidth = this.data.general.lineWidth;
        // ctxMouse.strokeStyle = this.data.general.color;
        drawPoint({
          context: ctxMouse,
          coordinate: coord,
        } as drawingCircle);
        break;
      case DRAWING_MODES.ERASE:
        ctxMouse.globalAlpha = 0.7;
        // ctxMouse.lineWidth = this.data.general.lineWidth;
        // ctxMouse.strokeStyle = this.data.general.color;
        hightLightMouseCursor(ctxMouse, coord, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        ctxMouse.globalAlpha = 0.5;
        hatchedCircle({
          context: ctxMouse,
          coordinate: coord,
          color: "#eee",
          borderColor: "#303030",
        } as drawingCircle);
        break;
    }

    return "none"; //  cursorType;
  }
  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent): string | null {
    const start: Coordinate | null = this.coordinates;
    this.setCoordinates(event);
    if (this.isDrawing()) {
      basicLine(
        this.context as CanvasRenderingContext2D,
        start,
        this.coordinates as Coordinate
      );
    }
    return this.followCursor() as string;
  }

  /**
   * Function who recieve the mouse down event
   * to start drawing on the canvas.
   * @param {DRAWING_MODES} mode
   * @param {MouseEvent} event
   * @returns {boolean} to continue or not
   */
  actionMouseDown(event: MouseEvent): returnMouseDown {
    // color and width painting
    this.setCoordinates(event);

    this.setDrawing(true);

    return { toContinue: false, pointer: "none" } as returnMouseDown;
  }
  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    this.coordinates = null;

    if (this.isDrawing()) {
      this.setDrawing(false);
      this.saveCanvasPicture();
    }
  }

  actionMouseLeave() {
    clearCanvasByCtx(this.ctxTempory);
    clearCanvasByCtx(this.ctxMouse);

    this.setDrawing(false);
  }
  endAction() {
    this.setDrawing(false);

    clearCanvasByCtx(this.ctxMouse);
  }
}
