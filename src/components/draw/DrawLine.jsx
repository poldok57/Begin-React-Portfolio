import {
  CanvasLine,
  drawPoint,
  hatchedCircle,
} from "../../lib/canvas/canvas-line";

import {
  DRAWING_MODES,
  isDrawingFreehand,
  isDrawingLine,
  mouseCircle,
} from "../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";
import { hightLightMouseCursor } from "../../lib/canvas/canvas-elements";
import { addPictureToHistory } from "../../lib/canvas/canvas-history";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class DrawLine extends CanvasLine {
  constructor(canvas) {
    super(canvas);
    this.ctxMouse = null;
    this.ctxTempory = null;
    this.extendedMouseArea = false;
  }

  setMouseCanvas(canvas) {
    this.ctxMouse = canvas.getContext("2d");
  }

  setTemporyCanvas(canvas) {
    this.ctxTempory = canvas.getContext("2d");
  }

  saveCanvasPicture() {
    addPictureToHistory({
      canvas: this.mCanvas,
      coordinates: this.getCoordinates(),
    });
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
  showTemporyLine(mode, opacity = 0) {
    if (this.startCoordinates == null || !isDrawingLine(mode)) {
      return;
    }
    const oldOpacity = this.ctxTempory.globalAlpha;
    if (opacity > 0) {
      this.ctxTempory.globalAlpha = opacity;
    }
    clearCanvasByCtx(this.ctxTempory);
    switch (mode) {
      case DRAWING_MODES.LINE:
        this.showLine(this.ctxTempory);
        break;
      case DRAWING_MODES.ARC:
        this.showArc(this.ctxTempory, true);
        break;
    }
    this.ctxTempory.globalAlpha = oldOpacity;
  }
  /**
   * Function follow the cursor on the canvas
   * @param {DRAWING_MODES} mode
   */
  followCursor(mode) {
    const ctxMouse = this.ctxMouse;
    // console.log("followCursor", mode, this.currentCoordinates);

    clearCanvasByCtx(ctxMouse);
    ctxMouse.globalAlpha = 0.4;

    let cursorType = "default";

    switch (mode) {
      case DRAWING_MODES.ARC:
        hightLightMouseCursor(ctxMouse, this.currentCoordinates, mouseCircle);
        clearCanvasByCtx(this.ctxTempory);
        this.showArc(this.ctxTempory, true);
        cursorType = "crosshair";
        break;
      case DRAWING_MODES.LINE:
        hightLightMouseCursor(ctxMouse, this.currentCoordinates, mouseCircle);
        cursorType = "crosshair";
        if (this.startCoordinates == null) {
          drawPoint(ctxMouse, this.currentCoordinates);
          break;
        }
        clearCanvasByCtx(this.ctxTempory);
        this.showLine(this.ctxTempory);
        break;
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxMouse, this.currentCoordinates, mouseCircle);
        ctxMouse.lineWidth = this.lineWidth;
        ctxMouse.strokeStyle = this.strokeStyle;
        drawPoint(ctxMouse, this.currentCoordinates);
        break;
      case DRAWING_MODES.ERASE:
        ctxMouse.globalAlpha = 0.9;
        ctxMouse.lineWidth = this.lineWidth;
        ctxMouse.strokeStyle = this.strokeStyle;
        hightLightMouseCursor(ctxMouse, this.currentCoordinates, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        hatchedCircle(ctxMouse, this.currentCoordinates, "#eee", "#303030");
        cursorType = "none";
        break;
    }

    ctxMouse.canvas.style.cursor = cursorType;
  }
  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(mode, event) {
    this.setCoordinates(event);
    if (this.isDrawing()) {
      this.drawLine();
    }
    this.followCursor(mode);
  }

  /**
   * Function who recieve the mouse down event
   * to start drawing on the canvas.
   * @param {DRAWING_MODES} mode
   * @param {MouseEvent} event
   * @returns {boolean} to continue or not
   */
  actionMouseDown(mode, event) {
    // color and width painting
    this.setCoordinates(event);
    let toContinue = false;

    switch (mode) {
      case DRAWING_MODES.DRAW:
      case DRAWING_MODES.ERASE:
        this.setDrawing(true);
        break;

      case DRAWING_MODES.LINE:
        if (this.drawLine()) {
          this.saveCanvasPicture();
          break;
        }
        toContinue = true;
        break;
      case DRAWING_MODES.ARC:
        if (this.drawArc()) {
          this.showArc(null, false);
          this.setStartFromEnd();
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
  actionMouseUp(mode) {
    this.eraseCoordinate();

    if (isDrawingFreehand(mode)) {
      if (this.isDrawing()) {
        this.setDrawing(false);
        this.eraseStartCoordinates();
        this.saveCanvasPicture();
      }
    }
  }

  actionMouseLeave(mode) {
    if (isDrawingFreehand(mode)) {
      this.setDrawing(false);
      this.eraseStartCoordinates();
    }
  }
}
