import { Area, Size } from "@/lib/canvas/types";
import {
  AllParams,
  DRAWING_MODES,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { BORDER, isOnTurnButton } from "@/lib/mouse-position";

import { copyInVirtualCanvas, calculateSize } from "@/lib/canvas/canvas-images";

import { drawShape } from "./drawShape";
import { alertMessage } from "../../alert-messages/alertMessage";
import { cutOutArea, getUsedArea } from "@/lib/canvas/canvas-size";
import {
  downloadCanvasToPNG,
  downloadCanvasToSVG,
  downloadCanvasToGIF,
} from "@/lib/canvas/canvas-save";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];
const MAX_SIZE = 640;
const MAX_PC = 0.9;

export class drawSelection extends drawShape {
  protected data: ShapeDefinition = {
    size: { x: 0, y: 0, width: 0, height: 0 },
    type: DRAWING_MODES.SELECT,
  } as ShapeDefinition;
  private selectedArea: Area | null = null;
  // original size of the selection or loaded image
  private originalSize: Size | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporaryCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, canvasContext, temporaryCanvas, setMode);

    this.typeHandler = DRAWING_MODES.SELECT;
  }

  setType(type: string) {
    super.setType(type);
    if (type === DRAWING_MODES.SELECT) {
      this.shape.setWithAllButtons(false);
    } else {
      this.shape.setWithAllButtons(true);
    }
  }

  /**
   * Function to get the original size of the selection or loaded image
   * @returns {object} originalSize - {x, y, width, height} of the original size
   */
  getOriginalSize(): Size | null {
    const originalImage = this.shape.getCanvasImage();
    if (originalImage) {
      this.originalSize = calculateSize(
        originalImage as Size,
        this.getMaxSize()
      );
    }
    return this.originalSize;
  }

  initData(data: AllParams) {
    super.initData(data);

    if (data.mode === DRAWING_MODES.IMAGE) {
      this.lockRatio = true;
    }
  }

  /**
   * Function to set the draw data
   * @param {object} data - data to set
   */
  async setDraw(draw: ShapeDefinition) {
    await super.setDraw(draw);

    if (draw.type === DRAWING_MODES.IMAGE) {
      this.lockRatio = true;
    }

    setTimeout(() => {
      this.getOriginalSize();
    }, 20);
  }

  /**
   * Function to mémorize the selected zone
   * @param {object} area - {x, y, width, height} of the selected zone
   */
  memorizeSelectedArea(area: Area | null = null) {
    if (area) {
      this.shape.setDataSize(area);

      this.setFixed(true);
      this.setType(DRAWING_MODES.SELECT);
    } else {
      area = this.shape.getDataSize();
    }
    this.selectedArea = area;
    this.originalSize = { ...area };
    return area;
  }
  getSelectedArea() {
    return this.selectedArea;
  }
  eraseSelectedArea() {
    this.selectedArea = null;
  }

  /**
   * Function to abort the action on the canvas (Escape key pressed)
   */
  actionAbort(): string | null {
    this.eraseSelectedArea();
    this.setType(DRAWING_MODES.SELECT);
    this.refreshDrawing(1, BORDER.INSIDE);
    return null;
  }

  /**
   * Function to start the action on the canvas, after changing the mode
   */
  startAction(): void {
    const mode = this.shape.getType();
    switch (mode) {
      case DRAWING_MODES.SELECT_AREA:
      case DRAWING_MODES.SELECT:
        // Zone selection
        const usedArea = getUsedArea(this.mCanvas);
        if (usedArea === null) {
          console.log("startAction usedArea null");
        }

        this.memorizeSelectedArea(usedArea);
        this.shape.setWithAllButtons(false);
        this.shape.setTransparency(0);
        this.shape.setCanvasImageTransparent(null);

        break;
      case DRAWING_MODES.IMAGE:
        this.shape.setWithAllButtons(true);
        this.shape.setTransparency(0);
        this.shape.setCanvasImageTransparent(null);
    }
  }

  /**
   * Function to end the action on the canvas, after changing the mode
   */
  endAction() {
    super.endAction();
    const mode = this.shape.getType();
    if (mode === DRAWING_MODES.SELECT || mode === DRAWING_MODES.SELECT_AREA) {
      // erase the selected area, in case of reccording the draw later
      this.eraseSelectedArea();
    }
  }
  /**
   * Function to copy the selected zone in a virtual canvas
   */
  copySelection(): void {
    const area = this.getSelectedArea();
    if (area === null || this.mCanvas === null) return;
    this.shape.setCanvasImage(copyInVirtualCanvas(this.mCanvas, area));
    this.setType(DRAWING_MODES.IMAGE);
    this.shape.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to delete the selected zone in the canvas
   */
  deleteSelection() {
    const area = this.getSelectedArea();
    if (area === null) return false;
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.SELECT);
    this.shape.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
    return true;
  }
  /**
   * Function to cut the selected zone in the canvas
   */
  cutSelection() {
    const area = this.getSelectedArea();
    if (area === null || this.mCanvas === null) return false;
    this.shape.setCanvasImage(copyInVirtualCanvas(this.mCanvas, area));
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.IMAGE);
    this.shape.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
    return true;
  }

  /**
   * Function to rounded corners in the selected zone
   * @param {number} radius - radius of the corners
   */
  radiusSelection(radius: number) {
    this.shape.setRadius(radius);
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
      area = getUsedArea(this.mCanvas);
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

  getMaxSize(): Size {
    return {
      width: MAX_PC * (this.mCanvas?.width || SQUARE_WIDTH),
      height: MAX_PC * (this.mCanvas?.height || SQUARE_HEIGHT),
    };
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
      const maxSize: Size = this.getMaxSize();
      // Get image format from file extension or default to png
      const fileExtension = name.split(".").pop()?.toLowerCase();
      const imageFormat =
        fileExtension && ["png", "jpg", "gif", "svg"].includes(fileExtension)
          ? fileExtension
          : fileExtension === "jpeg"
          ? "jpg"
          : "png";

      // console.log(img.width, "x", img.height, imageFormat);

      let width = img.width;
      let height = img.height;
      const ratio = width / height;

      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (ratio > 1) {
          width = MAX_SIZE;
          height = MAX_SIZE / ratio;
        } else {
          height = MAX_SIZE;
          width = MAX_SIZE * ratio;
        }
      }

      virtualCanvas.width = width;
      virtualCanvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      this.shape.setFormat(imageFormat);
      this.shape.setCanvasImageContext(ctx);
      this.shape.setTransparency(0);
      this.shape.setCanvasImageTransparent(null);
      alertMessage(
        "Image '" + name + "' loaded w:" + img.width + " h:" + img.height
      );

      const area: Area = calculateSize(img as Size, maxSize);
      area.ratio = Number(ratio.toFixed(3));
      this.shape.setDataSize(area);
      this.shape.setRotation(0);
      this.originalSize = { ...area };

      this.setType(DRAWING_MODES.IMAGE);
      setTimeout(() => {
        this.refreshDrawing(0, BORDER.INSIDE);
      }, 50);
    };
    img.onerror = () => {
      alertMessage("Error loading the file");
    };
  }

  actionMouseDblClick = () => {
    const mouseOnShape = this.shape.handleMouseOnElement(this.coordinates);

    if (mouseOnShape && isOnTurnButton(mouseOnShape)) {
      // on turn button we can double click to rotate faster
      return;
    }

    if (!this.originalSize) {
      this.getOriginalSize();
      if (!this.originalSize) {
        return;
      }
    }
    const size = this.shape.getDataSize();
    const originalRatio = this.originalSize.width / this.originalSize.height;
    const currentRatio = size.width / size.height;
    // current center
    const centreX = size.x + size.width / 2;
    const centreY = size.y + size.height / 2;
    if (currentRatio === originalRatio) {
      this.shape.setRotation(0);
      // return to the original size
      this.shape.setDataSize({
        x: centreX - this.originalSize.width / 2,
        y: centreY - this.originalSize.height / 2,
        width: this.originalSize.width,
        height: this.originalSize.height,
      } as Area);
      this.refreshDrawing(1, BORDER.INSIDE);

      return;
    }

    // calculate the current diagonal
    const currentDiagonal = Math.sqrt(
      Math.pow(size.width, 2) + Math.pow(size.height, 2)
    );

    // Calculate the new dimensions keeping the diagonal and the original ratio
    const newHeight =
      currentDiagonal / Math.sqrt(1 + Math.pow(originalRatio, 2));
    const newWidth = newHeight * originalRatio;

    // update the dimensions keeping the center
    this.shape.setDataSize({
      x: centreX - newWidth / 2,
      y: centreY - newHeight / 2,
      width: newWidth,
      height: newHeight,
    } as Area);
    this.refreshDrawing(0, BORDER.INSIDE);
  };
}
