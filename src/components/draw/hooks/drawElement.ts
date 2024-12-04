import { Coordinate, Area } from "@/lib/canvas/types";
import {
  AllParams,
  DRAWING_MODES,
  ParamsGeneral,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import {
  BORDER,
  mousePointer,
  isInside,
  isOnTurnButton,
  isBorder,
} from "@/lib/mouse-position";
import { isInsideSquare } from "@/lib/square-position";
import { alertMessage } from "@/components/alert-messages/alertMessage";

import { drawingHandler, returnMouseDown } from "./drawingHandler";
import { CanvasShape } from "@/lib/canvas/CanvasShape";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [120, 120];
const MIN_ROTATION = 7.5;

export class drawElement extends drawingHandler {
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

    this.coordinates = { x: 0, y: 0 };
  }

  setType(type: string): void {
    this.shape.setType(type);
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

  async setDraw(draw: ShapeDefinition) {
    await this.shape.setData(draw);
  }

  getDraw(): ShapeDefinition | null {
    return this.shape.getData() as ShapeDefinition | null;
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
    this.shape.setDataId(""); // erase the id for next drawing
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
   * Function to change the cursor according to the rotation
   * @param {string} cursorType - cursor type
   * @returns {string} - cursor type
   */
  turnCursor(cursorType: string): string {
    let rotation = this.shape.getRotation() % 360;
    if (rotation < 0) rotation += 360;

    // No rotation or 180° rotation, keep the default cursor
    if (rotation === 0 || rotation === 180) return cursorType;

    // Calculate the effective angle according to the cursor type
    let angle = rotation;
    switch (cursorType) {
      case "ns-resize": // Vertical cursor
        angle = (rotation + 90) % 360; // Add 90° to align with the vertical axis
        break;
      case "nesw-resize": // Diagonal cursor north-east/south-west
        angle = (rotation + 135) % 360; // Add 135° to align with the diagonal NE/SO
        break;
      case "nwse-resize": // Diagonal cursor north-west/south-east
        angle = (rotation + 45) % 360; // Add 45° to align with the diagonal NW/SE
        break;
      case "ew-resize":
        angle = rotation;
        break;
      default:
        return cursorType; // For other cursor types, do not modify
    }

    // Determine the appropriate cursor according to the final angle
    // Divide the circle into 8 sections of 45° each
    if (angle <= 22.5 || angle > 337.5) return "ew-resize"; // ←→
    if (angle <= 67.5) return "nwse-resize"; // ↘↖
    if (angle <= 112.5) return "ns-resize"; // ↑↓
    if (angle <= 157.5) return "nesw-resize"; // ↙↗
    if (angle <= 202.5) return "ew-resize"; // ←→
    if (angle <= 247.5) return "nwse-resize"; // ↘↖
    if (angle <= 292.5) return "ns-resize"; // ↑↓
    if (angle <= 337.5) return "nesw-resize"; // ↙↗

    return cursorType; // Default
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
      if (this.shape.getRotation() !== 0 && isBorder(mouseOnShape)) {
        cursorType = this.turnCursor(cursorType);
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
        this.shape.changeRotation(-MIN_ROTATION);
        this.refreshDrawing(0, mouseOnShape);
      } else if (mouseOnShape === BORDER.ON_BUTTON_RIGHT) {
        this.shape.changeRotation(MIN_ROTATION);
        this.refreshDrawing(0, mouseOnShape);
      } else {
        alertMessage("resizing: " + mouseOnShape);
        this.setResizing(mouseOnShape);
      }
    }
    return { toReset, toExtend: false, pointer } as returnMouseDown;
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

    if (
      isInsideSquare(
        this.coordinates,
        this.shape.getDataSize(),
        this.shape.getRotation()
      )
    ) {
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

  /**
   * Function to egalise the size of the square
   */
  actionMouseDblClick(): void {
    // check position of the mouse, if mouse is on a button, do nothing
    if (!this.coordinates) return;
    const mouseOnShape = this.shape.handleMouseOnShape(
      this.mCanvas,
      this.coordinates
    );
    if (mouseOnShape && isOnTurnButton(mouseOnShape)) {
      return;
    }

    const size = this.shape.getDataSize();

    const diagonal = Math.sqrt(
      Math.pow(size.width, 2) + Math.pow(size.height, 2)
    );
    const newSize = diagonal / Math.sqrt(2);

    const centerX = size.x + size.width / 2;
    const centerY = size.y + size.height / 2;

    // center the square at same place
    this.shape.setDataSize({
      x: centerX - newSize / 2,
      y: centerY - newSize / 2,
      width: newSize,
      height: newSize,
    });

    // if the element is rond, set rotation to 0
    if (this.shape.getType() === DRAWING_MODES.CIRCLE) {
      this.shape.setRotation(0);
      this.shape.calculateWithTurningButtons();
    }

    this.shape.draw(this.ctxTempory, true, null);
  }
}
