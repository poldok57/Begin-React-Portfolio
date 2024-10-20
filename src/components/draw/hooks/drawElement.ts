import {
  DRAWING_MODES,
  AllParams,
  ParamsGeneral,
  ParamsShape,
  ParamsText,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { BORDER, isOnTurnButton } from "@/lib/mouse-position";
import { showElement } from "@/lib/canvas/canvas-elements";
import { resizingElement } from "@/lib/canvas/canvas-resize";

import { Coordinate, Area } from "@/lib/canvas/types";

import { drawingHandler, returnMouseDown } from "./drawingHandler";
import { alertMessage } from "../../alert-messages/alertMessage";
import { isInsideSquare } from "@/lib/square-position";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class drawElement extends drawingHandler {
  private fixed: boolean = false;
  private resizing: string | null = null;
  private offset: Coordinate | null = null;
  protected data: ShapeDefinition = {
    size: { x: 0, y: 0, width: 0, height: 0 },
  } as ShapeDefinition;

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);

    if (!canvas) return;

    this.coordinates = { x: 0, y: 0 };

    this.fixed = false;
    this.resizing = null;
    this.offset = null;
    this.data = {
      ...this.data,
      ...{
        withTurningButtons: false,
        withCornerButton: true,
        type: DRAWING_MODES.SQUARE,
        rotation: 0,
      },
    } as ShapeDefinition;
  }

  setDataParams(params: Area | ParamsGeneral | ParamsShape | ParamsText) {
    this.data = { ...this.data, ...params } as ShapeDefinition;
  }

  setCoordinates(coord: Coordinate) {
    this.coordinates = coord;
    if (this.coordinates && this.offset && !this.fixed) {
      const x = this.coordinates.x + this.offset.x;
      const y = this.coordinates.y + this.offset.y;

      const size = { ...this.data.size, x, y };

      this.setDataSize(size);
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

  addData(data: AllParams) {
    this.data = { ...this.data, ...data };
  }
  setDataBorder(data: ParamsGeneral) {
    this.data.border = { ...data };
  }
  setDataShape(data: ParamsShape) {
    this.data.shape = { ...data };
  }
  setDataText(data: ParamsText) {
    this.data.text = { ...data };
  }
  initData(initData: AllParams) {
    this.data = { ...this.data, ...initData };
    this.changeData(initData);
    if (this.mCanvas !== null) {
      this.setDataSize({
        x: this.mCanvas.width / 2,
        y: this.mCanvas.height / 2,
        width: SQUARE_WIDTH,
        height: SQUARE_HEIGHT,
      });
    }
    this.data.rotation = 0;
    this.data.text.rotation = 0;
    this.data.size.ratio = 0;
    this.fixed = false;
  }
  changeData(param: AllParams) {
    this.setDataGeneral(param.general);
    this.setDataBorder(param.border);
    this.setDataShape(param.shape);
    this.setDataText(param.text);

    this.data.type = param.mode;
    this.data.lockRatio = param.lockRatio;

    this.setWithTurningButtons();
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
  setWithTurningButtons(): void {
    const square = this.data;
    const sSize = square.size;
    // don't show the middle button if the shape is a circle without text
    if (
      square.type === DRAWING_MODES.TEXT ||
      (square.type === DRAWING_MODES.CIRCLE &&
        sSize.width === sSize.height &&
        !square.shape.withText)
    ) {
      this.data.withTurningButtons = false;
      return;
    }
    this.data.withTurningButtons = true;
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
      this.setWithTurningButtons();
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
    // add 15px to the size to avoid the shape to be one on the other
    this.data.size.x += 15;
    this.data.size.y += 15;
  }

  /**
   * Function to handle the mouse down event
   * @param {string} mode - drawing mode
   * @param {MouseEvent} event - mouse event
   */
  actionMouseDown(event: MouseEvent | TouchEvent, coord: Coordinate) {
    // if (!this.isFixed()) {
    //   return false;
    // }
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(coord);
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
  actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null {
    this.setCoordinates(coord);
    if (this.resizing !== null) {
      this.resizingSquare(this.resizing);
      return null;
    }
    if (!this.isFixed()) {
      this.clearTemporyCanvas();
      showElement(this.ctxTempory, this.data, true, null);
      return "pointer";
    }

    return this.followCursorOnElement(this.data.general.opacity);
  }

  actionMouseUp() {
    this.setFixed(true);
    this.setResizing(null);

    if (this.ctxTempory === null) return;

    if (isInsideSquare(this.coordinates, this.data.size)) {
      this.ctxTempory.globalAlpha = this.data.general.opacity;
      showElement(this.ctxTempory, this.data, true, BORDER.INSIDE);
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
    const mouseOnShape = this.handleMouseOnShape();
    if (mouseOnShape && isOnTurnButton(mouseOnShape)) {
      return;
    }

    const diagonal = Math.sqrt(
      Math.pow(this.data.size.width, 2) + Math.pow(this.data.size.height, 2)
    );
    const newSize = diagonal / Math.sqrt(2);

    const centerX = this.data.size.x + this.data.size.width / 2;
    const centerY = this.data.size.y + this.data.size.height / 2;

    this.data.size.width = newSize;
    this.data.size.height = newSize;

    // center the square at same place
    this.data.size.x = centerX - newSize / 2;
    this.data.size.y = centerY - newSize / 2;
    // if the element is rond, set rotation to 0
    if (this.data.type === DRAWING_MODES.CIRCLE) {
      this.data.rotation = 0;
    }

    this.clearTemporyCanvas();
    showElement(this.ctxTempory, this.data, true, null);
  }
}
