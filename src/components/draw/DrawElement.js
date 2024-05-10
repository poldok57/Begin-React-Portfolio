import { getCoordinates } from "../../lib/canvas/canvas-tools";
import { DRAWING_MODES, isDrawingShape } from "../../lib/canvas/canvas-defines";
import { BORDER, mousePointer, isInside } from "../../lib/mouse-position";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";
import { resizingElement, showElement } from "../../lib/canvas/canvas-elements";
import { addPictureToHistory } from "../../lib/canvas/canvas-history";
import { isOnSquareBorder } from "../../lib/square-position";

export class DrawElement {
  constructor(canvas) {
    this.mCanvas = canvas;
    if (!canvas) return;
    this.context = canvas.getContext("2d");

    this.coordinates = { x: 0, y: 0 };

    this.fixed = false;
    this.resizing = false;
    this.offset = null;
    this.data = {
      type: DRAWING_MODES.SQUARE,
      x: 0,
      y: 0,
      width: 0,
      rotation: 0,
    };
  }

  // const ctx = mCanvas.getContext("2d");

  setCoordinates(event, canvas = null) {
    if (!event) return { x: 0, y: 0 };
    if (!canvas) canvas = this.mCanvas;

    this.coordinates = getCoordinates(event, canvas);
    if (this.offset && !this.fixed) {
      this.data.x = this.coordinates.x + this.offset.x;
      this.data.y = this.coordinates.y + this.offset.y;
    }
    return this.coordinates;
  }

  setCanvas(canvas) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  setMouseCanvas(canvas) {
    this.ctxMouse = canvas.getContext("2d");
  }

  setTemporyCanvas(canvas) {
    this.ctxTempory = canvas.getContext("2d");
  }
  clearTemporyCanvas() {
    clearCanvasByCtx(this.ctxTempory);
  }
  saveCanvasPicture() {
    addPictureToHistory({
      canvas: this.mCanvas,
      coordinates: null,
    });
  }

  getCoordinates() {
    return this.coordinates;
  }
  eraseCoordinate() {
    this.coordinates = null;
  }

  setResizing(value) {
    this.resizing = value;
  }
  getResizing() {
    return this.resizing;
  }

  setFixed(value) {
    this.fixed = value;
  }
  isFixed() {
    return this.fixed;
  }

  eraseOffset() {
    this.offset = null;
  }
  calculOffset() {
    this.offset = {
      x: this.data.x - this.coordinates.x,
      y: this.data.y - this.coordinates.y,
    };
  }
  getOffset() {
    return this.offset;
  }
  changeRotation(rotation) {
    this.data.rotation += rotation;
  }

  addData(data) {
    this.data = { ...this.data, ...data };
  }
  setDataGeneral(data) {
    this.data.general = { ...data };
  }
  setDataBorder(data) {
    this.data.border = { ...data };
  }
  setDataShape(data) {
    this.data.shape = { ...data };
  }
  setDataText(data) {
    this.data.text = { ...data };
  }
  getData() {
    return this.data;
  }

  setType(type) {
    this.data.type = type;
  }
  getType() {
    return this.data.type;
  }

  setWithMiddleButton(value) {
    this.data.withMiddleButton = value;
  }
  hasMiddleButton() {
    return this.data.withMiddleButton;
  }

  /**
   * Function to resize the square on the canvas
   * @param {Event} event
   * @param {HTMLCanvasElement} canvas
   */
  resizingSquare() {
    this.clearTemporyCanvas();

    const newCoord = resizingElement(
      this.ctxTempory,
      this.data,
      this.coordinates,
      this.resizing
    );

    if (newCoord) {
      this.addData(newCoord);
    }
  }

  /**
   * Function to move an element on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} coord - {x, y}
   * @param {string} mouseOnShape - border or button where the mouse is
   */
  moveElement(mouseOnShape = null) {
    const square = this.getData();
    const oldX = square.x,
      oldY = square.y,
      oldRotation = square.rotation;
    if (!this.isFixed()) {
      square.x = this.data.x;
      square.y = this.data.y;
    }
    // if element didn't move don't show the buttons
    const withBtn =
      oldX === square.x && oldY === square.y && oldRotation === square.rotation;

    showElement(this.ctxTempory, this.data, withBtn, mouseOnShape);
  }
  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing() {
    this.clearTemporyCanvas();
    showElement(this.ctxTempory, this.data, true);
  }

  /**
   * Function to mémorize the selected zone
   * @param {object} area - {x, y, width, height} of the selected zone
   */
  memorizeSelectedZone(area = null) {
    if (area) {
      this.addData(area);
    }
    this.setFixed(true);
    this.setType(DRAWING_MODES.SELECT);

    if (area == null) {
      const { x, y, width, height } = this.getData();
      area = { x, y, width, height };
    }
    return area;
  }

  /**
   * Function to draw an element on the MAIN canvas
   */
  validDrawedElement() {
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
  handleMouseOnElement(mode, coord, square) {
    return isOnSquareBorder({
      coord,
      square,
      withButton: true,
      withResize: mode !== DRAWING_MODES.TEXT,
      withMiddleButton: square.withMiddleButton,
      maxWidth: this.mCanvas.width,
    });
  }

  actionMouseDown(mode) {
    if (!this.isFixed()) {
      return false;
    }
    let toReset = false;
    let pointer = null;
    const mouseOnShape = this.handleMouseOnElement(
      mode,
      this.coordinates,
      this.data
    );
    if (mouseOnShape) {
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
        this.setResizing(mouseOnShape);

        // console.log("resizing element: ", mouseOnShape);
      }
    }
    return { toReset, pointer };
  }
  /**
   * Function to follow the cursor on the canvas
   * @param {string} mode - drawing mode
   * @param {number} opacity - opacity of the element
   */
  followCursor(mode, opacity) {
    let mouseOnShape = null;
    let cursorType = "default";

    if (this.isFixed()) {
      mouseOnShape = this.handleMouseOnElement(
        mode,
        this.coordinates,
        this.data
      );

      if (mouseOnShape) {
        cursorType = mousePointer(mouseOnShape);

        if (isInside(mouseOnShape)) {
          // show real color when mouse is inside the square
          this.ctxTempory.globalAlpha = opacity;
        }
      }
    } else {
      cursorType = "pointer";
    }
    this.clearTemporyCanvas();
    this.moveElement(mouseOnShape);
    return cursorType;
  }

  actionMouseMouve(mode, event, opacity) {
    this.setCoordinates(event);
    if (isDrawingShape(mode) && this.getResizing()) {
      this.resizingSquare();
      return null;
    }
    return this.followCursor(mode, opacity);
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

  actionKeyDown(event) {
    switch (event.key) {
      case "Enter":
        this.validDrawedElement();
        break;
    }
  }
}
