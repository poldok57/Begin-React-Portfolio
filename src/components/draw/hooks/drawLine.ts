/**
 * DrawLine class , manager all actions to draw a line, a curve or an arrow on the canvas
 * author: Guy Rump
 */

import {
  BORDER,
  isBorder,
  mouseIsInsideComponent,
  mousePointer,
} from "@/lib/mouse-position";
import { Coordinate, LinePath, LineType } from "@/lib/canvas/types";
import { CanvasLine } from "@/lib/canvas/CanvasLine";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  // mouseCircle as mouseCircleType,
  ParamsGeneral,
  AllParams,
  isDrawingLine,
  CanvasPointsData,
  ParamsArrow,
} from "@/lib/canvas/canvas-defines";
import { CanvasPath } from "@/lib/canvas/CanvasPath";
import { MouseCircle } from "./MouseCircle";
import { duplicateCanvas } from "@/lib/canvas/canvas-tools";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawLine extends drawingHandler {
  private line: CanvasLine;
  private path: CanvasPath | null = null;
  private withPath: boolean = false;
  private finishedDrawing: boolean = false;
  private finishedDrawingStep1: boolean = false;
  private toDelete: boolean = false;
  private modificationMode: boolean = false;
  private mouseCircle: MouseCircle;

  private lineCanvas: HTMLCanvasElement | null = null;
  private lineCtx: CanvasRenderingContext2D | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporaryCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void,
    storeName?: string | null
  ) {
    super(canvas, canvasContext, temporaryCanvas, setMode, storeName);

    this.typeHandler = DRAWING_MODES.LINE;
    this.line = new CanvasLine(canvas);

    this.setType(DRAWING_MODES.LINE);
    this.mouseCircle = new MouseCircle();
    this.mouseCircle.setParams({
      color: "#ffff00",
      radius: 40,
      filled: true,
      globalAlpha: 0.4,
    });

    this.createCanvasLine(canvas);
  }

  newElement(params: AllParams) {
    this.createCanvasLine(this.mCanvas);
    this.line.setCanvas(this.mCanvas);
    super.newElement(params);
  }

  /**
   * Create a canvas for temporary line
   * @param mCanvas - the canvas to draw the line
   */
  createCanvasLine(mCanvas: HTMLCanvasElement | null) {
    if (
      (!this.lineCanvas ||
        this.lineCanvas.width != mCanvas?.width ||
        this.lineCanvas.height != mCanvas?.height) &&
      mCanvas
    ) {
      this.lineCanvas = duplicateCanvas(mCanvas, false);
      this.lineCtx = this.lineCanvas?.getContext("2d");
      if (this.lineCtx) {
        this.lineCtx.lineCap = "round";
        this.lineCtx.globalAlpha = 0.4;
        this.lineCtx.lineWidth = 5;
        this.lineCtx.strokeStyle = "#808080";
      }
    }
    this.clearLineCanvas();
  }

  /**
   * Clear the canvas for temporary line
   */
  clearLineCanvas() {
    if (this.lineCtx && this.lineCanvas) {
      this.lineCtx.clearRect(
        0,
        0,
        this.lineCanvas.width,
        this.lineCanvas.height
      );
    }
  }

  setType(type: string) {
    super.setType(type);
    if (type === DRAWING_MODES.ARC) {
      this.line.setType(LineType.CURVE);
    } else if (type === DRAWING_MODES.ARROW) {
      this.line.setType(LineType.ARROW);
    } else {
      this.line.setType(LineType.LINE);
    }
    if (type === DRAWING_MODES.ARROW) {
      this.path?.setDataType(DRAWING_MODES.ARROW);
    } else {
      this.path?.setDataType(DRAWING_MODES.LINES_PATH);
    }
  }

  setScale(scale: number): void {
    super.setScale(scale);
    this.line.setScale(scale);
    this.path?.setScale(scale);
  }

  setCoordinates(coord: Coordinate) {
    this.line.setCoordinates(coord);
    return this.line.getCoordinates() as Coordinate;
  }

  getCoordinates() {
    return this.line.getCoordinates() as Coordinate;
  }

  private setMousePencilPointParams(paramsGeneral: ParamsGeneral) {
    this.mouseCircle.setPencilPointParams({
      color: paramsGeneral.color,
      diameter: paramsGeneral.lineWidth * this.scale,
      globalAlpha: paramsGeneral.opacity,
    });
  }

  setDataParams(dataGeneral: ParamsGeneral, dataArrow: ParamsArrow) {
    if (this.path && this.withPath && this.finishedDrawing) {
      if (this.finishedDrawingStep1) {
        this.finishedDrawingStep1 = false;
        return;
      }
      // after finised path we can change the color of the path, by the beginning of the path
      this.path.changeParams(dataGeneral, dataArrow);
      return;
    }
    this.line.setLineWidth(dataGeneral.lineWidth);
    this.line.setStrokeStyle(dataGeneral.color);
    this.line.setGlobalAlpha(dataGeneral.opacity);

    if (this.ctxTemporary !== null) {
      this.ctxTemporary.lineWidth = dataGeneral.lineWidth * this.scale;
      this.ctxTemporary.strokeStyle = dataGeneral.color;
    }
    this.setMousePencilPointParams(dataGeneral);
  }

  initData(data: AllParams) {
    if (data.mode === DRAWING_MODES.ARROW) {
      this.path?.setDataType(DRAWING_MODES.ARROW);
    } else {
      this.path?.setDataType(DRAWING_MODES.LINES_PATH);
    }
    super.initData(data);
    // this.setDataParams(data.general, data.arrow);
  }

  changeData(data: AllParams) {
    this.setDataParams(data.general, data.arrow);
    if (data.path && this.path) {
      this.path.setParamsPath(this.ctxTemporary, data.path);
    }
    if (data.arrow) {
      this.line.setArrowData(data.arrow);
    }
  }

  /**
   * Set the canvas and transfer the canvas to the line object
   */
  setCanvas(canvas: HTMLCanvasElement) {
    super.setCanvas(canvas);
    if (this.line) this.line.setCanvas(canvas);
  }

  initPath = (withPath: boolean = true) => {
    this.path = new CanvasPath(this.line as LinePath);
    if (this.type === DRAWING_MODES.ARROW) {
      this.path.setDataType(DRAWING_MODES.ARROW);
    }
    this.withPath = withPath;
    this.finishedDrawing = false;
    this.toDelete = false;
    this.line.eraseStartCoordinates();
    this.modificationMode = false;
  };

  setDraw(draw: CanvasPointsData) {
    this.path = new CanvasPath(null);
    this.path.setData(draw, true);
    this.path.setScale(this.scale);
    this.withPath = true;

    this.finishedDrawing = true;
    this.finishedDrawingStep1 = true;
    this.modificationMode = true;
    this.mouseCircle.hide();
  }

  getDraw(): CanvasPointsData | null {
    return this.path?.getData() as CanvasPointsData | null;
  }

  /**
   * Function to show the line on the temporary canvas
   * @param {DRAWING_MODES} mode - mode of the drawing
   * @param {number} opacity - opacity of the line
   */
  showTemporyLine(mode: string, opacity: number = 0) {
    if (this.ctxTemporary === null) {
      return;
    }
    const oldOpacity = this.ctxTemporary.globalAlpha;
    if (opacity > 0) {
      this.ctxTemporary.globalAlpha = opacity;
    }

    this.path?.debounceDraw(this.ctxTemporary, true);

    this.ctxTemporary.globalAlpha = oldOpacity;
  }

  refreshDrawing(opacity: number, _mouseOnShape?: string, _id?: string) {
    // console.log("refreshDrawing", _id);
    this.showTemporyLine(this.getType(), opacity);
  }

  hightLightDrawing() {
    this.path?.hightLightDrawing(this.ctxTemporary as CanvasRenderingContext2D);
  }
  /**
   * Function follow the cursor on the canvas
   */
  followCursor(event: MouseEvent | TouchEvent) {
    const ctxMouse = this.lineCtx ?? this.ctxTemporary;
    if (ctxMouse === null) {
      console.error("ctxTemporary is null");
      return;
    }

    if (this.lineCtx === null) {
      this.clearTemporaryCanvas();
      this.path?.draw(this.ctxTemporary, this.withPath);
    } else {
      this.clearLineCanvas();
    }

    // const coord = this.line.getCoordinates() as Coordinate;

    // const mouseCoord = scaledCoordinate(coord, this.scale);
    // if (!mouseCoord) return "none";
    // ctxMouse.globalAlpha = 0.4;

    if (this.line.getStartCoordinates() == null) {
      this.mouseCircle.setWithPencilPoint(true);
      this.mouseCircle.setPosition(event);
    } else {
      this.mouseCircle.setWithPencilPoint(false);
      this.mouseCircle.setPosition(event);

      this.line.show(ctxMouse, true);
      // this.line.show(this.ctxTemporary, true);

      if (this.ctxTemporary) {
        this.line.showLinesHelpers(ctxMouse);
      }
    }
    return "crosshair" as string;
  }

  /**
   * Function follow the cursor on the canvas
   */
  followCursorOnFinisedPath(event: MouseEvent | TouchEvent | null) {
    if (this.path) {
      return this.path.mouseOverPath(
        this.ctxTemporary,
        event,
        this.line.getCoordinates() as Coordinate,
        this.resizingBorder
      );
    }
    return "default";
  }

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent | TouchEvent, coord: Coordinate) {
    // const coordScaled = scaledCoordinate(coord, this.scale);
    // if (!coordScaled) return "none";
    this.line.setCoordinates(coord);

    if (this.withPath && this.finishedDrawing) {
      return this.followCursorOnFinisedPath(event) as string;
    }
    return this.followCursor(event) as string;
  }

  showLineAndArc(withPath: boolean = true) {
    if (!this.path) {
      this.initPath(withPath);
      return false;
    }

    let toExtend = false;
    const type = this.getType();

    switch (type) {
      case DRAWING_MODES.LINE:
      case DRAWING_MODES.ARC:
      case DRAWING_MODES.ARROW:
        if (this.line.setPositions()) {
          this.line.show(this.ctxTemporary);
          this.path.addLine(this.line as LinePath);
          // if the last item is close to the start point,
          // we can close the path
          if (this.path.isPathClosed()) {
            this.actionEndPath(DRAWING_MODES.CLOSE_PATH);
            this.clearLineCanvas();
            this.mouseCircle.hide();
            toExtend = false;
            break;
          }
          this.line.setStartFromEnd();
          toExtend = true;

          // if we are drawing an arrow and we have 2 points, we can finish the path
          if (type === DRAWING_MODES.ARROW && this.path.getItemsLength() >= 2) {
            this.path.setFinished(true);
            this.clearLineCanvas();
            this.mouseCircle.hide();
            this.withPath = true;
            this.finishedDrawing = true;
            toExtend = false;
          }
        }
        this.clearTemporaryCanvas();
        this.path?.draw(this.ctxTemporary, this.withPath);
        break;
    }

    if (toExtend) {
      this.line.show(this.ctxTemporary);
    }

    return toExtend;
  }

  /**
   * Function to validate the path
   */
  validatePath() {
    if (this.path) {
      // path has been validated
      this.saveLastDrawing(false);
      this.withPath = false;
    }
  }

  /*
   * search if the mouse click on the end of the arc, use to modify the arc
   * @param {Coordinate} coord - the coordinate of the mouse
   * @returns {boolean} true if the mouse click on the end of the arc
   */
  clicOnArcEnd(coord: Coordinate) {
    if (this.getType() !== DRAWING_MODES.ARC) {
      return false;
    }
    const MARGIN_POINT = 10;
    const endCoord = this.line.getEndCoordinates() as Coordinate;
    // console.log("endCoord", endCoord, " coord", coord);
    if (
      endCoord &&
      Math.abs(endCoord.x - coord.x) < MARGIN_POINT &&
      Math.abs(endCoord.y - coord.y) < MARGIN_POINT
    ) {
      // console.log("same point than end");
      this.line.eraseEndCoordinates();
      return true;
    }
    // verify if coord is near to start coordinates
    const startCoord = this.line.getStartCoordinates();
    // clic near end of last line
    if (
      startCoord &&
      this.withPath &&
      this.path &&
      Math.abs(startCoord.x - coord.x) < MARGIN_POINT &&
      Math.abs(startCoord.y - coord.y) < MARGIN_POINT &&
      this.path.getItemsLength() >= 2
    ) {
      this.path.cancelLastLine();

      // get last line of path
      const lastLine: LinePath | null = this.path?.getLastLine() as LinePath;

      if (lastLine) {
        return true;
      }
    }
    return false;
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
    // first point must be inside the canvas
    if (
      this.line.getStartCoordinates() == null &&
      !mouseIsInsideComponent(event, this.mCanvas)
    ) {
      return { toExtend: false, toReset: false, pointer: "default" };
    }
    this.setCoordinates(coord);
    let toExtend = false;
    const pointer = "none";

    // mouse down on finised path we can move or validate it
    if (this.finishedDrawing && this.withPath && this.path) {
      const mouseOnButton = this.path.mouseDown(
        this.ctxTemporary,
        this.line.getCoordinates() as Coordinate
      );

      switch (mouseOnButton) {
        case BORDER.ON_BUTTON:
          // path has been validated
          this.validatePath();
          return {
            pointer: "move",
            changeMode: this.modificationMode
              ? DRAWING_MODES.FIND
              : DRAWING_MODES.LINE,
          };
        case BORDER.ON_BUTTON_DELETE:
          this.toDelete = true;
          return {
            toReset: true,
            deleteId: this.path.getDataId(),
          };
        default:
          if (mouseOnButton && isBorder(mouseOnButton)) {
            //  if we are on a border, we can resize the area
            this.setResizingBorder(mouseOnButton);
          }
          return {
            toReset: false,
            pointer: mousePointer(mouseOnButton ?? ""),
          } as returnMouseDown;
      }
      return {
        toReset: false,
        pointer: "none",
      } as returnMouseDown;
    }

    // if we are drawing an arc and we click on the end of the arc, we can modify the arc
    if (this.clicOnArcEnd(coord)) {
      return {
        toReset: false,
        pointer: "crosshair",
      } as returnMouseDown;
    }

    if (this.line.getStartCoordinates() == null) {
      this.initPath(false);
      // this.line.setStartCoordinates();
    }

    toExtend = this.showLineAndArc(false);

    if (this.path) {
      const itemsLen = this.path.getItemsLength();
      if (itemsLen > 2) {
        // path has been created if we have at least 2 lines
        this.withPath = true;
      }
    }

    return {
      toExtend,
      toReset: false,
      pointer,
    } as returnMouseDown;
  }

  /**
   * Memo a action has been done by touch
   */
  private hasBeenTouched = false;

  /**
   * Function who recieve the touch down event
   * to start drawing on the canvas.
   * @param {TouchEvent} event
   * @param {Coordinate} coord
   * @returns {boolean} to continue or not
   */
  actionTouchDown(event: TouchEvent, coord: Coordinate): returnMouseDown {
    // first point must be inside the canvas
    if (
      this.line.getStartCoordinates() == null &&
      !mouseIsInsideComponent(event, this.mCanvas)
    ) {
      console.log("mouse not inside");
      return {};
    }
    this.setCoordinates(coord);

    // touch a finished path
    if (this.withPath && this.finishedDrawing && this.path) {
      const mouseOnButton = this.path.mouseDown(
        this.ctxTemporary,
        this.line.getCoordinates() as Coordinate
      );
      switch (mouseOnButton) {
        case BORDER.ON_BUTTON:
          // path has been validated
          this.validatePath();
          this.hasBeenTouched = true;
          return {
            toReset: false,
            changeMode: this.modificationMode
              ? DRAWING_MODES.FIND
              : DRAWING_MODES.LINE,
          };
        case BORDER.ON_BUTTON_DELETE:
          this.toDelete = true;
          this.hasBeenTouched = true;
          return {
            toReset: true,
            deleteId: this.path.getDataId(),
          };
        default:
          if (mouseOnButton && isBorder(mouseOnButton)) {
            //  if we are on a border, we can resize the area
            this.setResizingBorder(mouseOnButton);
          }
      }
      return {};
    }

    // start a new line
    if (this.line.getStartCoordinates() == null) {
      this.hasBeenTouched = true;

      this.initPath(false);
      this.line.setStartCoordinates();

      return {};
    }

    // we are drawing a path
    this.withPath = true;

    if (this.getType() === DRAWING_MODES.ARC) {
      this.clicOnArcEnd(coord);
    }
    this.followCursor(event);
    return {};
  }

  /**
   * Function who recieve the touch end event
   */
  actionTouchEnd() {
    if (this.finishedDrawing) {
      this.setResizingBorder(null);
      return;
    }
    if (this.hasBeenTouched) {
      this.hasBeenTouched = false;
      return;
    }

    if (!this.path && this.line.getCoordinates() == null) {
      return;
    }

    this.showLineAndArc(this.withPath);

    if (this.ctxTemporary) {
      this.line.showLinesHelpers(this.ctxTemporary, true);
    }
  }
  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    this.setResizingBorder(null);
    this.line.eraseCoordinates();
    this.path?.eraseAngleCoordFound();

    this.path?.debounceDraw(this.ctxTemporary, true);
  }

  actionMouseLeave() {
    if (this.withPath && this.finishedDrawing) {
      this.path?.eraseAngleCoordFound();
      return this.followCursorOnFinisedPath(null) as string;
    }
    this.clearLineCanvas();
    this.mouseCircle.hide();
  }

  /**
   * Function to draw and save the last drawing
   */
  saveLastDrawing(withCoordinates: boolean = false) {
    if (this.path) {
      // draw finised line
      this.clearTemporaryCanvas();
      this.clearLineCanvas();
      this.mouseCircle.hide();
      this.path.draw(this.context, false);
      this.saveCanvasPicture(
        withCoordinates ? (this.line.getStartCoordinates() as Coordinate) : null
      );
      this.withPath = false;
      this.finishedDrawing = false;
      this.line.eraseStartCoordinates();
      this.path = null;
    }
  }

  // escape action
  actionAbort(): string | null {
    if (this.path && this.withPath) {
      if (this.finishedDrawing) {
        this.finishedDrawing = false;
        this.path.setFinished(false);
        return DRAWING_MODES.LINE;
      }
      if (this.path.cancelLastLine()) {
        this.path?.debounceDraw(this.ctxTemporary, true);
        this.path?.eraseAngleCoordFound();
        const lastPosition = this.path?.getLastPosition();
        if (lastPosition) {
          this.line.setStartCoordinates(lastPosition);
          this.line.eraseCoordinates();
        }
        return null;
      }
      this.withPath = false;
      this.line.eraseStartCoordinates();
    }
    if (this.path && !this.withPath) {
      // draw finised line
      this.saveLastDrawing(true);
    }

    this.clearTemporaryCanvas();
    this.clearLineCanvas();
    this.mouseCircle.hide();
    this.line.eraseEndCoordinates();
    return null;
  }

  actionValid() {
    if (this.withPath && this.path) {
      this.saveLastDrawing(false);

      // console.log("actionValid", this.getType());
      this.setMode(
        this.modificationMode ? DRAWING_MODES.FIND : DRAWING_MODES.LINE
      );
    }
  }

  endAction(nextMode: string = DRAWING_MODES.DRAW) {
    if (this.toDelete) {
      this.toDelete = false;
      this.initPath(false);
      this.clearTemporaryCanvas();
      return;
    }
    if (!isDrawingLine(nextMode)) {
      // if (this.withPath && this.path) {
      // if (this.path) {
      //   this.saveLastDrawing(!this.withPath);
      // }
      this.line.eraseEndCoordinates();
    } else if (this.getType() === DRAWING_MODES.ARC) {
      this.line.eraseCoordinates();
    }
    this.clearTemporaryCanvas();
    this.clearLineCanvas();
    this.mouseCircle.hide();
  }

  actionEndPath(eventAction: string) {
    if (this.withPath && this.path) {
      if (eventAction === DRAWING_MODES.CLOSE_PATH) {
        this.path.close();
      }
      this.path.setFinished(true);
      this.finishedDrawing = true;
      this.finishedDrawingStep1 = true;
      this.path?.debounceDraw(this.ctxTemporary, true);
    }
  }

  actionMouseDblClick() {
    if (this.path) {
      this.path.eraseResizing();
      this.refreshDrawing(1);
    }
  }
}
