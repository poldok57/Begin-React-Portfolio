import { getCoordinates } from "./canvas-tools";
import { basicLine, crossLine } from "./canvas-basic";

export class CanvasLine {
  constructor(canvas) {
    this.mCanvas = canvas;
    if (!canvas) return;
    this.context = canvas.getContext("2d");

    this.coordinates = { x: 0, y: 0 };
    this.startCoordinates = null;
    this.endCoordinates = null;
    this.drawing = false;
  }

  // const ctx = mCanvas.getContext("2d");

  setCoordinates(event, canvas = null) {
    if (!event) return { x: 0, y: 0 };
    if (!canvas) canvas = this.mCanvas;

    this.coordinates = getCoordinates(event, canvas);
    return this.coordinates;
  }

  setCanvas(canvas) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  getCoordinates() {
    return this.coordinates;
  }
  eraseCoordinate() {
    this.coordinates = null;
  }

  setStartCoordinates(coord = null) {
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

  setGlobalAlpha(alpha) {
    this.globalAlpha = alpha;
  }
  setLineWidth(width) {
    this.lineWidth = width;
  }
  setStrokeStyle(color) {
    this.strokeStyle = color;
  }

  /**
   * Draw a line between the last coordinate and the current coordinate
   * @param {MouseEvent} event
   * @param {HTMLCanvasElement} canvas
   */
  drawLine(context = null) {
    if (context === null) {
      context = this.context;
    }

    let start = this.startCoordinates;
    const end = this.coordinates; // start for next segment
    this.setStartCoordinates(end);
    if (start !== null) {
      basicLine(context, start, end);
      return true;
    }
    return false;
  }

  showLine(context) {
    if (context === null) {
      context = this.context;
    }
    if (!this.startCoordinates || !this.coordinates) return false;

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
    }
    if (this.lineWidth) {
      context.lineWidth = this.lineWidth;
    }
    basicLine(context, this.startCoordinates, this.coordinates);
  }

  drawArc(context = null) {
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

  showArc(context, withCross) {
    if (context === null) {
      context = this.context;
    }

    const current = this.getCoordinates();
    const start = this.getStartCoordinates();
    const end = this.getEndCoordinates();
    let complete = false;
    if (start && end) {
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
      complete = true;
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

    return complete;
  }
}
