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
  ParamsGeneral,
  CanvasPointsData,
} from "../../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";

import { throttle } from "@/lib/utils/throttle";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawFreehand extends drawingHandler {
  private drawing: boolean = false;
  private freeCurve: CanvasFreeCurve;
  private finishedDrawing: boolean = false;
  private general: ParamsGeneral = {
    color: "#000",
    lineWidth: 1,
    opacity: 1,
  };

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);
    this.freeCurve = new CanvasFreeCurve();
    this.extendedMouseArea = false;
    this.setType(DRAWING_MODES.DRAW);
  }

  initData(initData: AllParams): void {
    this.setType(initData.mode);
    this.changeData(initData);
  }

  setDataGeneral(dataGeneral: ParamsGeneral) {
    this.general = { ...dataGeneral };
    this.freeCurve.setParamsGeneral(dataGeneral);
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

  setDraw(draw: CanvasPointsData) {
    this.freeCurve.setData(draw);
    this.freeCurve.setFinished(true);

    this.setDrawing(false);
    this.finishedDrawing = true;
  }

  getDraw(): CanvasPointsData | null {
    return this.freeCurve.getData();
  }

  refreshDrawing() {
    // console.log("refreshDrawing free curve");
    this.clearTemporyCanvas();
    this.freeCurve.draw(this.ctxTempory as CanvasRenderingContext2D, true);
  }
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

    if (this.finishedDrawing) {
      return "move";
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
        ctxTempory.strokeStyle = this.general.color;
        ctxTempory.lineWidth = this.general.lineWidth;
        this.freeCurve.draw(ctxTempory, false);
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
    freeCurve.addItem(coord);
  }

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return null;
    }
    const start: Coordinate | null = this.coordinates;
    this.setCoordinates(coord);

    if (this.finishedDrawing) {
      return this.freeCurve.mouseOverPath(
        this.ctxTempory,
        event,
        this.getCoordinates() as Coordinate
      );
    }

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
  actionMouseDown(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): returnMouseDown {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return { toExtend: false } as returnMouseDown;
    }
    // color and width painting
    this.setCoordinates(coord);

    if (this.finishedDrawing && this.freeCurve) {
      if (
        this.freeCurve.mouseDown(
          this.ctxTempory,
          this.getCoordinates() as Coordinate
        )
      ) {
        // path has been validated
        this.freeCurve.draw(this.context as CanvasRenderingContext2D, false);
        this.clearTemporyCanvas();
        this.finishedDrawing = false;
        this.setDrawing(false);
        this.saveCanvasPicture(null);
        this.freeCurve.clearPoints();
        return {
          pointer: "none",
        };
      }
      return {
        pointer: "grabbing",
      };
    }

    if (this.getType() === DRAWING_MODES.DRAW) {
      const ctx = this.ctxTempory;
      if (ctx === null) {
        console.error("ctxTempory is null");
        return { toExtend: false } as returnMouseDown;
      }

      this.freeCurve.startCurve({
        firstPoint: this.coordinates as Coordinate,
        general: this.general,
      });
    }

    this.setDrawing(true);
    return { toExtend: false, pointer: "none" } as returnMouseDown;
  }

  validCurve() {
    if (this.getType() === DRAWING_MODES.DRAW) {
      this.freeCurve.draw(this.context as CanvasRenderingContext2D);
      this.freeCurve.clearPoints();
      this.saveCanvasPicture();
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
      if (this.getType() === DRAWING_MODES.DRAW) {
        this.finishedDrawing = true;
        this.freeCurve.setFinished(true);
        this.clearTemporyCanvas();
        this.freeCurve.draw(this.ctxTempory as CanvasRenderingContext2D, true);
      }
      this.setDrawing(false);
    }
  }

  actionMouseLeave() {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return;
    }
    if (this.finishedDrawing) {
      return;
    }
    this.clearTemporyCanvas();

    if (this.isDrawing()) {
      this.setDrawing(false);
      this.validCurve();
    }
  }

  actionAbort() {
    this.finishedDrawing = false;
    this.freeCurve.clearPoints();
    this.clearTemporyCanvas();
    this.setDrawing(false);
    return null;
  }

  endAction() {
    if (this.getType() === DRAWING_MODES.PAUSE) {
      return;
    }
    this.setDrawing(false);
    clearCanvasByCtx(this.ctxTempory);
  }
}
