import { mouseIsInsideComponent } from "@/lib/mouse-position";
import { Coordinate, LinePath, LineType } from "@/lib/canvas/types";
import {
  drawingCircle,
  drawPoint,
  hightLightMouseCursor,
} from "@/lib/canvas/canvas-basic";
import { CanvasLine } from "@/lib/canvas/CanvasLine";
import { drawingHandler, returnMouseDown } from "./drawingHandler";

import {
  DRAWING_MODES,
  mouseCircle,
  ParamsGeneral,
  AllParams,
  isDrawingLine,
  ThingsToDraw,
} from "@/lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import { CanvasPath } from "@/lib/canvas/CanvasPath";
import { debounce } from "@/lib/utils/debounce";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawLine extends drawingHandler {
  private line: CanvasLine;
  private path: CanvasPath | null = null;
  private withPath: boolean = false;
  private finishedDrawing: boolean = false;
  private finishedDrawingStep1: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);
    this.line = new CanvasLine(canvas);

    this.setType(DRAWING_MODES.LINE);
  }

  setType(type: string) {
    super.setType(type);
    if (type === DRAWING_MODES.ARC) {
      this.line.setType(LineType.CURVE);
    } else {
      this.line.setType(LineType.LINE);
    }

    // console.log("setType", type);
  }

  setCoordinates(coord: Coordinate) {
    this.line.setCoordinates(coord);
    return this.line.getCoordinates() as Coordinate;
  }

  getCoordinates() {
    return this.line.getCoordinates() as Coordinate;
  }

  setDataGeneral(dataGeneral: ParamsGeneral) {
    if (
      this.path &&
      this.finishedDrawing &&
      this.getType() === DRAWING_MODES.CLOSED_PATH
    ) {
      if (this.finishedDrawingStep1) {
        this.finishedDrawingStep1 = false;
        return;
      }
      // after finised path we can change the color of the path, by the beginning of the path
      this.path.changeParamsGeneral(dataGeneral);
      return;
    }
    this.line.setLineWidth(dataGeneral.lineWidth);
    this.line.setStrokeStyle(dataGeneral.color);
    this.line.setGlobalAlpha(dataGeneral.opacity);

    if (this.ctxTempory !== null) {
      this.ctxTempory.lineWidth = dataGeneral.lineWidth;
      this.ctxTempory.strokeStyle = dataGeneral.color;
    }
  }

  initData(initData: AllParams) {
    this.setType(initData.mode);
    this.setDataGeneral(initData.general);
  }

  changeData(data: AllParams) {
    this.setDataGeneral(data.general);
    if (data.path) {
      this.path?.setParams(this.ctxTempory, data.path);
    }
  }

  setCanvas(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
    if (this.line) this.line.setCanvas(canvas);
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

  initPath = (withPath: boolean = true) => {
    this.path = new CanvasPath(this.line as LinePath);
    this.withPath = withPath;
    this.finishedDrawing = false;
  };

  setDraw(draw: ThingsToDraw) {
    this.path?.setData(draw);
  }
  getDraw(): ThingsToDraw | null {
    return this.path?.getData() as ThingsToDraw | null;
  }
  
  /**
   * Debonce draw of the path
   */
  debouncedDraw = () => {
    if (this.path && this.ctxTempory) {
      this.clearTemporyCanvas();
      this.path.draw(this.ctxTempory, this.withPath);
    }
  };

  drawTmpPath = debounce(this.debouncedDraw, 40);

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

    this.drawTmpPath();
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
   */
  followCursor() {
    const ctxMouse = this.ctxTempory;
    if (ctxMouse === null) {
      console.error("ctxTempory is null");
      return;
    }

    let cursorType = "default";

    this.clearTemporyCanvas();
    this.path?.draw(ctxMouse, this.withPath);

    const coord = this.line.getCoordinates() as Coordinate;

    ctxMouse.globalAlpha = 0.4;
    hightLightMouseCursor(ctxMouse, coord, mouseCircle);
    cursorType = "crosshair";
    if (this.line.getStartCoordinates() == null) {
      // first point of line show a point
      drawPoint({
        context: ctxMouse,
        coordinate: this.line.getCoordinates() as Coordinate,
      } as drawingCircle);
    } else {
      this.line.show(this.ctxTempory, true);

      if (this.ctxTempory) {
        this.line.showLineEnds(this.ctxTempory);
      }
    }
    return cursorType as string;
  }

  /**
   * Function follow the cursor on the canvas
   */
  followCursorOnFinisedPath(event: MouseEvent | TouchEvent | null) {
    if (this.path) {
      return this.path.mouseOverPath(
        this.ctxTempory,
        event,
        this.line.getCoordinates() as Coordinate
      );
    }
    return "default";
  }

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent | TouchEvent, coord: Coordinate) {
    this.line.setCoordinates(coord);

    if (this.withPath && this.finishedDrawing) {
      return this.followCursorOnFinisedPath(event) as string;
    }
    return this.followCursor() as string;
  }

  showLineAndArc(withPath: boolean = true) {
    let toExtend = false;
    switch (this.getType()) {
      case DRAWING_MODES.LINE:
      case DRAWING_MODES.ARC:
        if (!this.path) {
          this.initPath(withPath);
        } else if (this.line.setPositions()) {
          this.line.show(this.ctxTempory);
          this.path.addLine(this.line as LinePath);
          this.line.setStartFromEnd();
        }
        this.drawTmpPath();

        toExtend = true;
        break;
    }
    this.line.show(this.ctxTempory);
    return toExtend;
  }

  validatePath() {
    if (this.path) {
      // path has been validated
      this.saveLastDrawing(false);
      this.withPath = false;
    }
  }

  // search if the mouse click on the end of the arc
  clicOnArcEnd(coord: Coordinate) {
    if (this.getType() !== DRAWING_MODES.ARC) {
      return;
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
        const lastCoord = lastLine.end as Coordinate;
        this.line.setStartCoordinates(lastCoord);

        // console.log("clic on last line", lastCoord);
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
    // console.log("actionMouseDown start:", this.line.getStartCoordinates());
    if (
      this.line.getStartCoordinates() == null &&
      !mouseIsInsideComponent(event, this.mCanvas)
    ) {
      return { toExtend: false, toReset: false, pointer: "default" };
    }
    // color and width painting
    this.setCoordinates(coord);
    let toExtend = false;
    const pointer = "none";

    if (this.withPath) {
      // mouse down on path
      if (this.finishedDrawing && this.path) {
        // mouse down on finised path we can move or validate it
        if (
          this.path.mouseDown(
            this.ctxTempory,
            this.line.getCoordinates() as Coordinate
          )
        ) {
          // path has been validated
          this.validatePath();
          return {
            toExtend: true,
            toReset: false,
            pointer: "move",
            changeMode: DRAWING_MODES.END_PATH,
          };
        }
      } else {
        toExtend = this.showLineAndArc(true);
      }
    } else {
      if (this.clicOnArcEnd(coord)) {
        toExtend = true;
      } else {
        if (this.line.getStartCoordinates() == null) {
          this.line.setStartCoordinates();
          this.initPath(false);
        }
        toExtend = this.showLineAndArc(false);

        if (this.path && this.path.getItemsLength() > 2) {
          // path has been created if we have at least 2 lines
          this.withPath = true;
        }
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
      return {};
    }

    this.setCoordinates(coord);

    // touch a finished path
    if (this.withPath && this.finishedDrawing && this.path) {
      if (
        this.path.mouseDown(
          this.ctxTempory,
          this.line.getCoordinates() as Coordinate
        )
      ) {
        // path has been validated
        this.validatePath();
        this.hasBeenTouched = true;
        return {
          toReset: false,
          changeMode: DRAWING_MODES.END_PATH,
        };
      }
      return {};
    }

    // start a new line
    if (this.line.getStartCoordinates() == null) {
      this.line.setStartCoordinates();
      this.hasBeenTouched = true;
      return {};
    }

    if (this.getType() === DRAWING_MODES.ARC) {
      this.clicOnArcEnd(coord);
    }
    this.followCursor();
    return {};
  }

  /**
   * Function who recieve the touch end event
   */
  actionTouchEnd() {
    if (this.finishedDrawing) {
      return;
    }
    if (this.hasBeenTouched) {
      this.hasBeenTouched = false;
      return;
    }
    if (this.path) {
      this.showLineAndArc(this.withPath);
    }
    if (this.ctxTempory) {
      this.line.showLineEnds(this.ctxTempory, true);
    }
  }
  /**
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    this.line.eraseCoordinate();
    this.path?.eraseAngleCoordFound();

    this.drawTmpPath();
  }

  actionMouseLeave() {
    if (this.withPath && this.finishedDrawing) {
      this.path?.eraseAngleCoordFound();
      return this.followCursorOnFinisedPath(null) as string;
    }
    clearCanvasByCtx(this.ctxTempory);
  }

  /**
   * Function to draw and save the last drawing
   */
  saveLastDrawing(withCoordinates: boolean = false) {
    if (this.path) {
      // draw finised line
      this.clearTemporyCanvas();
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
        this.drawTmpPath();
        this.path?.eraseAngleCoordFound();
        const lastLine = this.path.getLastLine();
        if (lastLine && (lastLine as LinePath).end) {
          this.line.setStartCoordinates((lastLine as LinePath).end);
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

    this.clearTemporyCanvas();
    this.line.eraseEndCoordinates();
    return null;
  }

  actionValid() {
    if (this.withPath && this.path) {
      this.saveLastDrawing(false);

      // console.log("actionValid", this.getType());
      this.setMode(DRAWING_MODES.END_PATH);
    }
  }

  endAction(nextMode: string = DRAWING_MODES.DRAW) {
    if (!isDrawingLine(nextMode)) {
      // if (this.withPath && this.path) {
      if (this.path) {
        this.saveLastDrawing(!this.withPath);
      }
      this.line.eraseEndCoordinates();
    } else if (this.getType() === DRAWING_MODES.ARC) {
      this.line.eraseCoordinate();
    }
    this.clearTemporyCanvas();
  }

  actionEndPath(eventAction: string) {
    if (this.withPath && this.path) {
      // console.log("close path", this.path);
      if (eventAction === DRAWING_MODES.CLOSE_PATH) {
        this.path.close();
      }
      this.path.setFinished(true);
      this.finishedDrawing = true;
      this.finishedDrawingStep1 = true;
      this.drawTmpPath();
    }
  }
}
