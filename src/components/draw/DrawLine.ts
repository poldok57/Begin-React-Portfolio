import { mouseIsInsideComponent } from "../../lib/mouse-position";
import { Coordinate } from "../../lib/types";
import {
  drawingCircle,
  drawPoint,
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
  ParamsGeneral,
  AllParams,
  isDrawingLine,
} from "../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class DrawLine extends DrawingHandler {
  private line: CanvasLine;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.line = new CanvasLine(canvas);
    this.ctxMouse = null;
    this.ctxTempory = null;

    this.setType(DRAWING_MODES.LINE);
  }

  setCoordinates(event: MouseEvent) {
    if (this.mCanvas !== null) {
      this.line.setCoordinates(event, this.mCanvas);
    }
    return this.line.getCoordinates() as Coordinate;
  }

  getCoordinates() {
    return this.line.getCoordinates() as Coordinate;
  }

  setDataGeneral(data: ParamsGeneral) {
    this.line.setLineWidth(data.lineWidth);
    this.line.setStrokeStyle(data.color);
    if (this.ctxMouse !== null) {
      this.ctxMouse.lineWidth = data.lineWidth;
      this.ctxMouse.strokeStyle = data.color;
    }
    if (this.ctxTempory !== null) {
      this.ctxTempory.lineWidth = data.lineWidth;
      this.ctxTempory.strokeStyle = data.color;
    }
  }

  initData(initData: AllParams) {
    this.setType(initData.mode);
    this.setDataGeneral(initData.general);
  }
  changeData(data: AllParams) {
    this.setDataGeneral(data.general);
  }

  setCanvas(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
    if (this.line) this.line.setCanvas(canvas);
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

  setStartCoordinates(coord: Coordinate | null = null) {
    if (coord === null) {
      this.line.eraseStartCoordinates();
      return;
    }
    this.line.setStartCoordinates(coord);
  }

  /**
   * Function to show the line on the tempory canvas
   * @param {DRAWING_MODES} mode - mode of the drawing
   * @param {number} opacity - opacity of the line
   */
  showTemporyLine(mode: string, opacity: number = 0) {
    if (this.ctxTempory === null) {
      return;
    }
    const oldOpacity = this.ctxTempory.globalAlpha;
    if (opacity > 0) {
      this.ctxTempory.globalAlpha = opacity;
    }

    this.clearTemporyCanvas();
    switch (mode) {
      case DRAWING_MODES.LINE:
        this.line.showLine(this.ctxTempory);
        break;
      case DRAWING_MODES.ARC:
        this.line.showArc(this.ctxTempory, true);
        break;
    }
    this.ctxTempory.globalAlpha = oldOpacity;
  }

  refreshDrawing(opacity: number) {
    this.showTemporyLine(this.getType(), opacity);
  }
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

    let cursorType = "default";
    const coord = this.line.getCoordinates() as Coordinate;

    switch (this.getType()) {
      case DRAWING_MODES.ARC:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        this.clearTemporyCanvas();
        this.line.showArc(this.ctxTempory, true);
        cursorType = "crosshair";
        break;
      case DRAWING_MODES.LINE:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        cursorType = "crosshair";
        if (this.line.getStartCoordinates() == null) {
          drawPoint({
            context: ctxMouse,
            coordinate: this.line.getCoordinates() as Coordinate,
          } as drawingCircle);

          break;
        }
        this.clearTemporyCanvas();
        this.line.showLine(this.ctxTempory);
        break;
    }

    // ctxMouse.canvas.style.cursor = cursorType;
    return cursorType as string;
  }
  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent) {
    this.line.setCoordinates(event);

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
    // first point must be inside the canvas
    if (
      !mouseIsInsideComponent(event, this.mCanvas) &&
      this.line.getStartCoordinates() == null
    ) {
      return { toContinue: false, toReset: false, pointer: "default" };
    }
    // color and width painting
    this.setCoordinates(event);
    let toContinue = false;
    const pointer = "none";

    this.setType(mode);

    switch (mode) {
      case DRAWING_MODES.LINE:
        if (this.line.drawLine()) {
          this.saveCanvasPicture(this.line.getCoordinates() as Coordinate);
        }
        toContinue = true;
        break;
      case DRAWING_MODES.ARC:
        if (this.line.drawArc()) {
          this.line.showArc(null, false);
          this.line.setStartFromEnd();
          this.saveCanvasPicture(this.line.getStartCoordinates() as Coordinate);
        }
        toContinue = true;
        break;
    }
    return { toContinue, toReset: false, pointer } as returnMouseDown;
  }
  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    this.line.eraseCoordinate();
  }

  actionMouseLeave() {
    clearCanvasByCtx(this.ctxMouse);
  }

  actionAbort(): void {
    this.clearTemporyCanvas();
    this.line.eraseLastCoordinates();
  }

  endAction(nextMode: string = DRAWING_MODES.DRAW) {
    if (!isDrawingLine(nextMode)) {
      this.clearTemporyCanvas();
      this.line.eraseLastCoordinates();
    }
    clearCanvasByCtx(this.ctxMouse);
  }
}
