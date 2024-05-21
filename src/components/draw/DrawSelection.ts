import { getCoordinates } from "../../lib/canvas/canvas-tools";
import {
  DRAWING_MODES,
  paramsAll,
  paramsGeneral,
  paramsShape,
  Area,
  shapeDefinition,
} from "../../lib/canvas/canvas-defines";
import { BORDER, mousePointer, isInside } from "../../lib/mouse-position";
import {
  resizingElement,
  showElement,
  // drawDashedRectangle,
} from "../../lib/canvas/canvas-elements";
import { coordinate } from "../../lib/canvas/canvas-basic";
import {
  addPictureToHistory,
  canvasPicture,
} from "../../lib/canvas/canvas-history";
import {
  DrawingHandler,
  returnMouseDown,
} from "../../lib/canvas/DrawingHandler";
import { alertMessage } from "../../hooks/alertMessage";
import { imageSize, saveCanvas } from "../../lib/canvas/canvas-size";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class DrawSelection extends DrawingHandler {
  private fixed: boolean = false;
  private resizing: string | null = null;
  private offset: coordinate | null = null;
  private data: shapeDefinition;
  private selectedArea: Area | null = null;

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
  setDataShape(data: paramsShape) {
    this.data.shape = { ...data };
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
    this.setWithMiddleButton(true);
  }
  changeData(data: paramsAll) {
    this.setDataGeneral(data.general);
    this.data.type = data.mode;
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

  setWithMiddleButton(value: boolean) {
    this.data.withMiddleButton = value;
  }
  hasMiddleButton() {
    return this.data.withMiddleButton;
  }

  /**
   * Function to resize the square on the canvas
   */
  resizingSquare() {
    this.clearTemporyCanvas();

    if (!this.coordinates || !this.ctxTempory) return;

    const newCoord = resizingElement(
      this.ctxTempory,
      this.data,
      this.coordinates,
      this.resizing
    );

    if (newCoord) {
      this.addData(newCoord);
      this.setDataSize(newCoord);
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing() {
    if (!this.ctxTempory) {
      console.error("ctxTempory is null");
      return;
    }
    this.clearTemporyCanvas();
    showElement(this.ctxTempory, this.data, false);
    // drawDashedRectangle(this.ctxTempory, this.data.size);
  }

  /**
   * Function to mémorize the selected zone
   * @param {object} area - {x, y, width, height} of the selected zone
   */
  memorizeSelectedArea(area: Area | null = null) {
    if (area) {
      this.setDataSize(area);

      this.setFixed(true);
      this.setType(DRAWING_MODES.SELECT);
    } else {
      area = { ...this.data.size };
    }
    this.selectedArea = area;
    return area;
  }
  getSelectedArea() {
    return this.selectedArea;
  }
  eraseSelectedArea() {
    this.selectedArea = null;
  }

  /**
   * Function to draw an element on the MAIN canvas
   */
  validDrawedElement() {
    if (this.getType() === DRAWING_MODES.SELECT) {
      return;
    }
    // console.log("validDrawedElement: ", this.getType());
    if (!this.context) {
      console.error("context is null");
      return;
    }
    showElement(this.context, this.data, false);
    this.saveCanvasPicture();
    this.clearTemporyCanvas();
  }

  actionMouseDown(mode: string, event: MouseEvent): returnMouseDown {
    // if (!this.isFixed()) {
    //   return false;
    // }
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(event);

    const mouseOnShape = this.handleMouseOnShape({
      coordinate: this.coordinates,
      area: this.data.size,
      withResize: true,
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
      withResize: true,
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
    // drawDashedRectangle(this.ctxTempory, this.data.size);
    showElement(this.ctxTempory, this.data, true);
    return cursorType;
  }

  actionMouseMove(event: MouseEvent) {
    this.setCoordinates(event);
    if (this.resizing !== null) {
      this.resizingSquare();
      if (this.getType() === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return null;
    }
    if (!this.isFixed()) {
      this.clearTemporyCanvas();
      if (this.ctxTempory) showElement(this.ctxTempory, this.data, true);
      if (this.getType() === DRAWING_MODES.SELECT) {
        this.memorizeSelectedArea();
      }
      return "pointer";
    }
    return this.followCursor(this.getType(), this.data.general.opacity);
  }

  actionMouseUp() {
    this.setFixed(true);
    this.setResizing(null);
  }

  actionMouseLeave() {}

  actionKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        this.eraseSelectedArea();
        this.setType(DRAWING_MODES.SELECT);
        break;
      // ctrl + c
      case "c":
      case "C":
        if (event.ctrlKey) {
          this.copySelection();
          this.setType(DRAWING_MODES.IMAGE);
        }
        break;
      // ctrl + v
      case "v":
      case "V":
        if (event.ctrlKey) {
          this.pasteSelection();
        }
        break;
    }
  }

  /**
   * Function to end the action on the canvas
   */
  endAction() {
    this.setFixed(true);
    this.setResizing(null);
    this.clearTemporyCanvas();
  }

  /**
   * Function to copy the selected zone in a virtual canvas
   * @param {object} area - {x, y, width, height} of the selected zone
   * @return {object} canvas - new canvas with the selected zone
   */
  copyInVirtualCanvas(area: Area): HTMLCanvasElement {
    const imageData = this.context?.getImageData(
      area.x,
      area.y,
      area.width,
      area.height
    );
    const canvas = document.createElement("canvas");
    canvas.width = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext("2d");
    if (ctx && imageData) {
      ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
  }
  /**
   * Function to copy the selected zone in a virtual canvas
   */
  copySelection(): void {
    const area = this.getSelectedArea();
    if (area === null) return;
    this.data.canvasImage = this.copyInVirtualCanvas(area);
    this.setType(DRAWING_MODES.IMAGE);
  }
  /**
   * Function to paste the selected zone in the MAIN canvas
   */
  pasteSelection(): void {
    this.validDrawedElement();
    this.setType(DRAWING_MODES.IMAGE);
  }

  startAction(): void {
    const mode = this.getType();
    switch (mode) {
      case DRAWING_MODES.SELECT:
        // Zone selection
        const rect = imageSize(this.mCanvas);
        const area = this.memorizeSelectedArea(rect);
        break;
      // case DRAWING_MODES.COPY:
      //   this.copySelection();
      //   break;
      // case DRAWING_MODES.PASTE:
      //   this.pasteSelection();
      //   break;
    }
  }

  saveCanvas(filename: string) {
    if (!this.mCanvas) return;
    const area = this.getSelectedArea();

    saveCanvas(this.mCanvas, filename, area);
  }
}
