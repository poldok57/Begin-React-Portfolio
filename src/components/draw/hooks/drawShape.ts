import { Coordinate, Area } from "@/lib/canvas/types";
import {
  AllParams,
  DRAWING_MODES,
  isDrawingShape,
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

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [200, 200];
const MIN_ROTATION = 7.5;

export class drawShape extends drawingHandler {
  protected fixed: boolean = false;

  protected offset: Coordinate | null = null;
  protected shape: CanvasShape;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporaryCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, canvasContext, temporaryCanvas, setMode);

    this.typeHandler = DRAWING_MODES.SQUARE;

    this.shape = new CanvasShape();

    this.coordinates = { x: 0, y: 0 };
  }

  setType(type: string): void {
    this.shape.setType(type);
  }

  newElement(data: AllParams): void {
    const prevType = this.getType();
    if (!isDrawingShape(prevType)) {
      this.readyForNewDrawing();
    }

    super.newElement(data);
  }

  setScale(scale: number): void {
    this.shape.setScale(scale);
  }

  /**
   * Function to initialize the data of the shape
   * @param {AllParams} initData - initial data
   */
  initData(data: AllParams) {
    const previousType = this.getType();
    super.initData(data);

    if (!this.context) return;
    this.shape.setDataSize({
      x: this.context.canvas.width / 2 - SQUARE_WIDTH / 2,
      y: this.context.canvas.height / 2 - SQUARE_HEIGHT / 2,
      width: data.mode === DRAWING_MODES.TEXT ? 0 : SQUARE_WIDTH,
      height: data.mode === DRAWING_MODES.TEXT ? 0 : SQUARE_HEIGHT,
    });
    this.shape.setWithAllButtons(true);
    this.lockRatio = data.lockRatio;

    if (!isDrawingShape(previousType)) {
      this.readyForNewDrawing();
    }
  }

  /**
   * Function to change the data of the shape
   * @param {AllParams} param - data to change
   */
  changeData(param: AllParams) {
    this.shape.changeData(param);
    this.lockRatio = param.lockRatio;
  }

  /**
   * Function to get the type of the shape
   * @returns {string} - type of the shape
   */
  getType() {
    return this.shape.getType();
  }

  /**
   * Function to set the data of the shape
   * @param {ShapeDefinition} draw - data to set
   */
  async setDraw(draw: ShapeDefinition) {
    this.eraseOffset();
    this.setFixed(true);
    await this.shape.setData(draw);
  }

  /**
   * Function to get the data of the shape
   * @returns {ShapeDefinition | null} - data of the shape
   */
  getDraw(): ShapeDefinition | null {
    return this.shape.getData() as ShapeDefinition | null;
  }

  /**
   * Function to set the coordinates of the shape
   * @param {Coordinate} coord - coordinates to set
   */
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

  /**
   * Function to set the fixed state of the shape
   * @param {boolean} value - fixed state
   */
  setFixed(value: boolean) {
    if (value) {
      // Check if the element is not outside the canvas boundaries
      const size = this.shape.getDataSize();
      const canvas = this.ctxTemporary?.canvas;

      if (canvas && size) {
        // refuse to fix the element if it is outside the canvas
        if (size.x > canvas.width || size.y > canvas.height) {
          return;
        }
      }
    }

    this.fixed = value;
  }

  /**
   * Function to get the fixed state of the shape
   * @returns {boolean} - fixed state
   */
  isFixed(): boolean {
    return this.fixed;
  }

  /**
   * Function to erase the offset of the shape
   */
  eraseOffset() {
    this.offset = null;
  }

  readyForNewDrawing() {
    this.fixed = false;
    const size = this.shape.getDataSize();
    this.offset = { x: -size.width / 2, y: -10 };
  }

  /**
   * Function to calculate the offset of the shape

   */
  calculOffset() {
    if (!this.coordinates) return;
    const size: Area = this.shape.getDataSize();

    this.offset = {
      x: Math.round(size.x - this.coordinates.x),
      y: Math.round(size.y - this.coordinates.y),
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
    // this.clearTemporaryCanvas();

    if (!this.coordinates || !this.ctxTemporary) return;

    this.shape.resizingArea(
      this.ctxTemporary,
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
    this.clearTemporaryCanvas();
    if (withOffset) {
      // add 20px to the size to avoid the shape to be one on the other
      const size = this.shape.getDataSize();
      this.shape.setDataSize({
        ...size,
        ...{ x: size.x + 20, y: size.y + 20 },
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
   * Function to refresh the element on the temporary canvas
   */
  refreshDrawing(opacity: number = 0, mouseOnShape: string | null = null) {
    if (opacity > 0 && this.ctxTemporary)
      this.ctxTemporary.globalAlpha = opacity;
    this.shape.debounceDraw(this.ctxTemporary, true, mouseOnShape);
    this.lastMouseOnShape = mouseOnShape;
  }

  hightLightDrawing() {
    this.shape.hightLightDrawing(this.ctxTemporary as CanvasRenderingContext2D);
  }

  /**
   * Function to follow the cursor on the canvas
   * @param {number} opacity - opacity of the element
   */
  followCursorOnElement(opacity: number) {
    let cursorType = "default";

    if (!this.ctxTemporary || !this.coordinates) return cursorType;

    const mouseOnShape = this.shape.handleMouseOnElement(this.coordinates);

    if (mouseOnShape) {
      cursorType = mousePointer(mouseOnShape);

      if (isInside(mouseOnShape)) {
        // show real color when mouse is inside the square
        this.ctxTemporary.globalAlpha = opacity;
      }
      if (this.shape.getRotation() !== 0 && isBorder(mouseOnShape)) {
        cursorType = this.turnCursor(cursorType);
      }
    }
    if (mouseOnShape !== this.lastMouseOnShape) {
      this.shape.debounceDraw(this.ctxTemporary, true, mouseOnShape);

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
    const retunData: returnMouseDown = {
      toReset: false,
      toExtend: false,
      pointer: null,
    };

    this.setCoordinates(coord);

    const mouseOnShape = this.shape.handleMouseOnElement(this.coordinates);

    if (mouseOnShape) {
      // Clic on the shape --------
      switch (mouseOnShape) {
        case BORDER.INSIDE:
          this.calculOffset();
          retunData.pointer = "grabbing";
          this.setFixed(false);
          break;
        case BORDER.ON_BUTTON:
          retunData.pointer = "pointer";
          this.validDrawedElement(true);
          retunData.toReset = true;
          retunData.reccord = true;
          break;
        case BORDER.ON_BUTTON_DELETE:
          retunData.deleteId = this.shape.getDataId();
          retunData.toReset = true;
          break;
        case BORDER.ON_BUTTON_LEFT:
          this.shape.changeRotation(-MIN_ROTATION);
          this.refreshDrawing(0, mouseOnShape);
          break;
        case BORDER.ON_BUTTON_RIGHT:
          this.shape.changeRotation(MIN_ROTATION);
          this.refreshDrawing(0, mouseOnShape);
          break;
        default:
          alertMessage("resizing: " + mouseOnShape);
          this.setResizingBorder(mouseOnShape);
          break;
      }
    }
    return retunData;
  }

  memorizeSelectedArea(_area: Area | null = null) {}

  /**
   * Function to handle the mouse move event
   * @param {MouseEvent} event - mouse event
   * @param {Coordinate} coord - coordinates of the mouse
   * @returns {string | null} - cursor type
   */
  actionMouseMove(
    event: MouseEvent | TouchEvent | null,
    coord: Coordinate
  ): string | null {
    this.setCoordinates(coord);

    const type = this.getType();

    if (this.resizingBorder !== null) {
      this.resizingSquare(this.resizingBorder);
      if (type === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return null;
    }
    if (!this.isFixed()) {
      this.shape.debounceDraw(this.ctxTemporary, true, BORDER.INSIDE);

      if (type === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return "grabbing";
    }

    return this.followCursorOnElement(this.shape.getOpacity());
  }

  actionMouseUp() {
    this.setFixed(true);
    this.setResizingBorder(null);

    if (this.ctxTemporary === null) return;

    if (
      isInsideSquare(
        this.coordinates,
        this.shape.getDataSize(),
        this.shape.getRotation()
      )
    ) {
      this.ctxTemporary.globalAlpha = this.shape.getOpacity();
      this.shape.debounceDraw(this.ctxTemporary, true, BORDER.INSIDE);
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
    this.setMode(DRAWING_MODES.FIND);
    return true;
  }

  /**
   * Function to end the action on the canvas after changing the mode
   */
  endAction(prevType?: string) {
    if (prevType && isDrawingShape(prevType)) {
      // if the previous type is a drawing shape, do nothing
      return;
    }
    this.setResizingBorder(null);
    this.clearTemporaryCanvas();

    this.eraseOffset();
    this.setFixed(true);
    this.setType(DRAWING_MODES.PAUSE);
  }

  /**
   * Function to adjust the size of the shape
   */
  adjustSize() {
    const size = this.shape.getDataSize();

    // if the shape has text, adjust the size of the shape to fit the text
    if (this.shape.getWithText() && this.ctxTemporary) {
      if (this.shape.setSizeForText(this.ctxTemporary)) {
        return;
      }
    }

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
    if (this.getType() === DRAWING_MODES.CIRCLE) {
      this.shape.setRotation(0);
      this.shape.calculateWithTurningButtons();
    }
  }

  /**
   * Function double click to egalise the size of the square
   */
  actionMouseDblClick(): void {
    // check position of the mouse, if mouse is on a button, do nothing
    if (!this.coordinates) return;
    const mouseOnShape = this.shape.handleMouseOnElement(this.coordinates);
    if (mouseOnShape && isOnTurnButton(mouseOnShape)) {
      return;
    }

    this.adjustSize();

    this.refreshDrawing(0, mouseOnShape);
  }
}
