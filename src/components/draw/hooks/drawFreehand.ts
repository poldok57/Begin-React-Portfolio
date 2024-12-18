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
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";

import { throttle } from "@/lib/utils/throttle";
import { BORDER } from "@/lib/mouse-position";

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
    if (this.finishedDrawing) {
      return "move";
    }

    const ctxTempory = this.ctxTempory;
    const ctxMouse = this.ctxMouse ?? ctxTempory;

    if (ctxMouse === null || ctxTempory === null) {
      console.error("ctxTempory is null");
      return;
    }

    if (this.ctxMouse === null) {
      this.clearTemporyCanvas();
      // this.path?.draw(this.ctxTempory, this.withPath);
    } else {
      this.clearMouseCanvas();
    }

    ctxMouse.globalAlpha = 0.4;
    ctxMouse.lineWidth = this.general.lineWidth;
    ctxMouse.strokeStyle = this.general.color;

    const coord = this.getCoordinates() as Coordinate;

    switch (this.getType()) {
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxMouse, coord, mouseCircle);
        drawPoint({
          context: ctxMouse,
          coordinate: coord,
        } as drawingCircle);
        break;
      case DRAWING_MODES.ERASE:
        ctxTempory.globalAlpha = 0.7;
        hightLightMouseCursor(ctxMouse, coord, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        ctxTempory.globalAlpha = 0.5;
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
        const ctxTempory = this.ctxTempory;
        if (ctxTempory === null) {
          console.error("ctxTempory is null");
          return null;
        }
        if (this.freeCurve.delayAddPoint(this.coordinates as Coordinate)) {
          ctxTempory.strokeStyle = this.general.color;
          ctxTempory.lineWidth = this.general.lineWidth;
          this.clearTemporyCanvas();
          this.freeCurve.draw(ctxTempory, false);
        }
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
    // color and width painting
    this.setCoordinates(coord);

    if (this.finishedDrawing && this.freeCurve) {
      const mouseOnRectangle = this.freeCurve.mouseDown(
        this.ctxTempory,
        this.getCoordinates() as Coordinate
      );
      switch (mouseOnRectangle) {
        case BORDER.ON_BUTTON:
          // path has been validated
          this.freeCurve.draw(this.context as CanvasRenderingContext2D, false);
          this.clearTemporyCanvas();
          this.finishedDrawing = false;
          this.setDrawing(false);
          this.saveCanvasPicture(null);
          this.freeCurve.clearPoints();

          event.stopPropagation();
          return {
            changeMode: DRAWING_MODES.FIND,
          };
        case BORDER.ON_BUTTON_DELETE: {
          const deleteId = this.freeCurve.getDataId();
          if (!deleteId) {
            this.actionAbort();
          } else {
            return {
              toReset: true,
              deleteId,
            };
          }
        }
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
    this.coordinates = null;

    if (this.isDrawing()) {
      if (this.getType() === DRAWING_MODES.DRAW) {
        this.finishedDrawing = true;
        this.freeCurve.setFinished(true);
        this.clearTemporyCanvas();
        this.clearMouseCanvas();
        this.freeCurve.draw(this.ctxTempory as CanvasRenderingContext2D, true);
      }
      this.setDrawing(false);
    }
  }

  actionMouseLeave() {
    if (this.finishedDrawing) {
      return;
    }
    this.clearTemporyCanvas();
    this.clearMouseCanvas();

    if (this.isDrawing()) {
      this.setDrawing(false);
      this.validCurve();
    }
  }

  actionAbort() {
    this.finishedDrawing = false;
    this.freeCurve.clearPoints();
    this.clearTemporyCanvas();
    this.clearMouseCanvas();
    this.setDrawing(false);
    return null;
  }

  endAction() {
    this.setDrawing(false);
    this.clearTemporyCanvas();
    this.clearMouseCanvas();
  }
}
