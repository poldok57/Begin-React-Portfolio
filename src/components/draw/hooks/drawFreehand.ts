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

// import { throttle } from "@/lib/utils/throttle";
import { BORDER, isBorder } from "@/lib/mouse-position";
import { scaledCoordinate } from "@/lib/utils/scaledSize";

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
  private modificationMode: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void,
    storeName?: string | null
  ) {
    super(canvas, canvasContext, temporyCanvas, setMode, storeName);
    this.freeCurve = new CanvasFreeCurve();
    this.extendedMouseArea = false;
    this.setType(DRAWING_MODES.DRAW);
  }

  setScale(scale: number): void {
    super.setScale(scale);
    this.freeCurve.setScale(scale);
  }

  setDataGeneral(dataGeneral: ParamsGeneral) {
    this.general = { ...dataGeneral };
    this.freeCurve.setParamsGeneral(dataGeneral);
  }

  changeData(data: AllParams): void {
    this.setDataGeneral(data.general);
    if (this.ctxTempory === null) return;
    this.ctxTempory.lineWidth = data.general.lineWidth * this.scale;
    this.ctxTempory.strokeStyle = data.general.color;
  }

  setDrawing(drawing: boolean) {
    this.drawing = drawing;
  }
  isDrawing() {
    return this.drawing;
  }

  setDraw(draw: CanvasPointsData) {
    this.freeCurve.setData(draw, true);

    this.setDrawing(false);
    this.finishedDrawing = true;
    this.modificationMode = true;
  }

  getDraw(): CanvasPointsData | null {
    return this.freeCurve.getData();
  }

  refreshDrawing() {
    // console.log("refreshDrawing free curve");
    this.freeCurve.debounceDraw(
      this.ctxTempory as CanvasRenderingContext2D,
      true
    );
  }

  hightLightDrawing() {
    this.freeCurve.hightLightDrawing(
      this.ctxTempory as CanvasRenderingContext2D
    );
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
    } else {
      this.clearMouseCanvas();
    }

    ctxMouse.globalAlpha = 0.4;
    ctxMouse.lineWidth = this.general.lineWidth * this.scale;
    ctxMouse.strokeStyle = this.general.color;

    const coord = this.getCoordinates() as Coordinate;

    const mouseCoord = scaledCoordinate(coord, this.scale);
    if (!mouseCoord) return "none";

    switch (this.getType()) {
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(ctxMouse, mouseCoord, mouseCircle);
        drawPoint({
          context: ctxMouse,
          coordinate: mouseCoord,
        } as drawingCircle);
        break;
      case DRAWING_MODES.ERASE:
        ctxTempory.globalAlpha = 0.7;
        hightLightMouseCursor(ctxMouse, mouseCoord, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        ctxTempory.globalAlpha = 0.5;
        hatchedCircle({
          context: ctxMouse,
          coordinate: mouseCoord,
          color: "#eee",
          borderColor: "#303030",
        } as drawingCircle);
        break;
    }

    return "none"; //  cursorType;
  }

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
        this.getCoordinates() as Coordinate,
        this.resizingBorder
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
          // this.clearTemporyCanvas();
          this.freeCurve.debounceDraw(ctxTempory, false);
        }
      } else if (this.context) {
        this.context.globalCompositeOperation = "destination-out";

        basicLine(
          this.context as CanvasRenderingContext2D,
          start as Coordinate,
          this.coordinates as Coordinate
        );
        this.context.globalCompositeOperation = "source-over";
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

    // console.log("actionMouseDown", this.finishedDrawing, this.freeCurve);

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
            changeMode: this.modificationMode
              ? DRAWING_MODES.FIND
              : DRAWING_MODES.DRAW,
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
          break;
        }
        default:
          if (mouseOnRectangle && isBorder(mouseOnRectangle)) {
            this.setResizingBorder(mouseOnRectangle);
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
      this.freeCurve.setFinished(true);
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

        this.clearMouseCanvas();
        this.freeCurve.debounceDraw(
          this.ctxTempory as CanvasRenderingContext2D,
          true
        );
      }
      this.setDrawing(false);
    }
    this.setResizingBorder(null);
  }

  actionMouseLeave() {
    if (this.finishedDrawing) {
      return;
    }
    this.clearTemporyCanvas();
    this.clearMouseCanvas();

    if (this.isDrawing()) {
      this.actionMouseUp();
    }
    this.setResizingBorder(null);
  }

  actionAbort() {
    this.finishedDrawing = false;
    this.freeCurve.clearPoints();
    this.clearTemporyCanvas();
    this.clearMouseCanvas();
    this.setDrawing(false);
    this.setResizingBorder(null);
    return null;
  }

  endAction() {
    this.setDrawing(false);
    this.clearTemporyCanvas();
    this.clearMouseCanvas();
    this.setResizingBorder(null);
  }

  actionMouseDblClick() {
    if (this.freeCurve) {
      this.freeCurve.eraseResizing();
      this.refreshDrawing();
    }
  }
}
