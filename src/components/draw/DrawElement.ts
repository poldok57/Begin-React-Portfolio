import { getCoordinates } from "../../lib/canvas/canvas-tools";
import {
  DRAWING_MODES,
  paramsAll,
  paramsGeneral,
  paramsShape,
  paramsText,
  ShapeDefinition,
} from "../../lib/canvas/canvas-defines";
import { BORDER } from "../../lib/mouse-position";
import { resizingElement, showElement } from "../../lib/canvas/canvas-elements";
import { Coordinate } from "../../lib/types";

import {
  DrawingHandler,
  returnMouseDown,
} from "../../lib/canvas/DrawingHandler";
import { alertMessage } from "../../hooks/alertMessage";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class DrawElement extends DrawingHandler {
  private fixed: boolean = false;
  private resizing: string | null = null;
  private offset: Coordinate | null = null;
  protected data: ShapeDefinition;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    if (!canvas) return;

    this.coordinates = { x: 0, y: 0 };

    this.fixed = false;
    this.resizing = null;
    this.offset = null;
    this.data = {
      ...this.data,
      ...{
        withMiddleButtons: false,
        withCornerButton: true,
        type: DRAWING_MODES.SQUARE,
        rotation: 0,
      },
    };
  }

  setCoordinates(event: MouseEvent, canvas: HTMLCanvasElement | null = null) {
    if (!event) return { x: 0, y: 0 };
    if (!canvas) canvas = this.mCanvas;

    this.coordinates = getCoordinates(event, canvas);
    if (this.coordinates && this.offset && !this.fixed) {
      const x = this.coordinates.x + this.offset.x;
      const y = this.coordinates.y + this.offset.y;

      this.data.size.x = x;
      this.data.size.y = y;
    }
    return this.coordinates;
  }

  setResizing(value: string | null) {
    this.resizing = value;
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
    this.offset = {
      x: this.data.size.x - this.coordinates.x,
      y: this.data.size.y - this.coordinates.y,
    };
  }

  addData(data: any) {
    this.data = { ...this.data, ...data };
  }
  setDataBorder(data: paramsGeneral) {
    this.data.border = { ...data };
  }
  setDataShape(data: paramsShape) {
    this.data.shape = { ...data };
  }
  setDataText(data: paramsText) {
    this.data.text = { ...data };
  }
  initData(initData: paramsAll) {
    this.data = { ...this.data, ...initData };
    this.changeData(initData);
    if (this.mCanvas !== null)
      this.setDataSize({
        x: this.mCanvas.width / 2,
        y: this.mCanvas.height / 2,
        width: SQUARE_WIDTH,
        height: SQUARE_HEIGHT,
      });
    this.data.rotation = 0;
    this.data.size.ratio = 0;
    this.fixed = false;
  }
  changeData(param: paramsAll) {
    this.setDataGeneral(param.general);
    this.setDataBorder(param.border);
    this.setDataShape(param.shape);
    this.setDataText(param.text);

    this.data.type = param.mode;
    this.data.lockRatio = param.lockRatio;

    this.setWithMiddleButtons();
  }

  getData(): ShapeDefinition {
    return this.data;
  }

  setType(type: string): void {
    this.data.type = type;
    if (type === DRAWING_MODES.TEXT) {
      this.setWithResize(false);
    } else {
      this.setWithResize(true);
    }
  }

  /**
   * Function to set the value of the middle button
   */
  setWithMiddleButtons(): void {
    const square = this.data;
    const sSize = square.size;
    // don't show the middle button if the shape is a circle without text
    if (
      square.type === DRAWING_MODES.TEXT ||
      (square.type === DRAWING_MODES.CIRCLE &&
        sSize.width === sSize.height &&
        !square.shape.withText)
    ) {
      this.data.withMiddleButtons = false;
      return;
    }
    this.data.withMiddleButtons = true;
  }

  /**
   * Function to resize the square on the canvas
   * @param {Event} event
   * @param {HTMLCanvasElement} canvas
   */
  resizingSquare(witchBorder: string): void {
    this.clearTemporyCanvas();

    if (!this.coordinates || !this.ctxTempory) return;

    const newCoord = resizingElement(
      this.ctxTempory,
      this.data,
      this.coordinates,
      witchBorder
    );

    if (newCoord) {
      // this.addData(newCoord);
      this.setDataSize(newCoord);
      this.setWithMiddleButtons();
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing(opacity: number = 0, mouseOnShape: string | null = null) {
    this.clearTemporyCanvas();
    if (!this.ctxTempory) {
      console.error("ctxTempory is null");
      return;
    }
    if (opacity > 0) this.ctxTempory.globalAlpha = opacity;
    showElement(this.ctxTempory, this.data, true, mouseOnShape);
    this.lastMouseOnShape = mouseOnShape;
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
    showElement(this.context, this.data, false);
    this.saveCanvasPicture();
    this.clearTemporyCanvas();
  }

  /**
   * Function to handle the mouse down event
   * @param {string} mode - drawing mode
   * @param {MouseEvent} event - mouse event
   */
  actionMouseDown(mode: string, event: MouseEvent) {
    // if (!this.isFixed()) {
    //   return false;
    // }
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(event);
    this.setType(mode);
    const mouseOnShape = this.handleMouseOnShape();
    if (mouseOnShape) {
      // console.log("mode", mode, "mouseOnShape: ", mouseOnShape);
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
        this.changeRotation(Math.PI / 16);
        this.refreshDrawing(0, mouseOnShape);
      } else {
        alertMessage("resizing: " + mouseOnShape);
        this.setResizing(mouseOnShape);

        // console.log("resizing element: ", mouseOnShape);
      }
    }
    return { toReset, toContinue: false, pointer } as returnMouseDown;
  }

  /**
   * Function to handle the mouse move event
   * @param {MouseEvent} event - mouse event
   * @returns {string | null} - cursor type
   */
  actionMouseMove(event: MouseEvent): string | null {
    this.setCoordinates(event);
    if (this.resizing !== null) {
      this.resizingSquare(this.resizing);
      return null;
    }
    if (!this.isFixed()) {
      this.clearTemporyCanvas();
      if (this.ctxTempory) showElement(this.ctxTempory, this.data, true, null);
      return "pointer";
    }

    return this.followCursorOnElement(this.data.general.opacity);
  }

  actionMouseUp() {
    this.setFixed(true);
    this.setResizing(null);
  }

  actionMouseLeave() {
    if (this.isFixed()) {
      return;
    }
    this.clearTemporyCanvas();
  }

  actionKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "Enter":
        this.validDrawedElement();
        break;
    }
  }

  endAction() {
    this.setFixed(true);
    this.setResizing(null);
    this.clearTemporyCanvas();
    this.eraseOffset();
  }
}
