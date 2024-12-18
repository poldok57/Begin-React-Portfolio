import { basicLine, crossLine } from "./canvas-basic";
import { Coordinate, LinePath, LineType } from "./types";
import { drawArrow } from "./canvas-arrow";

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
  headSize: number = 0;
  padding: number = 2;
  curvature: number = 0.2;

  constructor(canvas: HTMLCanvasElement | null = null) {
    this.setCanvas(canvas);

    this.coordinates = null;
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
  eraseCoordinates() {
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

  eraseEndCoordinates() {
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
    this.coordinates = null;
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
    if (this.start === null) {
      // set first coordinates
      this.setStartCoordinates();
      return false;
    }

    const end = this.end;
    if (!end) {
      this.setEndCoordinates();
      return false;
    }

    // if the start and end are too close, we don't draw the arc
    if (
      Math.abs(this.start.x - end.x) < 2 &&
      Math.abs(this.start.y - end.y) < 2
    ) {
      this.end = null;
      return false;
    }
    // definition of the arc is done
    return true;
  }

  showCross(context: CanvasRenderingContext2D | null = null) {
    if (context === null) {
      context = this.context;
    }
    if (!context) return false;

    const memo = {
      lineWidth: context.lineWidth,
      strokeStyle: context.strokeStyle,
    };
    if (this.start) {
      crossLine(context, this.start, this.lineWidth * 1.8);
    }
    if (this.end) {
      crossLine(context, this.end, this.lineWidth * 1.8);
    }
    context.lineWidth = memo.lineWidth;
    context.strokeStyle = memo.strokeStyle;
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

    if (current && start && !end) {
      // draw preview line
      drawArrow({
        ctx: context,
        from: start,
        to: current,
        color: this.strokeStyle,
        opacity: 0.2,
        lineWidth: this.lineWidth,
        headSize: 15,
        padding: 10,
      });
      return false;
    }

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
      this.showCross(context);
    }

    return true;
  }

  showArrow(
    context: CanvasRenderingContext2D | null = null,
    withCross: boolean = false
  ) {
    if (context === null) {
      context = this.context;
    }
    if (!context) return false;

    if (this.start && this.coordinates) {
      drawArrow({
        ctx: context,
        from: this.start,
        to: this.end ?? this.coordinates,
        color: this.strokeStyle || "rgba(128, 128, 128, 0.7)",
        lineWidth: this.lineWidth,
        curvature: this.curvature || 0,
        opacity: this.globalAlpha || 1,
        padding: this.padding || 0,
        headSize: this.headSize || 15,
      });
    }
    if (withCross) {
      this.showCross(context);
    }
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
    switch (this.type) {
      case LineType.CURVE:
        this.showArc(context, withCross);
        break;
      case LineType.ARROW:
        this.showArrow(context, withCross);
        break;
      default:
        this.showLine(context);
    }
  }

  arrowForArc(ctx: CanvasRenderingContext2D, from: Coordinate, to: Coordinate) {
    drawArrow({
      ctx: ctx,
      from: from,
      to: to,
      color: "rgba(128, 128, 128, 0.7)",
      curvature: 0,
      lineWidth: 6,
      opacity: 0.5,
      padding: 8,
    });
  }

  showLineEnds(ctx: CanvasRenderingContext2D, withLine: boolean = false) {
    const crossWidth = Math.min(ctx.lineWidth * 2, 30);

    if (this.start) {
      crossLine(ctx, this.start, crossWidth);
    }
    if (this.end) {
      crossLine(ctx, this.end, crossWidth);
    }
    if (withLine && this.start && this.end) {
      const alpha = ctx.globalAlpha;
      ctx.globalAlpha = 0.25;
      this.showLine(ctx);
      ctx.globalAlpha = alpha;

      // Draw two small gray perpendicular arrows in the middle of the line
      if (this.start && this.end) {
        const midX = (this.start.x + this.end.x) / 2;
        const midY = (this.start.y + this.end.y) / 2;

        // Calculate the perpendicular vector to the line
        const dx = this.end.x - this.start.x;
        const dy = this.end.y - this.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / length;
        const perpY = dx / length;

        // Define the start and end points for the arrows
        const arrowLength = 32;
        const from = { x: midX, y: midY };
        const to1 = {
          x: midX + perpX * arrowLength,
          y: midY + perpY * arrowLength,
        };
        const to2 = {
          x: midX - perpX * arrowLength,
          y: midY - perpY * arrowLength,
        };

        // Draw the arrows
        this.arrowForArc(ctx, from, to1);
        this.arrowForArc(ctx, from, to2);
      }
    }
  }
}
