import { basicLine, crossLine } from "./canvas-basic";
import { Coordinate, LinePath, LineType } from "./types";

export class CanvasLine implements LinePath {
  mCanvas: HTMLCanvasElement | null = null;
  context: CanvasRenderingContext2D | null = null;
  type: LineType = LineType.LINE;
  coordinates: Coordinate | null = null;
  start: Coordinate | null = null;
  end: Coordinate | null = null;
  strokeStyle: string | null = null;
  lineWidth: number = 0;
  globalAlpha: number | null = null;

  constructor(canvas: HTMLCanvasElement | null = null) {
    this.setCanvas(canvas);

    this.coordinates = { x: 0, y: 0 };
    this.start = null;
    this.end = null;
  }

  setCanvas(canvas: HTMLCanvasElement | null = null) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  setType(type: LineType) {
    this.type = type;
  }

  setCoordinates(coord: Coordinate) {
    this.coordinates = coord;
    return this.coordinates;
  }

  getCoordinates() {
    return this.coordinates;
  }
  eraseCoordinate() {
    this.coordinates = null;
  }

  setStartCoordinates(coord: Coordinate | null = null) {
    this.start = coord || this.coordinates;
  }

  getStartCoordinates() {
    return this.start;
  }
  eraseStartCoordinates() {
    this.start = null;
    this.end = null;
  }

  eraseLastCoordinates() {
    if (this.end) {
      this.end = null;
      return;
    }
    this.start = null;
  }

  setEndCoordinates(coord = null) {
    this.end = coord || this.coordinates;
  }
  getEndCoordinates() {
    return this.end;
  }

  setStartFromEnd() {
    this.start = this.end;
    this.end = null;
  }

  setGlobalAlpha(alpha: number | null = null) {
    this.globalAlpha = alpha;
  }
  getGlobalAlpha() {
    return this.globalAlpha;
  }
  setLineWidth(width: number) {
    this.lineWidth = width;
  }
  getLineWidth() {
    return this.lineWidth;
  }
  setStrokeStyle(color: string) {
    this.strokeStyle = color;
  }
  getStrokeStyle() {
    return this.strokeStyle;
  }

  /**
   * Draw a line between the last coordinate and the current coordinate
   * @param {MouseEvent} event
   * @param {HTMLCanvasElement} canvas
   */
  setLine() {
    if (this.getStartCoordinates() === null) {
      // set first coordinates
      this.setStartCoordinates();
      return false;
    }

    if (this.coordinates === null) {
      return false;
    }

    this.setEndCoordinates(); // start for next segment
    return true;
  }

  showLine(context: CanvasRenderingContext2D | null = null) {
    if (context === null) {
      context = this.context;
    }
    if (context === null || !this.start || !this.coordinates) return false;

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
    }
    if (this.lineWidth) {
      context.lineWidth = this.lineWidth;
    }
    basicLine(context, this.start, this.coordinates);
  }

  setArc() {
    if (this.getStartCoordinates() === null) {
      // set first coordinates
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

  setPositions() {
    if (this.type === LineType.CURVE) {
      return this.setArc();
    }
    return this.setLine();
  }

  show(
    context: CanvasRenderingContext2D | null = null,
    withCross: boolean = false
  ) {
    if (this.type === LineType.CURVE) {
      this.showArc(context, withCross);
    } else {
      this.showLine(context);
    }
  }
}
