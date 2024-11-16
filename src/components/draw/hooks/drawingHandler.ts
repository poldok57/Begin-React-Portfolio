import { Coordinate } from "@/lib/canvas/types";
import { clearCanvasByCtx } from "@/lib/canvas/canvas-tools";
import {
  addPictureToHistory,
  CanvasPicture,
} from "@/lib/canvas/canvas-history";

import {
  DRAWING_MODES,
  ThingsToDraw,
  AllParams,
  ParamsGeneral,
} from "@/lib/canvas/canvas-defines";

import { useDesignStore } from "@/lib/stores/design";

export type returnMouseDown = {
  toExtend?: boolean;
  toReset?: boolean;
  changeMode?: string;
  pointer?: string | null;
};

export abstract class drawingHandler {
  protected mCanvas: HTMLCanvasElement | null = null;

  protected context: CanvasRenderingContext2D | null = null;
  protected ctxTempory: CanvasRenderingContext2D | null = null;
  protected lastMouseOnShape: string | null = null;
  protected setMode: (mode: string) => void;
  protected lockRatio: boolean = false;
  protected type: string = DRAWING_MODES.PAUSE;

  protected coordinates: Coordinate | null = { x: 0, y: 0 };

  protected extendedMouseArea: boolean = false;

  protected addDesignElement: (draw: ThingsToDraw) => void;

  constructor(
    canvas: HTMLCanvasElement,
    temporyCanvas: HTMLCanvasElement | null,
    setMode: (mode: string) => void
  ) {
    if (canvas) this.setCanvas(canvas);
    this.extendedMouseArea = false;
    this.setTemporyCanvas(temporyCanvas);
    this.setMode = setMode;

    const { addOrUpdateDesignElement } = useDesignStore.getState();
    this.addDesignElement = addOrUpdateDesignElement;
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

  abstract setDataGeneral(data: ParamsGeneral): void;

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

    // reccord the draw in the design store
    const draw = this.getDraw();
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
  abstract initData(data: AllParams): void;

  abstract actionMouseDown(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): returnMouseDown;
  abstract actionMouseMove(
    event: MouseEvent | TouchEvent,
    coord: Coordinate
  ): string | null;
  abstract actionMouseUp(): void;

  abstract actionMouseLeave(): void;

  abstract refreshDrawing(opacity?: number, mouseOnShape?: string | null): void;

  // default actions for touch events
  actionTouchEnd() {
    this?.actionMouseUp();
  }
  actionTouchDown(event: TouchEvent, coord: Coordinate) {
    return this?.actionMouseDown(event, coord);
  }
}
