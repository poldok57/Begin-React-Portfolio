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
} from "@/lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import { CanvasPath } from "@/lib/canvas/CanvasPath";

import { MODE_PATH_AUTO } from "../DrawControlLine";
/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawLine extends drawingHandler {
  private line: CanvasLine;
  private path: CanvasPath | null = null;
  private withPath: boolean = false;
  private finishedDrawing: boolean = false;
  private lastCoordinates: Coordinate | null = null;

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
  }

  setCoordinates(coord: Coordinate) {
    this.line.setCoordinates(coord);
    return this.line.getCoordinates() as Coordinate;
  }

  getCoordinates() {
    return this.line.getCoordinates() as Coordinate;
  }

  setDataGeneral(dataGeneral: ParamsGeneral) {
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
    if (MODE_PATH_AUTO) {
      this.withPath = true;
      this.path = null;
      // starting mode path
      this.line.eraseStartCoordinates();
    }
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

  initPath = () => {
    this.path = new CanvasPath(this.line as LinePath);
    this.withPath = true;
    this.finishedDrawing = false;
  };

  addLineToPath() {
    if (!this.path) {
      this.initPath();
    }
    if (this.path) {
      this.path.addLine(this.line as LinePath);
    }
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
    if (this.withPath && this.path) {
      this.path.draw(this.ctxTempory);
    }
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

    this.clearTemporyCanvas();
    let cursorType = "default";

    if (this.withPath && this.path) {
      this.path.draw(ctxMouse);
      // action after the path is closed
      if (this.finishedDrawing) {
        console.log("follow Path double --- to verify", this.path);

        if (this.path.isInArea(this.line.getCoordinates() as Coordinate)) {
          cursorType = "pointer";
          if (this.path.findAngle(this.line.getCoordinates() as Coordinate)) {
            cursorType = "move";
          }
        }
        return cursorType;
      }
    }
    const coord = this.line.getCoordinates() as Coordinate;
    // console.log("follow", coord);

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

  showLineAndArcInPath() {
    let toContinue = false;
    switch (this.getType()) {
      case DRAWING_MODES.LINE:
      case DRAWING_MODES.ARC:
        if (!this.path) {
          this.initPath();
        } else if (this.line.setPositions()) {
          this.line.show(this.ctxTempory);
          this.addLineToPath();
          this.line.setStartFromEnd();
        }
        this.clearTemporyCanvas();
        this.path?.draw(this.ctxTempory);

        toContinue = true;
        break;
    }
    this.line.show(this.ctxTempory);
    return toContinue;
  }

  showLineAndArc() {
    if (this.line.setPositions()) {
      this.line.show();
      this.line.setStartFromEnd();
      this.saveCanvasPicture(this.line.getStartCoordinates() as Coordinate);
      return false;
    }
    return true;
  }

  validatePath() {
    if (this.path) {
      // path has been validated
      this.path.draw(this.context, false);
      this.clearTemporyCanvas();
      this.withPath = MODE_PATH_AUTO;
      this.finishedDrawing = false;
      this.saveCanvasPicture(null);
      this.line.eraseStartCoordinates();
    }
  }

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
      return;
    }
    // Vérifier si coord est proche de line.getStartCoordinates()
    const startCoord = this.line.getStartCoordinates();
    console.log("startCoord", startCoord, "coord", coord);
    // clic near end of last line
    if (
      startCoord &&
      Math.abs(startCoord.x - coord.x) < MARGIN_POINT &&
      Math.abs(startCoord.y - coord.y) < MARGIN_POINT &&
      this.withPath &&
      this.path &&
      this.path.getItemsLength() >= 2
    ) {
      this.path.cancelLastLine();

      // Récupérer le dernier élément du path
      const lastLine: LinePath | null = this.path?.getLastLine() as LinePath;

      if (lastLine) {
        const lastCoord = lastLine.end as Coordinate;
        this.line.setStartCoordinates(lastCoord);

        console.log("clic on last line", lastCoord);
      }
    }
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
      return { toContinue: false, toReset: false, pointer: "default" };
    }
    // color and width painting
    this.setCoordinates(coord);
    let toContinue = false;
    const pointer = "none";
    let changeMode = null;

    if (this.withPath) {
      // mouse down on path
      if (this.finishedDrawing && this.path) {
        if (
          this.path.mouseDown(
            this.ctxTempory,
            this.line.getCoordinates() as Coordinate
          )
        ) {
          // path has been validated
          this.validatePath();
          return {
            toContinue: true,
            toReset: false,
            pointer: "move",
            changeMode: DRAWING_MODES.END_PATH,
          };
        }
      } else {
        toContinue = this.showLineAndArcInPath();
      }
    } else {
      if (this.getType() === DRAWING_MODES.PATH) {
        if (!this.withPath) {
          // starting mode path
          this.line.setStartCoordinates();
          this.initPath();
        }
        changeMode = DRAWING_MODES.LINE;
      } else {
        this.clicOnArcEnd(coord);
        toContinue = this.showLineAndArc();
      }
    }
    return {
      toContinue,
      toReset: false,
      pointer,
      changeMode,
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
    }

    switch (this.getType()) {
      case DRAWING_MODES.PATH:
        this.initPath();
        return { toContinue: false, changeMode: DRAWING_MODES.LINE };
      case DRAWING_MODES.ARC:
        this.clicOnArcEnd(coord);
        break;
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
    if (this.withPath && this.path) {
      this.showLineAndArcInPath();
    } else {
      this.showLineAndArc();
      this.clearTemporyCanvas();
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

    this.clearTemporyCanvas();
    // console.log("actionMouseUp", this.withPath, this.path);
    if (this.withPath && this.path) {
      this.path?.draw(this.ctxTempory, true);
    }
  }

  actionMouseLeave() {
    if (this.withPath && this.finishedDrawing) {
      this.path?.eraseAngleCoordFound();
      return this.followCursorOnFinisedPath(null) as string;
    }
    clearCanvasByCtx(this.ctxTempory);
  }

  // escape action
  actionAbort(): void {
    if (this.path && this.withPath) {
      if (this.finishedDrawing) {
        this.finishedDrawing = false;
        return;
      }
      if (this.path.cancelLastLine()) {
        this.clearTemporyCanvas();
        this.path.draw(this.ctxTempory);
        this.path?.eraseAngleCoordFound();
        const lastLine = this.path.getLastLine();
        if (lastLine && (lastLine as LinePath).end) {
          this.line.setStartCoordinates((lastLine as LinePath).end);
        }
        return;
      }
      this.withPath = false;
      this.line.eraseStartCoordinates();
    }

    this.clearTemporyCanvas();
    this.line.eraseEndCoordinates();
  }

  actionValid() {
    if (this.withPath && this.path) {
      this.clearTemporyCanvas();
      this.path.draw(this.context, false);
      this.saveCanvasPicture(null);
      this.withPath = false;
      this.finishedDrawing = false;
      this.line.eraseStartCoordinates();

      // console.log("actionValid", this.getType());
      this.setMode(DRAWING_MODES.END_PATH);
    }
  }

  endAction(nextMode: string = DRAWING_MODES.DRAW) {
    if (!isDrawingLine(nextMode)) {
      this.clearTemporyCanvas();
      if (this.withPath && this.path) {
        this.path.draw(this.context, false);
        this.saveCanvasPicture(this.line.getStartCoordinates() as Coordinate);
        this.withPath = false;
        this.line.eraseStartCoordinates();
      }
      this.line.eraseEndCoordinates();
    } else if (this.getType() === DRAWING_MODES.ARC) {
      this.line.eraseCoordinate();
    }
    this.clearTemporyCanvas();
  }

  actionEndPath(eventAction: string) {
    console.log("actionEndPath", eventAction);
    if (this.withPath && this.path) {
      // console.log("close path", this.path);
      if (eventAction === DRAWING_MODES.CLOSE_PATH) {
        this.path.close();
      }
      this.path.setFinished(true);
      this.finishedDrawing = true;
      this.clearTemporyCanvas();
      this.path.draw(this.ctxTempory);
    }
  }
}
