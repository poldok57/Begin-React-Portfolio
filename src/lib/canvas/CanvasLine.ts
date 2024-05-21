import { getCoordinates } from "./canvas-tools";
import { basicLine, crossLine, coordinate } from "./canvas-basic";

export class CanvasLine {
  mCanvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  coordinates: coordinate | null = null;
  startCoordinates: coordinate | null;
  endCoordinates: coordinate | null;
  globalAlpha: string | null;
  strokeStyle: string | null;
  lineWidth: number = 0;
  drawing: boolean;

  constructor(canvas: HTMLCanvasElement | null = null) {
    this.setCanvas(canvas);

    this.coordinates = { x: 0, y: 0 };
    this.startCoordinates = null;
    this.endCoordinates = null;
    this.drawing = false;
  }

  setCanvas(canvas: HTMLCanvasElement | null = null) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  setCoordinates(event: MouseEvent, canvas: HTMLCanvasElement | null = null) {
    if (!event) return { x: 0, y: 0 };
    if (!canvas) canvas = this.mCanvas;

    this.coordinates = getCoordinates(event, canvas);
    return this.coordinates;
  }

  getCoordinates() {
    return this.coordinates;
  }
  eraseCoordinate() {
    this.coordinates = null;
  }

  setStartCoordinates(coord: coordinate = null) {
    this.startCoordinates = coord || this.coordinates;
  }

  getStartCoordinates() {
    return this.startCoordinates;
  }
  eraseStartCoordinates() {
    this.startCoordinates = null;
    this.endCoordinates = null;
  }

  eraseLastCoordinates() {
    if (this.endCoordinates) {
      this.endCoordinates = null;
      return;
    }
    this.startCoordinates = null;
  }

  setEndCoordinates(coord = null) {
    this.endCoordinates = coord || this.coordinates;
  }
  getEndCoordinates() {
    return this.endCoordinates;
  }

  setStartFromEnd() {
    this.startCoordinates = this.endCoordinates;
    this.endCoordinates = null;
  }

  setGlobalAlpha(alpha: string | null = null) {
    this.globalAlpha = alpha;
  }
  setLineWidth(width: number) {
    this.lineWidth = width;
  }
  setStrokeStyle(color: string) {
    this.strokeStyle = color;
  }

  /**
   * Draw a line between the last coordinate and the current coordinate
   * @param {MouseEvent} event
   * @param {HTMLCanvasElement} canvas
   */
  drawLine(context: CanvasRenderingContext2D | null = null) {
    if (context === null) {
      context = this.context;
    }

    let start = this.startCoordinates;
    const end = this.coordinates; // start for next segment
    this.setStartCoordinates(end);
    if (start !== null && end !== null && context !== null) {
      basicLine(context, start, end);
      return true;
    }
    return false;
  }

  showLine(context: CanvasRenderingContext2D | null = null) {
    if (context === null) {
      context = this.context;
    }
    if (context === null || !this.startCoordinates || !this.coordinates)
      return false;

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
    }
    if (this.lineWidth) {
      context.lineWidth = this.lineWidth;
    }
    basicLine(context, this.startCoordinates, this.coordinates);
  }

  drawArc(context: CanvasRenderingContext2D | null = null) {
    if (context === null) {
      context = this.context;
    }

    const start = this.getStartCoordinates();

    if (!start) {
      this.setStartCoordinates();
      return false;
    }
    const end = this.getEndCoordinates();
    if (!end) {
      this.setEndCoordinates();
      return false;
    }
    // definition of the arc is done
    return true;
  }

  showArc(
    context: CanvasRenderingContext2D | null = null,
    withCross: boolean = false
  ) {
    if (context === null) {
      context = this.context;
    }
    if (!context) return false;

    const current = this.getCoordinates();
    const start = this.getStartCoordinates();
    const end = this.getEndCoordinates();

    if (!context || !current) return false;

    if (start && end && current) {
      if (this.strokeStyle) {
        context.strokeStyle = this.strokeStyle;
      }
      if (this.lineWidth) {
        context.lineWidth = this.lineWidth;
      }
      // draw the arc between the start and end coordinates passing through current coordinate
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.quadraticCurveTo(current.x, current.y, end.x, end.y);
      context.stroke();
      context.closePath();
    }

    if (withCross) {
      const lineWidth = context.lineWidth;
      const strokeStyle = context.strokeStyle;

      crossLine(context, start, lineWidth * 1.8);
      crossLine(context, end, lineWidth * 1.8);
      // crossLine(context, current, SIZE_CROSS);
      context.lineWidth = lineWidth;
      context.strokeStyle = strokeStyle;
    }

    return true;
  }
}
