import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";
import { BORDER, isOnTurnButton } from "@/lib/mouse-position";

import { Coordinate } from "@/lib/canvas/types";

import { returnMouseDown } from "./drawingHandler";
import { drawingShapeHandler } from "./drawingShapHandler";
import { alertMessage } from "../../alert-messages/alertMessage";
import { isInsideSquare } from "@/lib/square-position";

export class drawElement extends drawingShapeHandler {
  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);

    if (!canvas) return;

    this.coordinates = { x: 0, y: 0 };
  }

  setType(type: string): void {
    this.shape.setType(type);
    if (type === DRAWING_MODES.TEXT) {
      this.setWithResize(false);
    } else {
      this.setWithResize(true);
    }
  }

  /**
   * Function to draw an element on the MAIN canvas
   */
  validDrawedElement() {
    // console.log("validDrawedElement: ", this.getType());
    if (!this.context) {
      console.error("context is null");
      return;
    }
    this.shape.draw(this.context, false, null);
    this.saveCanvasPicture();
    this.clearTemporyCanvas();
    // add 15px to the size to avoid the shape to be one on the other
    const size = this.shape.getDataSize();
    this.shape.setDataSize({
      ...size,
      ...{ x: size.x + 15, y: size.y + 15 },
    });
  }

  /**
   * Function to handle the mouse down event
   * @param {string} mode - drawing mode
   * @param {MouseEvent} event - mouse event
   */
  actionMouseDown(event: MouseEvent | TouchEvent, coord: Coordinate) {
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(coord);
    const mouseOnShape = this.coordinates
      ? this.shape.handleMouseOnShape(this.mCanvas, this.coordinates)
      : null;
    if (mouseOnShape) {
      console.log("mode", this.type, "mouseOnShape: ", mouseOnShape);
      // Clic on the shape --------
      if (mouseOnShape === BORDER.INSIDE) {
        this.calculOffset();
        pointer = "pointer";
        this.setFixed(false);
      } else if (mouseOnShape === BORDER.ON_BUTTON) {
        pointer = "pointer";
        this.validDrawedElement();
        toReset = true;
      } else if (mouseOnShape === BORDER.ON_BUTTON_LEFT) {
        this.changeRotation(-Math.PI / 16);
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

  /**
   * Function to handle the mouse move event
   * @param {MouseEvent} event - mouse event
   * @returns {string | null} - cursor type
   */
  actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null {
    this.setCoordinates(coord);
    if (this.resizingBorder !== null) {
      this.resizingSquare(this.resizingBorder);
      return null;
    }
    if (!this.isFixed()) {
      this.clearTemporyCanvas();
      this.shape.draw(this.ctxTempory, true, null);
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

  actionMouseLeave() {
    if (this.isFixed()) {
      return;
    }
    this.clearTemporyCanvas();
  }

  actionValid() {
    this.validDrawedElement();
  }

  endAction() {
    this.setFixed(true);
    this.setResizing(null);
    this.clearTemporyCanvas();
    this.eraseOffset();
  }

  /// egalise the size of the square
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
    }

    this.clearTemporyCanvas();
    this.shape.draw(this.ctxTempory, true, null);
  }
}
