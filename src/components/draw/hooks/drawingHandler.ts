import { Coordinate } from "@/lib/canvas/types";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";

import {
  DRAWING_MODES,
  ThingsToDraw,
  AllParams,
  CanvasPointsData,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";

// import { useDesignStore, zustandDesignStore } from "@/lib/stores/design";
import { zustandDesignStore } from "@/lib/stores/design";

export type returnMouseDown = {
  toExtend?: boolean;
  toReset?: boolean;
  deleteId?: string;
  changeMode?: string;
  pointer?: string | null;
};

export abstract class drawingHandler {
  protected mCanvas: HTMLCanvasElement | null = null;

  protected context: CanvasRenderingContext2D | null = null;
  protected ctxTempory: CanvasRenderingContext2D | null = null;
  protected ctxMouse: CanvasRenderingContext2D | null = null;
  protected lastMouseOnShape: string | null = null;
  protected setMode: (mode: string) => void;
  protected lockRatio: boolean = false;
  protected type: string = DRAWING_MODES.PAUSE;
  protected scale: number = 1;

  protected coordinates: Coordinate | null = { x: 0, y: 0 };

  protected extendedMouseArea: boolean = false;

  protected resizingBorder: string | null = null;

  protected addDesignElement: (draw: ThingsToDraw) => void;
  protected localStorageName: string | null = null;
  protected designStore: ReturnType<typeof zustandDesignStore>;

  constructor(
    canvas: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D | null,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void,
    localStorageName: string | null = null
  ) {
    if (canvas) this.setCanvas(canvas);
    if (canvasContext) this.setContext(canvasContext);

    this.extendedMouseArea = false;
    this.setTemporyCanvas(temporyCanvas);
    this.setMode = setMode;

    this.resizingBorder = null;
    this.localStorageName = localStorageName;

    this.designStore = zustandDesignStore(this.localStorageName);

    const { addOrUpdateDesignElement } = this.designStore.getState();
    this.addDesignElement = addOrUpdateDesignElement;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.mCanvas = canvas;
  }
  setContext(context: CanvasRenderingContext2D | null) {
    this.context = context;
  }

  setTemporyCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    this.ctxTempory = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;
  }

  setMouseCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    this.ctxMouse = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  clearTemporyCanvas(): void {
    if (!this.ctxTempory) return;
    clearCanvasByCtx(this.ctxTempory);
  }
  clearMouseCanvas(): void {
    if (!this.ctxMouse) return;
    clearCanvasByCtx(this.ctxMouse);
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

  initData(data: AllParams): void {
    this.setType(data.mode);
    this.changeData(data);
  }

  newElement(type: string, data?: AllParams) {
    this.setType(type);
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
  saveCanvasPicture(_coordinate: Coordinate | null = null) {
    const draw: ThingsToDraw | CanvasPointsData | ShapeDefinition | null =
      this.getDraw();
    if (draw) this.addDesignElement(draw);
  }

  abstract setDraw(draw: ThingsToDraw): void;
  abstract getDraw(): ThingsToDraw | null;

  startAction(): void {}
  actionKeyDown(_event: KeyboardEvent): void {}
  actionAbort(): string | null {
    return null;
  }
  actionValid(): void {}

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
