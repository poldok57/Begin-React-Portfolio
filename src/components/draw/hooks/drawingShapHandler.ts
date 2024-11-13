import { Coordinate, Area } from "@/lib/canvas/types";
import {
  AllParams,
  DRAWING_MODES,
  ParamsGeneral,
} from "@/lib/canvas/canvas-defines";
import { BORDER, mousePointer, isInside } from "@/lib/mouse-position";
import { isInsideSquare } from "@/lib/square-position";
import { alertMessage } from "@/components/alert-messages/alertMessage";

import { drawingHandler, returnMouseDown } from "./drawingHandler";
import { CanvasShape } from "@/lib/canvas/CanvasShape";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [120, 120];

export abstract class drawingShapeHandler extends drawingHandler {
  protected fixed: boolean = false;
  protected resizingBorder: string | null = null;
  protected offset: Coordinate | null = null;
  protected shape: CanvasShape;

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);

    this.fixed = false;
    this.resizingBorder = null;
    this.offset = null;
    this.shape = new CanvasShape();
  }

  initData(initData: AllParams) {
    this.shape.initData(initData);
    if (!this.context) return;
    this.shape.setDataSize({
      x: this.context.canvas.width / 2 - SQUARE_WIDTH / 2,
      y: this.context.canvas.height / 2 - SQUARE_HEIGHT / 2,
      width: SQUARE_WIDTH,
      height: SQUARE_HEIGHT,
    });
    this.shape.setWithAllButtons(true);
  }
  changeData(param: AllParams) {
    this.shape.changeData(param);
    this.lockRatio = param.lockRatio;
  }

  getType() {
    return this.shape.getType();
  }

  setCoordinates(coord: Coordinate) {
    this.coordinates = coord;
    if (this.coordinates && this.offset && !this.fixed) {
      const pos: Coordinate = {
        x: this.coordinates.x + this.offset.x,
        y: this.coordinates.y + this.offset.y,
      };

      this.shape.setDataSize(pos);
    }
    return this.coordinates;
  }

  setResizing(value: string | null) {
    this.resizingBorder = value;
  }

  setFixed(value: boolean) {
    this.fixed = value;
  }
  isFixed() {
    return this.fixed;
  }

  eraseOffset() {
    this.offset = null;
  }
  calculOffset() {
    if (!this.coordinates) return;
    const size: Area = this.shape.getDataSize();

    this.offset = {
      x: size.x - this.coordinates.x,
      y: size.y - this.coordinates.y,
    };
  }

  addData(data: AllParams) {
    this.shape.addData(data);
  }

  setDataGeneral(data: ParamsGeneral) {
    this.shape.setDataGeneral(data);
  }

  setWithResize(value: boolean) {
    this.shape.setWithResize(value);
  }

  /**
   * Function to resize the square on the canvas
   */
  resizingSquare(witchBorder: string): void {
    this.clearTemporyCanvas();

    if (!this.coordinates || !this.ctxTempory) return;

    this.shape.resizingElement(
      this.ctxTempory,
      this.coordinates,
      this.lockRatio,
      witchBorder
    );
  }

  /**
   * Function to draw an element on the MAIN canvas
   */
  validDrawedElement(withOffset: boolean = false) {
    if (!this.context) {
      console.error("context is null");
      return;
    }
    this.shape.draw(this.context, false);
    this.saveCanvasPicture();
    this.clearTemporyCanvas();
    if (withOffset) {
      // add 15px to the size to avoid the shape to be one on the other
      const size = this.shape.getDataSize();
      this.shape.setDataSize({
        ...size,
        ...{ x: size.x + 15, y: size.y + 15 },
      });
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing(opacity: number = 0, mouseOnShape: string | null = null) {
    if (opacity > 0 && this.ctxTempory) this.ctxTempory.globalAlpha = opacity;
    this.shape.draw(this.ctxTempory, true, null);
    this.lastMouseOnShape = mouseOnShape;
  }

  /**
   * Function to follow the cursor on the canvas
   * @param {number} opacity - opacity of the element
   */
  followCursorOnElement(opacity: number) {
    let cursorType = "default";

    if (!this.ctxTempory || !this.coordinates) return cursorType;

    const mouseOnShape = this.shape.handleMouseOnShape(
      this.mCanvas,
      this.coordinates
    );

    if (mouseOnShape) {
      cursorType = mousePointer(mouseOnShape);

      if (isInside(mouseOnShape)) {
        // show real color when mouse is inside the square
        this.ctxTempory.globalAlpha = opacity;
      }
    }
    if (mouseOnShape !== this.lastMouseOnShape) {
      this.shape.draw(this.ctxTempory, true, mouseOnShape);

      this.lastMouseOnShape = mouseOnShape;
    }

    return cursorType;
  }

  /**
   * Function to handle the mouse down event
   * @param {string} mode - drawing mode
   * @param {MouseEvent} event - mouse event
   */
  actionMouseDown(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): returnMouseDown {
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(coord);

    const mouseOnShape = this.shape.handleMouseOnShape(
      this.mCanvas,
      this.coordinates
    );

    if (mouseOnShape) {
      // Clic on the shape --------
      if (mouseOnShape === BORDER.INSIDE) {
        this.calculOffset();
        pointer = "pointer";
        this.setFixed(false);
      } else if (mouseOnShape === BORDER.ON_BUTTON) {
        pointer = "pointer";
        this.validDrawedElement(true);
        toReset = true;
      } else if (mouseOnShape === BORDER.ON_BUTTON_LEFT) {
        this.shape.changeRotation(-Math.PI / 16);
        this.refreshDrawing(0, mouseOnShape);
      } else if (mouseOnShape === BORDER.ON_BUTTON_RIGHT) {
        this.shape.changeRotation(Math.PI / 16);
        this.refreshDrawing(0, mouseOnShape);
      } else {
        alertMessage("resizing: " + mouseOnShape);
        this.setResizing(mouseOnShape);
      }
    }
    return { toReset, toContinue: false, pointer } as returnMouseDown;
  }

  memorizeSelectedArea(_area: Area | null = null) {}

  /**
   * Function to handle the mouse move event
   * @param {MouseEvent} event - mouse event
   * @param {Coordinate} coord - coordinates of the mouse
   * @returns {string | null} - cursor type
   */
  actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null {
    this.setCoordinates(coord);

    const type = this.shape.getType();

    if (this.resizingBorder !== null) {
      this.resizingSquare(this.resizingBorder);
      if (type === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return null;
    }
    if (!this.isFixed()) {
      this.shape.draw(this.ctxTempory, true, BORDER.INSIDE);

      if (type === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return "pointer";
    }

    return this.followCursorOnElement(this.shape.getOpacity());
  }

  actionMouseUp() {
    this.setFixed(true);
    this.setResizing(null);

    if (this.ctxTempory === null) return;

    if (isInsideSquare(this.coordinates, this.shape.getDataSize())) {
      this.ctxTempory.globalAlpha = this.shape.getOpacity();
      this.shape.draw(this.ctxTempory, true, BORDER.INSIDE);
    }
  }
  /**
   * Function to handle the mouse leave event
   */
  actionMouseLeave() {}

  /**
   * Function to validate the action on the canvas (Enter key pressed)
   */
  actionValid() {
    this.validDrawedElement(true);
  }

  /**
   * Function to end the action on the canvas affter changing the mode
   */
  endAction() {
    this.setFixed(true);
    this.setResizing(null);
    this.clearTemporyCanvas();
    this.eraseOffset();
  }
}
