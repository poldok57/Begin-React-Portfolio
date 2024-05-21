import {
  coordinate,
  basicLine,
  drawingCircle,
  drawPoint,
  hatchedCircle,
  hightLightMouseCursor,
} from "../../lib/canvas/canvas-basic";
import { CanvasLine } from "../../lib/canvas/CanvasLine";
import {
  DrawingHandler,
  returnMouseDown,
} from "../../lib/canvas/DrawingHandler";

import {
  DRAWING_MODES,
  mouseCircle,
  paramsGeneral,
  paramsAll,
} from "../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";
import {
  addPictureToHistory,
  canvasPicture,
} from "../../lib/canvas/canvas-history";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class DrawFreehand extends DrawingHandler {
  private drawing: boolean;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.ctxMouse = null;
    this.ctxTempory = null;
    this.extendedMouseArea = false;
    this.type = DRAWING_MODES.DRAW;
  }

  setDataGeneral(data: paramsGeneral) {
    this.lineWidth = data.lineWidth;
    this.strokeStyle = data.color;
    this.opacity = data.opacity;
  }

  initData(initData: paramsAll) {
    this.type = initData.mode;
    this.setDataGeneral(initData.general);
  }
  changeData(data: paramsAll) {
    this.setDataGeneral(data.general);
  }

  setDrawing(drawing: boolean) {
    this.drawing = drawing;
  }
  isDrawing() {
    return this.drawing;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  setMouseCanvas(canvas: HTMLCanvasElement) {
    if (canvas === null) {
      console.error("setMouseCanvas canvas is null");
      return;
    }
    this.ctxMouse = canvas.getContext("2d");
  }

  setTemporyCanvas(canvas: HTMLCanvasElement) {
    if (canvas === null) {
      console.error("setTemporyCanvas canvas is null");
      return;
    }
    this.ctxTempory = canvas.getContext("2d");
  }

  saveCanvasPicture() {
    const savePicture = {
      type: this.type,
      canvas: this.mCanvas,
      coordinates: this.getCoordinates() as coordinate,
      image: null,
    };
    addPictureToHistory(savePicture as canvasPicture);
  }

  setStartCoordinates(coord: coordinate = null) {}

  isExtendedMouseArea() {
    return this.extendedMouseArea;
  }

  setExtendedMouseArea(value: boolean) {
    this.extendedMouseArea = value;
  }

  refreshDrawing(opacity: number) {}
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

    let cursorType = "none";
    const coord = this.getCoordinates() as coordinate;

    switch (this.type) {
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        ctxMouse.lineWidth = this.lineWidth;
        ctxMouse.strokeStyle = this.strokeStyle;
        drawPoint({
          context: ctxMouse,
          coordinate: coord,
          color: this.strokeStyle,
          diameter: this.lineWidth,
        } as drawingCircle);
        break;
      case DRAWING_MODES.ERASE:
        ctxMouse.globalAlpha = 0.7;
        ctxMouse.lineWidth = this.lineWidth;
        ctxMouse.strokeStyle = this.strokeStyle;
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

    // ctxMouse.canvas.style.cursor = cursorType;
    return cursorType as string;
  }
  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent): string | null {
    const start: coordinate | null = this.coordinates;
    this.setCoordinates(event);
    if (this.isDrawing()) {
      if (this.coordinates === null) return null;
      basicLine(
        this.context as CanvasRenderingContext2D,
        start,
        this.coordinates as coordinate
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
  actionMouseDown(mode: string, event: MouseEvent): returnMouseDown {
    // color and width painting
    this.setCoordinates(event);

    this.type = mode;

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
  actionKeyDown(event: KeyboardEvent) {}
  endAction() {
    this.setDrawing(false);

    clearCanvasByCtx(this.ctxMouse);
  }
}
