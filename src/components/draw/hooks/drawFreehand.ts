import { Coordinate } from "../../../lib/canvas/types";
import {
  basicLine,
  drawingCircle,
  drawPoint,
  hatchedCircle,
  hightLightMouseCursor,
} from "../../../lib/canvas/canvas-basic";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  mouseCircle,
  AllParams,
} from "../../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";

import { throttle } from "@/lib/utils/throttle";

// const thorttleBasicLine = throttle(basicLine, 50);

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawFreehand extends drawingHandler {
  private drawing: boolean = false;
  private freeCurve: CanvasFreeCurve;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.freeCurve = new CanvasFreeCurve();
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
    if (this.ctxTempory === null) return;
    this.ctxTempory.lineWidth = data.general.lineWidth;
    this.ctxTempory.strokeStyle = data.general.color;
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
    this.ctxTempory = canvas.getContext("2d");
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
    const ctxTempory = this.ctxTempory;
    if (ctxTempory === null) {
      console.error("ctxTempory is null");
      return;
    }

    clearCanvasByCtx(ctxTempory);
    ctxTempory.globalAlpha = 0.4;

    const coord = this.getCoordinates() as Coordinate;

    switch (this.getType()) {
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxTempory, coord, mouseCircle);
        drawPoint({
          context: ctxTempory,
          coordinate: coord,
        } as drawingCircle);
        this.freeCurve.draw(ctxTempory);
        break;
      case DRAWING_MODES.ERASE:
        ctxTempory.globalAlpha = 0.7;
        hightLightMouseCursor(ctxTempory, coord, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        ctxTempory.globalAlpha = 0.5;
        hatchedCircle({
          context: ctxTempory,
          coordinate: coord,
          color: "#eee",
          borderColor: "#303030",
        } as drawingCircle);
        break;
    }

    return "none"; //  cursorType;
  }

  thorttleBasicLine = throttle(basicLine, 50);

  memoPoints(freeCurve: CanvasFreeCurve, coord: Coordinate) {
    freeCurve.addPoint(coord);
  }

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent): string | null {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return null;
    }
    const start: Coordinate | null = this.coordinates;
    this.setCoordinates(event);
    if (this.isDrawing()) {
      if (this.getType() === DRAWING_MODES.DRAW) {
        this.freeCurve.delayAddPoint(this.coordinates as Coordinate);
      } else {
        basicLine(
          this.context as CanvasRenderingContext2D,
          start as Coordinate,
          this.coordinates as Coordinate
        );
      }
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
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return { toContinue: false } as returnMouseDown;
    }
    // color and width painting
    this.setCoordinates(event);
    if (this.getType() === DRAWING_MODES.DRAW) {
      this.freeCurve.startCurve({
        firstPoint: this.coordinates as Coordinate,
        globalAlpha: this.data.general.opacity,
        strokeStyle: this.data.general.color,
        lineWidth: this.data.general.lineWidth,
      });
    }

    this.setDrawing(true);
    return { toContinue: false, pointer: "none" } as returnMouseDown;
  }

  endCurve() {
    if (this.getType() === DRAWING_MODES.DRAW) {
      this.freeCurve.draw(this.context as CanvasRenderingContext2D);
      this.freeCurve.clearPoints();
    }
  }
  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return;
    }
    this.coordinates = null;

    if (this.isDrawing()) {
      this.endCurve();

      this.setDrawing(false);
      this.saveCanvasPicture();
    }
  }

  actionMouseLeave() {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return;
    }
    this.clearTemporyCanvas();
    this.setDrawing(false);
    this.endCurve();
  }
  endAction() {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return;
    }
    this.setDrawing(false);

    clearCanvasByCtx(this.ctxTempory);
  }
}
