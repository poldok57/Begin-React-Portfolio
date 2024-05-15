import {
  coordinate,
  drawingCircle,
  drawPoint,
  hatchedCircle,
  hightLightMouseCursor,
} from "../../lib/canvas/canvas-basic";
import { CanvasLine } from "../../lib/canvas/CanvasLine";
import { DrawingHandler } from "../../lib/canvas/DrawingHandler";

import {
  DRAWING_MODES,
  isDrawingFreehand,
  isDrawingLine,
  mouseCircle,
} from "../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";
import {
  addPictureToHistory,
  saveCanvasPicture,
} from "../../lib/canvas/canvas-history";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class DrawLine2 extends DrawingHandler {
  private line: CanvasLine;
  private drawing: boolean;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.line = new CanvasLine(canvas);
    this.ctxMouse = null;
    this.ctxTempory = null;
    this.extendedMouseArea = false;
    this.type = DRAWING_MODES.DRAW;
  }

  setCoordinates(event: MouseEvent) {
    if (this.mCanvas !== null) {
      this.line.setCoordinates(event, this.mCanvas);
    }
  }

  getCoordinates() {
    return this.line.getCoordinates() as coordinate;
  }

  setDataGeneral(data) {
    this.lineWidth = data.lineWidth;
    this.line.setLineWidth(data.lineWidth);
    this.strokeStyle = data.strokeStyle;
    this.line.setStrokeStyle(data.color);
    this.opacity = data.opacity;
  }

  setDrawing(drawing: boolean) {
    this.drawing = drawing;
  }
  isDrawing() {
    return this.drawing;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
    this.line.setCanvas(canvas);
  }

  setMouseCanvas(canvas) {
    this.ctxMouse = canvas.getContext("2d");
  }

  setTemporyCanvas(canvas) {
    this.ctxTempory = canvas.getContext("2d");
  }

  saveCanvasPicture() {
    const savePicture = {
      canvas: this.mCanvas,
      coordinates: this.line.getCoordinates() as coordinate,
      image: null,
    };
    addPictureToHistory(savePicture as saveCanvasPicture);
  }

  isExtendedMouseArea() {
    return this.extendedMouseArea;
  }
  setExtendedMouseArea(value) {
    this.extendedMouseArea = Boolean(value);
  }

  /**
   * Function to show the line on the tempory canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} opacity - opacity of the line
   */
  showTemporyLine(mode: string, opacity = 0) {
    if (this.ctxTempory === null || !isDrawingLine(mode)) {
      return;
    }
    const oldOpacity = this.ctxTempory.globalAlpha;
    if (opacity > 0) {
      this.ctxTempory.globalAlpha = opacity;
    }
    clearCanvasByCtx(this.ctxTempory);
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
    if (isDrawingLine(this.type)) {
      this.showTemporyLine(this.type, opacity);
    }
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
    const coord = this.line.getCoordinates() as coordinate;

    switch (this.type) {
      case DRAWING_MODES.ARC:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        clearCanvasByCtx(this.ctxTempory);
        this.line.showArc(this.ctxTempory, true);
        cursorType = "crosshair";
        break;
      case DRAWING_MODES.LINE:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        cursorType = "crosshair";
        if (this.line.getStartCoordinates() == null) {
          drawPoint({
            context: ctxMouse,
            coordinate: this.line.getCoordinates() as coordinate,
          } as drawingCircle);

          break;
        }
        clearCanvasByCtx(this.ctxTempory);
        this.line.showLine(this.ctxTempory);
        break;
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        ctxMouse.lineWidth = this.lineWidth;
        ctxMouse.strokeStyle = this.strokeStyle;
        drawPoint({ context: ctxMouse, coordinate: coord } as drawingCircle);
        break;
      case DRAWING_MODES.ERASE:
        ctxMouse.globalAlpha = 0.9;
        ctxMouse.lineWidth = this.lineWidth;
        ctxMouse.strokeStyle = this.strokeStyle;
        hightLightMouseCursor(ctxMouse, coord, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        hatchedCircle({
          context: ctxMouse,
          coordinate: coord,
          color: "#eee",
          borderColor: "#303030",
        } as drawingCircle);
        cursorType = "none";
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
    if (this.isDrawing()) {
      this.line.drawLine();
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
  actionMouseDown(mode: string, event: MouseEvent) {
    // color and width painting
    this.setCoordinates(event);
    let toContinue = false;

    this.type = mode;

    switch (mode) {
      case DRAWING_MODES.DRAW:
      case DRAWING_MODES.ERASE:
        this.setDrawing(true);
        break;

      case DRAWING_MODES.LINE:
        if (this.line.drawLine()) {
          this.saveCanvasPicture();
          break;
        }
        toContinue = true;
        break;
      case DRAWING_MODES.ARC:
        if (this.line.drawArc()) {
          this.line.showArc(null, false);
          this.line.setStartFromEnd();
          this.saveCanvasPicture();
          break;
        }
        toContinue = true;
        break;
    }
    return toContinue;
  }
  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    this.line.eraseCoordinate();

    if (isDrawingFreehand(this.type)) {
      if (this.isDrawing()) {
        this.setDrawing(false);
        this.line.eraseStartCoordinates();
        this.saveCanvasPicture();
      }
    }
  }

  actionMouseLeave() {
    if (this.type === DRAWING_MODES.ARC) {
      return;
    }

    clearCanvasByCtx(this.ctxTempory);
    clearCanvasByCtx(this.ctxMouse);

    if (isDrawingFreehand(this.type)) {
      this.setDrawing(false);
      this.line.eraseStartCoordinates();
    }
  }
  actionKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        clearCanvasByCtx(this.ctxTempory);
        this.line.eraseLastCoordinates();
        break;
    }
  }
  endAction() {
    if (isDrawingFreehand(this.type)) {
      this.setDrawing(false);
    } else if (!isDrawingLine(this.type)) {
      this.line.eraseStartCoordinates();
    }
  }
}
