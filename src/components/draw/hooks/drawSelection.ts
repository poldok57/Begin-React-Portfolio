import { Area, Size } from "@/lib/canvas/types";
import {
  makeWhiteTransparent,
  makeWhiteTransparent2,
} from "@/lib/canvas/image-transparency";
import {
  DRAWING_MODES,
  // AllParams,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { BORDER, isOnTurnButton } from "@/lib/mouse-position";

import { copyInVirtualCanvas, calculateSize } from "@/lib/canvas/canvas-images";

import { drawingShapeHandler } from "./drawingShapHandler";
import { alertMessage } from "../../alert-messages/alertMessage";
import { imageSize, cutOutArea } from "@/lib/canvas/canvas-size";
import {
  downloadCanvasToPNG,
  downloadCanvasToSVG,
  downloadCanvasToGIF,
} from "@/lib/canvas/canvas-save";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

export class drawSelection extends drawingShapeHandler {
  protected data: ShapeDefinition = {
    size: { x: 0, y: 0, width: 0, height: 0 },
    type: DRAWING_MODES.SELECT,
  } as ShapeDefinition;
  private selectedArea: Area | null = null;
  // original size of the selection or loaded image
  private originalSize: Size | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);

    if (!canvas) return;

    this.coordinates = { x: 0, y: 0 };
  }

  setType(type: string) {
    this.shape.setType(type);
    if (type === DRAWING_MODES.SELECT) {
      this.shape.setWithAllButtons(false);
    } else {
      this.shape.setWithAllButtons(true);
    }
    this.setWithResize(true);
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
      case DRAWING_MODES.SELECT:
        // Zone selection
        const rect = imageSize(this.mCanvas);
        this.memorizeSelectedArea(rect);
        this.shape.setWithAllButtons(false);
        this.shape.setCanvasImageTransparent(null);
        break;
      case DRAWING_MODES.IMAGE:
        this.shape.setWithAllButtons(true);
        this.shape.setCanvasImageTransparent(null);
    }
  }
  /**
   * Function to copy the selected zone in a virtual canvas
   */
  copySelection(): void {
    const area = this.getSelectedArea();
    if (area === null || this.context === null) return;
    this.shape.setCanvasImage(copyInVirtualCanvas(this.context, area));
    this.setType(DRAWING_MODES.IMAGE);
    this.shape.setRotation(0);
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
    this.shape.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to cut the selected zone in the canvas
   */
  cutSelection() {
    const area = this.getSelectedArea();
    if (area === null || this.context === null) return;
    this.shape.setCanvasImage(copyInVirtualCanvas(this.context, area));
    this.context?.clearRect(area.x, area.y, area.width, area.height);
    this.saveCanvasPicture();
    this.setType(DRAWING_MODES.IMAGE);
    this.shape.setRotation(0);
    this.refreshDrawing(1, BORDER.INSIDE);
  }
  /**
   * Function to change white to transparent in the selected zone
   */
  transparencySelection(delta: number) {
    // console.log("transparency " + delta);
    if (delta <= 0) {
      // Reset the transparency
      this.shape.setCanvasImageTransparent(null);
    } else {
      this.shape.setCanvasImageTransparent(document.createElement("canvas"));

      if (delta < 100)
        makeWhiteTransparent(
          this.shape.getCanvasImage() ?? null,
          this.shape.getCanvasImageTransparent() ?? null,
          delta
        );
      else
        makeWhiteTransparent2(
          this.shape.getCanvasImage() ?? null,
          this.shape.getCanvasImageTransparent() ?? null,
          delta
        );
    }

    this.refreshDrawing(1, BORDER.INSIDE);
  }

  /**
   * Function to change the selected zone in black and white
   */
  blackWhiteSelection(blackWhite: boolean) {
    this.shape.setBlackWhite(blackWhite);
    this.refreshDrawing(1, BORDER.INSIDE);
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
      this.shape.setCanvasImage(virtualCanvas);
      this.shape.setCanvasImageTransparent(null);

      alertMessage(
        "Image '" + name + "' loaded w:" + img.width + " h:" + img.height
      );

      const area: Area = calculateSize(img as Size, maxSize);
      area.ratio = ratio;
      this.shape.setDataSize(area);
      this.shape.setRotation(0);
      this.originalSize = { ...area };

      this.setType(DRAWING_MODES.IMAGE);
      this.refreshDrawing(0, BORDER.INSIDE);
    };
    img.onerror = () => {
      alertMessage("Error loading the file");
    };
  }

  actionMouseDblClick = () => {
    const mouseOnShape = this.shape.handleMouseOnShape(
      this.mCanvas,
      this.coordinates
    );
    if (mouseOnShape && isOnTurnButton(mouseOnShape)) {
      return;
    }
    if (!this.originalSize) {
      return;
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
    this.refreshDrawing(1, BORDER.INSIDE);
  };
}
