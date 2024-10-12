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
} from "../../../lib/canvas/canvas-defines";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import { CanvasPath } from "@/lib/canvas/CanvasPath";

/**
 * DrawLine class , manager all actions to draw a line on the canvas
 */
export class drawLine extends drawingHandler {
  private line: CanvasLine;
  private path: CanvasPath | null = null;
  private withPath: boolean = false;
  private pathIsClosed: boolean = false;
  private lastCoordinates: Coordinate | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.line = new CanvasLine(canvas);
    this.ctxTempory = null;

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

  setCoordinates(event: MouseEvent) {
    if (this.mCanvas !== null) {
      this.line.setCoordinates(event, this.mCanvas);
    }
    return this.line.getCoordinates() as Coordinate;
  }

  getCoordinates() {
    return this.line.getCoordinates() as Coordinate;
  }

  setDataGeneral(data: ParamsGeneral) {
    this.line.setLineWidth(data.lineWidth);
    this.line.setStrokeStyle(data.color);

    if (this.ctxTempory !== null) {
      this.ctxTempory.lineWidth = data.lineWidth;
      this.ctxTempory.strokeStyle = data.color;
    }
  }

  initData(initData: AllParams) {
    this.setType(initData.mode);
    this.setDataGeneral(initData.general);
  }
  changeData(data: AllParams) {
    this.setDataGeneral(data.general);
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
    this.pathIsClosed = false;
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
      if (this.pathIsClosed) {
        if (this.path.isInRectangle(this.line.getCoordinates() as Coordinate)) {
          cursorType = "pointer";
          if (this.path.findAngle(this.line.getCoordinates() as Coordinate)) {
            cursorType = "move";
          }
        }
        return cursorType;
      }
    }

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
    }
    return cursorType as string;
  }

  /**
   * Function follow the cursor on the canvas
   */
  followCursorOnPath(btnPressed: boolean) {
    if (this.path) {
      return this.path.mouseOverPath(
        this.ctxTempory,
        this.line.getCoordinates() as Coordinate,
        btnPressed
      );
    }
    return "default";
  }

  /**
   * Function who recieve the mouse move event
   */
  actionMouseMove(event: MouseEvent) {
    this.line.setCoordinates(event);

    if (this.withPath && this.pathIsClosed) {
      const btnPressed = event.buttons === 1;
      return this.followCursorOnPath(btnPressed) as string;
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
    // first point must be inside the canvas
    if (
      !mouseIsInsideComponent(event, this.mCanvas) &&
      this.line.getStartCoordinates() == null
    ) {
      return { toContinue: false, toReset: false, pointer: "default" };
    }
    // color and width painting
    this.setCoordinates(event);
    let toContinue = false;
    const pointer = "none";
    let changeMode = null;

    if (this.withPath) {
      if (this.pathIsClosed && this.path) {
        if (
          this.path.mouseDown(
            this.ctxTempory,
            this.line.getCoordinates() as Coordinate
          )
        ) {
          this.path.draw(this.context, false);
          this.withPath = false;
          this.pathIsClosed = false;
          this.saveCanvasPicture(null);
          this.line.eraseStartCoordinates();
          return {
            toContinue: true,
            toReset: false,
            pointer: "move",
            changeMode: DRAWING_MODES.LINE,
          };
        }
      } else {
        switch (this.getType()) {
          case DRAWING_MODES.LINE:
          case DRAWING_MODES.ARC:
            if (this.line.setPositions()) {
              this.line.show(this.ctxTempory);
              this.addLineToPath();
              this.line.setStartFromEnd();
            }

            this.path?.draw(this.ctxTempory);

            toContinue = true;
            break;
        }
      }
    } else {
      switch (this.getType()) {
        case DRAWING_MODES.PATH:
          if (!this.withPath) {
            // starting mode path
            this.line.setStartCoordinates();
            this.initPath();
          }
          changeMode = DRAWING_MODES.LINE;
          break;
        case DRAWING_MODES.LINE:
        case DRAWING_MODES.ARC:
          if (this.line.setPositions()) {
            this.line.show();
            this.line.setStartFromEnd();
            this.saveCanvasPicture(
              this.line.getStartCoordinates() as Coordinate
            );
          }
          toContinue = true;
          break;
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
   * Function to stop drawing on the canvas
   */
  actionMouseUp() {
    this.line.eraseCoordinate();
  }

  actionMouseLeave() {
    if (this.withPath && this.pathIsClosed) {
      return this.followCursorOnPath(false) as string;
    }
    clearCanvasByCtx(this.ctxTempory);
  }

  actionAbort(): void {
    this.clearTemporyCanvas();
    this.line.eraseLastCoordinates();
    this.withPath = false;
    this.path = null;
  }

  endAction(nextMode: string = DRAWING_MODES.DRAW) {
    if (!isDrawingLine(nextMode)) {
      this.clearTemporyCanvas();
      this.line.eraseLastCoordinates();
    }
    clearCanvasByCtx(this.ctxTempory);
  }

  actionClosePath() {
    if (this.withPath && this.path) {
      // console.log("close path", this.path);
      this.path.close();
      this.pathIsClosed = true;
      this.clearTemporyCanvas();
      this.path.draw(this.ctxTempory);
    }
  }
}
