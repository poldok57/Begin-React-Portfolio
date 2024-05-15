import { coordinate } from "./canvas-basic";
import { DRAWING_MODES } from "./canvas-defines";

export abstract class DrawingHandler {
  protected mCanvas: HTMLCanvasElement | null = null;

  protected context: CanvasRenderingContext2D | null = null;
  protected ctxMouse: CanvasRenderingContext2D | null = null;
  protected ctxTempory: CanvasRenderingContext2D | null = null;

  protected lineWidth: number = 1;
  protected strokeStyle: string = "#000000";
  protected opacity: number = 1;

  protected type: string = DRAWING_MODES.DRAW;

  protected coordinates: coordinate = { x: 0, y: 0 };

  protected extendedMouseArea: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    if (canvas) this.setCanvas(canvas);
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  setMouseCanvas(canvas: HTMLCanvasElement) {
    this.ctxMouse = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  }

  setTemporyCanvas(canvas: HTMLCanvasElement) {
    this.ctxTempory = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D | null;
  }

  setDataGeneral(data: any) {
    this.lineWidth = data.lineWidth;
    this.strokeStyle = data.strokeStyle;
    this.opacity = data.opacity;
  }

  isExtendedMouseArea() {
    return this.extendedMouseArea;
  }
  setExtendedMouseArea(value: boolean) {
    this.extendedMouseArea = value;
  }

  setCoordinates(coordinates: coordinate) {
    this.coordinates = coordinates;
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

  abstract actionMouseDown(mode: string, event: MouseEvent): boolean;
  abstract actionMouseUp(): void;
  abstract actionMouseMove(event: MouseEvent): string;
  abstract actionMouseLeave(): void;
  abstract actionKeyDown(event: KeyboardEvent): void;

  abstract refreshDrawing(opacity: number): void;

  abstract endAction(): void;
}
