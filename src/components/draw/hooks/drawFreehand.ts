import { Coordinate } from "@/lib/canvas/types";
import { basicLine } from "@/lib/canvas/canvas-basic";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  AllParams,
  ParamsGeneral,
  CanvasPointsData,
} from "@/lib/canvas/canvas-defines";
import { CanvasFreeCurve } from "@/lib/canvas/CanvasFreeCurve";
import { MouseCircle } from "./MouseCircle";
import { BORDER, isBorder } from "@/lib/mouse-position";

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
  private mouseCircle: MouseCircle;
  private modificationMode: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporaryCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void,
    storeName?: string | null
  ) {
    super(canvas, canvasContext, temporaryCanvas, setMode, storeName);
    this.typeHandler = DRAWING_MODES.DRAW;
    this.freeCurve = new CanvasFreeCurve();
    this.mouseCircle = new MouseCircle();
    this.setType(DRAWING_MODES.DRAW);
    this.extendedMouseArea = false;
  }

  private setMouseCircleParams(type: string) {
    if (type === DRAWING_MODES.DRAW) {
      this.mouseCircle.setParams({
        color: "#ffff00",
        radius: 40,
        filled: true,
        globalAlpha: 0.28,
      });
    } else {
      this.mouseCircle.setParams({
        color: "#ffaaaa",
        radius: 35,
        filled: true,
        globalAlpha: 0.4,
      });
    }
  }

  private setMousePencilPointParams() {
    if (this.getType() === DRAWING_MODES.DRAW) {
      this.mouseCircle.setPencilPointParams({
        color: this.general.color,
        diameter: this.general.lineWidth * this.scale,
        globalAlpha: this.general.opacity,
      });
    } else {
      this.mouseCircle.setPencilPointParams({
        color: "#f0b0b0",
        diameter: this.general.lineWidth * this.scale,
        globalAlpha: 0.8,
        hatched: true,
      });
    }
  }

  setType(type: string) {
    const previousType = this.getType();
    super.setType(type);
    if (previousType !== type) {
      this.mouseCircle.clear();
    }
    this.setMouseCircleParams(type);
  }

  setScale(scale: number): void {
    super.setScale(scale);
    this.freeCurve.setScale(scale);
    this.setMousePencilPointParams();
  }

  setDataGeneral(dataGeneral: ParamsGeneral) {
    this.general = { ...dataGeneral };
    this.freeCurve.setParamsGeneral(dataGeneral);
    this.setMousePencilPointParams();
  }

  changeData(data: AllParams): void {
    this.setDataGeneral(data.general);
    if (this.ctxTemporary === null) return;
    this.ctxTemporary.lineWidth = data.general.lineWidth * this.scale;
    this.ctxTemporary.strokeStyle = data.general.color;
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
      this.ctxTemporary as CanvasRenderingContext2D,
      true
    );
  }

  hightLightDrawing() {
    this.freeCurve.hightLightDrawing(
      this.ctxTemporary as CanvasRenderingContext2D
    );
  }

  /**
   * Function follow the cursor on the canvas
   * @param {DRAWING_MODES} mode
   */
  followCursor(event: MouseEvent | TouchEvent) {
    if (this.finishedDrawing) {
      return "move";
    }

    this.mouseCircle.setPosition(event);
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
        this.ctxTemporary,
        event,
        this.getCoordinates() as Coordinate,
        this.resizingBorder
      );
    }

    if (this.isDrawing()) {
      if (this.getType() === DRAWING_MODES.DRAW) {
        const ctxTemporary = this.ctxTemporary;
        if (ctxTemporary === null) {
          console.error("ctxTemporary is null");
          return null;
        }
        if (this.freeCurve.delayAddPoint(this.coordinates as Coordinate)) {
          ctxTemporary.strokeStyle = this.general.color;
          ctxTemporary.lineWidth = this.general.lineWidth;
          ctxTemporary.lineCap = "round";
          // this.clearTemporaryCanvas();
          this.freeCurve.debounceDraw(ctxTemporary, false);
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
    return this.followCursor(event) as string;
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
        this.ctxTemporary,
        this.getCoordinates() as Coordinate
      );
      switch (mouseOnRectangle) {
        case BORDER.ON_BUTTON:
          // path has been validated
          this.freeCurve.draw(this.context as CanvasRenderingContext2D, false);
          this.clearTemporaryCanvas();
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
      const ctx = this.ctxTemporary;
      if (ctx === null) {
        console.error("ctxTemporary is null");
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

        this.mouseCircle.hide();
        this.freeCurve.debounceDraw(
          this.ctxTemporary as CanvasRenderingContext2D,
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
    this.mouseCircle.hide();
    this.clearTemporaryCanvas();

    if (this.isDrawing()) {
      this.actionMouseUp();
    }
    this.setResizingBorder(null);
  }

  actionAbort() {
    this.finishedDrawing = false;
    this.freeCurve.clearPoints();
    this.clearTemporaryCanvas();
    this.setDrawing(false);
    this.setResizingBorder(null);
    return null;
  }

  endAction() {
    this.mouseCircle.hide();
    this.setDrawing(false);
    this.clearTemporaryCanvas();
    this.setResizingBorder(null);
  }

  actionMouseDblClick() {
    if (this.freeCurve) {
      this.freeCurve.eraseResizing();
      this.refreshDrawing();
    }
  }
}
