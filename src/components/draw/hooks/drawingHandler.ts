import { Coordinate } from "@/lib/canvas/types";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";

import {
  DRAWING_MODES,
  ThingsToDraw,
  AllParams,
} from "@/lib/canvas/canvas-defines";

// import { useDesignStore, zustandDesignStore } from "@/lib/stores/design";

export type returnMouseDown = {
  toExtend?: boolean;
  toReset?: boolean;
  deleteId?: string;
  changeMode?: string;
  pointer?: string | null;
  reccord?: boolean;
};

export abstract class drawingHandler {
  protected mCanvas: HTMLCanvasElement | null = null;

  protected context: CanvasRenderingContext2D | null = null;
  protected ctxTemporary: CanvasRenderingContext2D | null = null;
  protected ctxMouse: CanvasRenderingContext2D | null = null;
  protected lastMouseOnShape: string | null = null;
  protected setMode: (mode: string) => void;
  protected lockRatio: boolean = false;
  protected type: string = DRAWING_MODES.PAUSE;
  protected typeHandler: string = "unknown";
  protected scale: number = 1;

  protected coordinates: Coordinate | null = { x: 0, y: 0 };

  protected extendedMouseArea: boolean = false;

  protected resizingBorder: string | null = null;

  private lastDraw: ThingsToDraw | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporaryCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    if (canvas) this.setCanvas(canvas);
    if (canvasContext) this.setContext(canvasContext);

    this.extendedMouseArea = false;
    this.setTemporyCanvas(temporaryCanvas);
    this.setMode = setMode;

    this.resizingBorder = null;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.mCanvas = canvas;
  }
  setContext(context: CanvasRenderingContext2D | null) {
    this.context = context;
  }

  setTemporyCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    this.ctxTemporary = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;
  }

  clearTemporaryCanvas(): void {
    if (!this.ctxTemporary) return;
    clearCanvasByCtx(this.ctxTemporary);
  }

  isExtendedMouseArea(): boolean {
    return this.extendedMouseArea;
  }
  setExtendedMouseArea(value: boolean) {
    this.extendedMouseArea = value;
  }

  setCoordinates(coord: Coordinate) {
    this.coordinates = coord;
    return this.coordinates;
  }

  getCoordinates() {
    return this.coordinates;
  }

  setType(type: string) {
    this.type = type;
  }

  getType() {
    return this.type;
  }

  getTypeHandler() {
    return this.typeHandler;
  }

  initData(data: AllParams): void {
    this.setType(data.mode);
    this.changeData(data);
  }

  newElement(data: AllParams) {
    this.setType(data.mode);
    if (data) this.changeData(data);
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  setResizingBorder(value: string | null) {
    this.resizingBorder = value;
  }

  /**
   * Function to save the picture in the history
   */
  saveCanvasPicture() {
    this.lastDraw = this.getDraw();
  }

  getLastDraw() {
    return this.lastDraw;
  }

  abstract setDraw(draw: ThingsToDraw): void;
  abstract getDraw(): ThingsToDraw | null;

  startAction(): void {}
  actionKeyDown(_event: KeyboardEvent): void {}
  actionAbort(): string | null {
    return null;
  }
  actionValid(): boolean {
    return true;
  }

  actionMouseDblClick(): void {}

  abstract endAction(nextMode?: string): void;
  abstract changeData(data: AllParams): void;

  abstract actionMouseDown(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): returnMouseDown;
  abstract actionMouseMove(
    event: MouseEvent | TouchEvent | null,
    coord: Coordinate
  ): string | null;
  abstract actionMouseUp(): void;

  abstract actionMouseLeave(): void;

  abstract refreshDrawing(
    opacity?: number,
    mouseOnShape?: string | null,
    id?: string
  ): void;

  abstract hightLightDrawing(): void;

  // default actions for touch events
  actionTouchEnd() {
    this?.actionMouseUp();
  }
  actionTouchDown(event: TouchEvent, coord: Coordinate) {
    return this?.actionMouseDown(event, coord);
  }
}
