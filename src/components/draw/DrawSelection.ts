import { Area, Size, Coordinate } from "../../lib/canvas/types";
import { getCoordinates } from "../../lib/canvas/canvas-tools";
import {
  makeWhiteTransparent,
  makeWhiteTransparent2,
} from "../../lib/canvas/image-transparency";
import {
  DRAWING_MODES,
  AllParams,
  ShapeDefinition,
} from "../../lib/canvas/canvas-defines";
import { BORDER } from "../../lib/mouse-position";
import { showElement } from "../../lib/canvas/canvas-elements";
import { resizingElement } from "../../lib/canvas/canvas-resize";
import { isInsideSquare } from "../../lib/square-position";

import {
  copyInVirtualCanvas,
  calculateSize,
} from "../../lib/canvas/canvas-images";

import {
  DrawingHandler,
  returnMouseDown,
} from "../../lib/canvas/DrawingHandler";
import { alertMessage } from "../alert-messages/alertMessage";
import { imageSize, cutOutArea } from "../../lib/canvas/canvas-size";
import {
  downloadCanvasToPNG,
  downloadCanvasToSVG,
  downloadCanvasToGIF,
} from "../../lib/canvas/canvas-save";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class DrawSelection extends DrawingHandler {
  private fixed: boolean = false;
  private resizing: string | null = null;
  private offset: Coordinate | null = null;
  protected data: ShapeDefinition = {
    size: { x: 0, y: 0, width: 0, height: 0 },
    type: DRAWING_MODES.SELECT,
  } as ShapeDefinition;
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
        withMiddleButtons: false,
        withCornerButton: false,
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

  initData(initData: AllParams) {
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
    this.data.canvasImage = null;
    this.data.canvasImageTransparent = null;
    this.fixed = false;
    this.setWithMiddleButtons(true);
  }
  changeData(data: AllParams) {
    this.setDataGeneral(data.general);
    this.data.shape = { ...data.shape };
    this.data.border = { ...data.border };

    this.data.lockRatio = data.lockRatio;
  }

  getData() {
    return this.data;
  }
  setType(type: string) {
    this.data.type = type;
    if (type === DRAWING_MODES.SELECT) {
      this.setWithMiddleButtons(false);
      this.setWithCornerButton(false);
    } else {
      this.setWithMiddleButtons(true);
      this.setWithCornerButton(true);
    }
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
      this.setDataSize(newCoord);
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing(opacity: number = 0, mouseOnShape: string | null = null) {
    if (!this.ctxTempory) {
      return;
    }
    this.clearTemporyCanvas();
    if (opacity > 0) this.ctxTempory.globalAlpha = opacity;
    showElement(this.ctxTempory, this.data, true, mouseOnShape);
    this.lastMouseOnShape = mouseOnShape;
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

  /**
   * Action on the canvas when the mouse is down
   * @param {string} mode - mode of the action
   * @param {MouseEvent} event - mouse event
   * @returns {object} - {toReset, toContinue, pointer} - toReset: reset the action, toContinue: continue the action, pointer: cursor pointer
   */
  actionMouseDown(mode: string, event: MouseEvent): returnMouseDown {
    // if (!this.isFixed()) {
    //   return false;
    // }
    let toReset = false;
    let pointer: string | null = null;
    this.setCoordinates(event);

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
      }
    }
    return { toReset, toContinue: false, pointer } as returnMouseDown;
  }
  /**
   * Function to handle the mouse move event
   * @param {MouseEvent} event - mouse event
   * @returns {string | null} - cursor type
   */
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

    return this.followCursorOnElement(this.data.general.opacity);
  }

  /**
   * Function to handle the mouse up event
   */
  actionMouseUp() {
    this.setFixed(true);
    this.setResizing(null);

    if (this.ctxTempory === null) return;

    if (isInsideSquare(this.coordinates, this.data.size)) {
      this.ctxTempory.globalAlpha = this.data.general.opacity;
      showElement(this.ctxTempory, this.data, true, BORDER.INSIDE);
    }
  }

  actionMouseLeave() {}

  /**
   * Function to abort the action on the canvas (Escape key pressed)
   */
  actionAbort(): void {
    this.eraseSelectedArea();
    this.setType(DRAWING_MODES.SELECT);
    this.refreshDrawing(1, BORDER.INSIDE);
  }

  /**
   * Function to validate the action on the canvas (Enter key pressed)
   */
  actionValid() {
    this.validDrawedElement();
  }

  /**
   * Function to end the action on the canvas affter changing the mode
   */
  endAction() {
    this.setFixed(true);
    this.setResizing(null);
    this.clearTemporyCanvas();
  }

  /**
   * Function to start the action on the canvas, after changing the mode
   */
  startAction(): void {
    const mode = this.getType();
    switch (mode) {
      case DRAWING_MODES.SELECT:
        // Zone selection
        const rect = imageSize(this.mCanvas);
        this.memorizeSelectedArea(rect);

        this.setWithMiddleButtons(false);
        this.setWithCornerButton(false);
        this.data.canvasImageTransparent = null;
        break;
      case DRAWING_MODES.IMAGE:
        this.setWithMiddleButtons(true);
        this.setWithCornerButton(true);
        this.data.canvasImageTransparent = null;
    }
  }
  /**
   * Function to copy the selected zone in a virtual canvas
   */
  copySelection(): void {
    const area = this.getSelectedArea();
    if (area === null || this.context === null) return;
    this.data.canvasImage = copyInVirtualCanvas(this.context, area);
    this.setType(DRAWING_MODES.IMAGE);
    this.setRotation(0);
    console.log("copySelection: refreshDrawing");
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to delete the selected zone in the canvas
   */
  deleteSelection() {
    const area = this.getSelectedArea();
    if (area === null) return;
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.SELECT);
    this.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to cut the selected zone in the canvas
   */
  cutSelection() {
    const area = this.getSelectedArea();
    if (area === null || this.context === null) return;
    this.data.canvasImage = copyInVirtualCanvas(this.context, area);
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.IMAGE);
    this.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to change white to transparent in the selected zone
   */
  transparencySelection(delta: number) {
    // console.log("transparency " + delta);
    if (delta <= 0) {
      // Reset the transparency
      this.data.canvasImageTransparent = null;
    } else {
      this.data.canvasImageTransparent = document.createElement("canvas");

      if (delta < 100)
        makeWhiteTransparent(
          this.data.canvasImage,
          this.data.canvasImageTransparent,
          delta
        );
      else
        makeWhiteTransparent2(
          this.data.canvasImage,
          this.data.canvasImageTransparent,
          delta
        );
    }

    this.refreshDrawing(1, BORDER.INSIDE);
  }

  /**
   * Function to change the selected zone in black and white
   */
  blackWhiteSelection(blackWhite: boolean) {
    this.data.blackWhite = blackWhite;
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to rounded corners in the selected zone
   * @param {number} radius - radius of the corners
   */
  radiusSelection(radius: number) {
    this.data.shape.radius = radius;

    // console.log("radius ", radius);
    this.refreshDrawing(1, BORDER.INSIDE);
  }

  /**
   * Function to paste the selected zone in the MAIN canvas
   */
  pasteSelection(): void {
    this.validDrawedElement();
    this.setType(DRAWING_MODES.IMAGE);
    this.refreshDrawing(1, BORDER.INSIDE);
  }

  /**
   * Function to save the canvas in a file
   * @param {string} filename - name of the file to save
   */
  saveCanvas(filename: string = "my-file", format: string = "png") {
    if (!this.mCanvas) return;
    let area = this.getSelectedArea();

    if (area === null) {
      // find empty space
      area = imageSize(this.mCanvas);
      if (area === null) {
        return;
      }
    }
    // remove empty space
    const tempCanvas = cutOutArea(this.mCanvas, area);
    if (!tempCanvas) return;

    alertMessage("Save canvas in '" + format + "' format");

    switch (format) {
      case "svg":
        downloadCanvasToSVG(tempCanvas, filename);
        break;
      case "gif":
        downloadCanvasToGIF(tempCanvas, filename);
        break;
      default:
        downloadCanvasToPNG(tempCanvas, filename);
    }
  }

  /**
   * Function to load an image in the canvas
   * @param {string} filename - name of the file to load
   */
  loadCanvas(filename: string = "my-file", name: string) {
    const virtualCanvas = document.createElement("canvas");
    const ctx = virtualCanvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = filename;
    img.onload = () => {
      const MAX_PC = 0.9;
      const maxSize: Size = {
        width: MAX_PC * (this.mCanvas?.width || SQUARE_WIDTH),
        height: MAX_PC * (this.mCanvas?.height || SQUARE_HEIGHT),
      };

      virtualCanvas.width = img.width;
      virtualCanvas.height = img.height;
      const ratio = img.width / img.height;
      ctx.drawImage(img, 0, 0);
      this.data.canvasImage = virtualCanvas;
      this.data.canvasImageTransparent = null;

      alertMessage(
        "Image '" + name + "' loaded w:" + img.width + " h:" + img.height
      );

      const area: Area = calculateSize(img as Size, maxSize);
      area.ratio = ratio;
      this.setDataSize(area);
      this.setRotation(0);

      this.setType(DRAWING_MODES.IMAGE);
      this.refreshDrawing(0, BORDER.INSIDE);
    };
    img.onerror = () => {
      alertMessage("Error loading the file");
    };
  }
}
