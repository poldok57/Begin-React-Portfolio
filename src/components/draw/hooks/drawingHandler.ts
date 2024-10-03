import { Coordinate, Area, ArgsMouseOnShape } from "../../../lib/canvas/types";
import {
  getMouseCoordinates,
  clearCanvasByCtx,
} from "../../../lib/canvas/canvas-tools";
import { showElement } from "../../../lib/canvas/canvas-elements";
import { mousePointer, isInside } from "../../../lib/mouse-position";
import {
  addPictureToHistory,
  CanvasPicture,
} from "../../../lib/canvas/canvas-history";

import {
  DRAWING_MODES,
  ThingsToDraw,
  ShapeDefinition,
  AllParams,
  ParamsGeneral,
} from "../../../lib/canvas/canvas-defines";
import { isOnSquareBorder } from "../../../lib/square-position";

export type returnMouseDown = {
  toContinue: boolean;
  toReset: boolean;
  pointer: string | null;
};

export abstract class drawingHandler {
  protected mCanvas: HTMLCanvasElement | null = null;

  protected context: CanvasRenderingContext2D | null = null;
  protected ctxTempory: CanvasRenderingContext2D | null = null;
  protected lastMouseOnShape: string | null = null;

  protected data: ThingsToDraw | ShapeDefinition = {
    type: DRAWING_MODES.DRAW,
    rotation: 0,
    lockRatio: false,
    withTurningButtons: false,
    withCornerButton: false,
    withResize: true,
    size: { x: 0, y: 0, width: 0, height: 0 },
    general: {
      color: "#000000",
      lineWidth: 1,
      opacity: 1,
    },
  } as ThingsToDraw;

  protected coordinates: Coordinate | null = { x: 0, y: 0 };

  protected extendedMouseArea: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    if (canvas) this.setCanvas(canvas);
    this.extendedMouseArea = false;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  setTemporyCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    this.ctxTempory = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;
  }

  clearTemporyCanvas(): void {
    if (!this.ctxTempory) return;
    clearCanvasByCtx(this.ctxTempory);
  }
  setDataSize(data: Area): void {
    this.data.size = { ...data };
  }
  setDataGeneral(data: ParamsGeneral): void {
    this.data.general = { ...data };
  }
  changeRotation(rotation: number): void {
    this.data.rotation += rotation;
  }
  setRotation(rotation: number): void {
    this.data.rotation = rotation;
  }

  isExtendedMouseArea(): boolean {
    return this.extendedMouseArea;
  }
  setExtendedMouseArea(value: boolean) {
    this.extendedMouseArea = value;
  }

  setCoordinates(event: MouseEvent) {
    if (!event || !this.mCanvas) return { x: 0, y: 0 };

    this.coordinates = getMouseCoordinates(event, this.mCanvas);
    return this.coordinates;
  }

  getCoordinates() {
    return this.coordinates;
  }

  setType(type: string) {
    this.data.type = type;
  }
  getType() {
    return this.data.type;
  }
  setWithTurningButtons(value: boolean) {
    this.data.withTurningButtons = value;
  }
  setWithCornerButton(value: boolean) {
    this.data.withCornerButton = value;
  }
  setWithResize(value: boolean) {
    this.data.withResize = value;
  }
  /**
   * Function to save the picture in the history
   */
  saveCanvasPicture(coordinate: Coordinate | null = null) {
    const coord: Coordinate | null = coordinate;
    const savePicture = {
      type: this.getType(),
      canvas: this.mCanvas,
      coordinates: coord,
      image: null,
    };
    addPictureToHistory(savePicture as CanvasPicture);
  }
  /**
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   */
  handleMouseOnShape(): string | null {
    if (this.mCanvas === null || !this.coordinates) return null;

    const argsMouseOnShape: ArgsMouseOnShape = {
      coordinate: this.coordinates,
      area: this.data.size,
      withResize: this.data.withResize,
      withCornerButton: this.data.withCornerButton,
      withTurningButtons: this.data.withTurningButtons,
      maxWidth: this.mCanvas.width,
    };

    return isOnSquareBorder(argsMouseOnShape);
  }
  /**
   * Function to follow the cursor on the canvas
   * @param {number} opacity - opacity of the element
   */
  followCursorOnElement(opacity: number) {
    let cursorType = "default";

    if (!this.ctxTempory || !this.coordinates) return cursorType;

    const mouseOnShape = this.handleMouseOnShape();

    if (mouseOnShape) {
      cursorType = mousePointer(mouseOnShape);

      if (isInside(mouseOnShape)) {
        // show real color when mouse is inside the square
        this.ctxTempory.globalAlpha = opacity;
      }
    }
    if (mouseOnShape !== this.lastMouseOnShape) {
      this.clearTemporyCanvas();
      showElement(
        this.ctxTempory,
        this.data as ShapeDefinition,
        true,
        mouseOnShape
      );
      this.lastMouseOnShape = mouseOnShape;
    }

    return cursorType;
  }

  startAction(): void {}
  actionKeyDown(_event: KeyboardEvent): void {}
  actionAbort(): void {}
  actionValid(): void {}

  actionMouseDblClick(): void {}

  abstract endAction(nextMode?: string): void;
  abstract changeData(data: AllParams): void;
  abstract initData(data: AllParams): void;

  abstract actionMouseDown(event: MouseEvent): returnMouseDown;
  abstract actionMouseMove(_event: MouseEvent): string | null;
  abstract actionMouseUp(): void;
  abstract actionMouseLeave(): void;

  abstract refreshDrawing(opacity?: number, mouseOnShape?: string | null): void;
}
