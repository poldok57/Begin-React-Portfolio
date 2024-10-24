import { Coordinate, Area } from "@/lib/canvas/types";
import {
  // DRAWING_MODES,
  AllParams,
  ParamsGeneral,
  ParamsShape,
  ParamsText,
  // ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { BORDER, mousePointer, isInside } from "@/lib/mouse-position";
import { isInsideSquare } from "@/lib/square-position";

import { drawingHandler } from "./drawingHandler";
import { CanvasShape } from "@/lib/canvas/CanvasShape";

const [SQUARE_WIDTH, SQUARE_HEIGHT] = [120, 120];

export abstract class drawingShapeHandler extends drawingHandler {
  protected fixed: boolean = false;
  protected resizingBorder: string | null = null;
  protected offset: Coordinate | null = null;
  protected shape: CanvasShape;

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    super(canvas, temporyCanvas, setMode);

    this.fixed = false;
    this.resizingBorder = null;
    this.offset = null;
    this.shape = new CanvasShape();
  }

  initData(initData: AllParams) {
    this.shape.initData(initData);
    if (!this.context) return;
    this.shape.setDataSize({
      x: this.context.canvas.width / 2 - SQUARE_WIDTH / 2,
      y: this.context.canvas.height / 2 - SQUARE_HEIGHT / 2,
      width: SQUARE_WIDTH,
      height: SQUARE_HEIGHT,
    });
    this.shape.setWithAllButtons(true);
  }
  changeData(param: AllParams) {
    this.shape.changeData(param);
  }

  getType() {
    return this.shape.getType();
  }

  setCoordinates(coord: Coordinate) {
    this.coordinates = coord;
    if (this.coordinates && this.offset && !this.fixed) {
      const pos: Coordinate = {
        x: this.coordinates.x + this.offset.x,
        y: this.coordinates.y + this.offset.y,
      };

      this.setDataSize(pos);
    }
    return this.coordinates;
  }

  setResizing(value: string | null) {
    this.resizingBorder = value;
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
    const size: Area = this.shape.getDataSize();

    this.offset = {
      x: size.x - this.coordinates.x,
      y: size.y - this.coordinates.y,
    };
  }

  addData(data: AllParams) {
    this.shape.addData(data);
  }
  setDataSize(data: Area | Coordinate): void {
    this.shape.setDataSize(data);
  }

  setDataParams(params: Area | ParamsGeneral | ParamsShape | ParamsText) {
    this.shape.setDataParams(params);
  }

  setDataGeneral(data: ParamsGeneral): void {
    this.shape.setDataGeneral(data);
  }
  changeRotation(rotation: number): void {
    this.shape.changeRotation(rotation);
  }
  setRotation(rotation: number): void {
    this.shape.setRotation(rotation);
  }
  setDataBorder(data: ParamsGeneral) {
    this.shape.setDataBorder(data);
  }
  setDataShape(data: ParamsShape) {
    this.shape.setDataShape(data);
  }
  setDataText(data: ParamsText) {
    this.shape.setDataText(data);
  }

  setWithTurningButtons(value: boolean) {
    this.shape.setWithTurningButtons(value);
  }
  setWithCornerButton(value: boolean) {
    this.shape.setWithCornerButton(value);
  }
  setWithResize(value: boolean) {
    this.shape.setWithResize(value);
  }

  /**
   * Function to resize the square on the canvas
   */
  resizingSquare(witchBorder: string): void {
    this.clearTemporyCanvas();

    if (!this.coordinates || !this.ctxTempory) return;

    this.shape.resizingElement(
      this.ctxTempory,
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
    this.shape.draw(this.context, false, null);
    this.saveCanvasPicture();
    this.clearTemporyCanvas();
    if (withOffset) {
      // add 15px to the size to avoid the shape to be one on the other
      const size = this.shape.getDataSize();
      this.shape.setDataSize({
        ...size,
        ...{ x: size.x + 15, y: size.y + 15 },
      });
    }
  }

  /**
   * Function to refresh the element on the tempory canvas
   */
  refreshDrawing(opacity: number = 0, mouseOnShape: string | null = null) {
    this.clearTemporyCanvas();
    if (!this.ctxTempory) {
      return;
    }
    if (opacity > 0) this.ctxTempory.globalAlpha = opacity;
    this.shape.draw(this.ctxTempory, true, null);
    this.lastMouseOnShape = mouseOnShape;
  }

  /**
   * Function to follow the cursor on the canvas
   * @param {number} opacity - opacity of the element
   */
  followCursorOnElement(opacity: number) {
    let cursorType = "default";

    if (!this.ctxTempory || !this.coordinates) return cursorType;

    const mouseOnShape = this.shape.handleMouseOnShape(
      this.mCanvas,
      this.coordinates
    );

    if (mouseOnShape) {
      cursorType = mousePointer(mouseOnShape);

      if (isInside(mouseOnShape)) {
        // show real color when mouse is inside the square
        this.ctxTempory.globalAlpha = opacity;
      }
    }
    if (mouseOnShape !== this.lastMouseOnShape) {
      this.clearTemporyCanvas();
      this.shape.draw(this.ctxTempory, true, mouseOnShape);

      this.lastMouseOnShape = mouseOnShape;
    }

    return cursorType;
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
}
