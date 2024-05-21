import { getCoordinates } from "../../lib/canvas/canvas-tools";
import {
  DRAWING_MODES,
  paramsAll,
  paramsGeneral,
  paramsShape,
  paramsText,
  Area,
  shapeDefinition,
} from "../../lib/canvas/canvas-defines";
import { BORDER, mousePointer, isInside } from "../../lib/mouse-position";
import { resizingElement, showElement } from "../../lib/canvas/canvas-elements";
import { coordinate } from "../../lib/canvas/canvas-basic";
import {
  addPictureToHistory,
  canvasPicture,
} from "../../lib/canvas/canvas-history";
import { isOnSquareBorder } from "../../lib/square-position";
import {
  DrawingHandler,
  returnMouseDown,
} from "../../lib/canvas/DrawingHandler";
import { alertMessage } from "../../hooks/alertMessage";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class DrawElement extends DrawingHandler {
  private fixed: boolean = false;
  private resizing: string | null = null;
  private offset: coordinate | null = null;
  private data: shapeDefinition;

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
        withMiddleButton: false,
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

  saveCanvasPicture() {
    if (!this.mCanvas) return;
    addPictureToHistory({
      type: this.getType(),
      canvas: this.mCanvas,
      coordinates: null,
    } as canvasPicture);
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
  getOffset() {
    return this.offset;
  }
  changeRotation(rotation: number) {
    this.data.rotation += rotation;
  }

  addData(data: any) {
    this.data = { ...this.data, ...data };
  }
  setDataGeneral(data: paramsGeneral) {
    this.data.general = { ...data };
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
  setDataSize(data: Area) {
    this.data.size = { ...data };
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
    this.fixed = false;
  }
  changeData(data: paramsAll) {
    this.setDataGeneral(data.general);
    this.setDataBorder(data.border);
    this.setDataShape(data.shape);
    this.setDataText(data.text);

    this.data.type = data.mode;
    this.setWithMiddleButton();
  }

  getData() {
    return this.data;
  }

  setType(type: string) {
    this.type = type;
    this.data.type = type;
  }
  getType() {
    return this.data.type;
  }

  /**
   * Function to set the value of the middle button
   */
  setWithMiddleButton() {
    const square = this.data;
    const sSize = square.size;
    // don't show the middle button if the shape is a circle without text
    if (
      square.type === DRAWING_MODES.TEXT ||
      (square.type === DRAWING_MODES.CIRCLE &&
        sSize.width === sSize.height &&
        !square.shape.withText)
    ) {
      this.data.withMiddleButton = false;
      return;
    }
    this.data.withMiddleButton = true;
  }
  hasMiddleButton() {
    return this.data.withMiddleButton;
  }

  /**
   * Function to resize the square on the canvas
   * @param {Event} event
   * @param {HTMLCanvasElement} canvas
   */
  resizingSquare(witchBorder: string) {
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
      this.setWithMiddleButton();
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing() {
    this.clearTemporyCanvas();
    if (!this.ctxTempory) {
      console.error("ctxTempory is null");
      return;
    }
    showElement(this.ctxTempory, this.data, true);
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
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   * @param {string} mode - drawing mode
   * @param {object} coord - {x, y}
   * @param {object} square
   */
  handleMouseOnElement(
    mode: string,
    coord: coordinate,
    square: shapeDefinition
  ) {
    if (this.mCanvas === null || !coord) return null;
    return isOnSquareBorder({
      coord,
      area: square.size,
      withButton: true,
      withResize: mode !== DRAWING_MODES.TEXT,
      withMiddleButton: square.withMiddleButton,
      maxWidth: this.mCanvas.width,
    });
  }

  actionMouseDown(mode: string, event: MouseEvent) {
    // if (!this.isFixed()) {
    //   return false;
    // }
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(event);
    this.setType(mode);
    const mouseOnShape = this.handleMouseOnShape({
      coordinate: this.coordinates,
      area: this.data.size,
      withResize: mode !== DRAWING_MODES.TEXT,
      withMiddleButton: this.data.withMiddleButton,
    });
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
        this.refreshDrawing();
      } else if (mouseOnShape === BORDER.ON_BUTTON_RIGHT) {
        this.changeRotation(Math.PI / 16);
        this.refreshDrawing();
      } else {
        alertMessage("resizing: " + mouseOnShape);
        this.setResizing(mouseOnShape);

        // console.log("resizing element: ", mouseOnShape);
      }
    }
    return { toReset, toContinue: false, pointer } as returnMouseDown;
  }
  /**
   * Function to follow the cursor on the canvas
   * @param {string} mode - drawing mode
   * @param {number} opacity - opacity of the element
   */
  followCursor(mode: string, opacity: number) {
    let mouseOnShape: string | null = null;
    let cursorType = "default";

    if (!this.ctxTempory || !this.coordinates) return cursorType;

    mouseOnShape = this.handleMouseOnShape({
      coordinate: this.coordinates,
      area: this.data.size,
      withResize: mode !== DRAWING_MODES.TEXT,
      withMiddleButton: this.data.withMiddleButton,
    });

    if (mouseOnShape) {
      cursorType = mousePointer(mouseOnShape);

      if (isInside(mouseOnShape)) {
        // show real color when mouse is inside the square
        this.ctxTempory.globalAlpha = opacity;
      }
    }

    this.clearTemporyCanvas();
    showElement(this.ctxTempory, this.data, true, mouseOnShape);
    return cursorType;
  }

  actionMouseMove(event: MouseEvent) {
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

    return this.followCursor(this.getType(), this.data.general.opacity);
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
  }
}
