/**
 * Function to draw a basic line on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} start {x, y}
 * @param {object} end {x, y}
 */
export const basicLine = (context, start, end) => {
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.closePath();
};

export class CanvasLine {
  constructor(canvas) {
    this.mCanvas = canvas;

    this.lastCoordinate = { x: 0, y: 0 };
    this.startCoordinate = null;
    this.endCoordinate = null;
    this.drawing = false;
  }

  // const ctx = mCanvas.getContext("2d");

  setCoordinates(event, canvas = null) {
    if (!event) return { x: 0, y: 0 };

    if (!canvas) canvas = this.mCanvas;
    if (!canvas) return { x: 0, y: 0 };

    let rect = canvas.getBoundingClientRect();

    let x = event.clientX - rect.left,
      y = event.clientY - rect.top;

    return (this.lastCoordinate = { x, y });
  }

  setCanvas(canvas) {
    this.mCanvas = canvas;
  }

  getCoordinates() {
    return this.lastCoordinate;
  }
  eraseCoordinate() {
    this.lastCoordinate = null;
  }

  setStartCoordinates(coordinate = null) {
    this.startCoordinate = coordinate || this.lastCoordinate;
  }

  getStartCoordinates() {
    return this.startCoordinate;
  }
  eraseStartCoordinates() {
    this.startCoordinate = null;
  }

  setEndCoordinates(coordinate = null) {
    this.endCoordinate = coordinate || this.lastCoordinate;
  }
  getEndCoordinates() {
    return this.endCoordinate;
  }
  setDrawing(drawing) {
    this.drawing = drawing;
  }
  isDrawing() {
    return this.drawing;
  }

  drawLine(event, canvas = null) {
    if (canvas === null) canvas = this.mCanvas;
    const context = canvas.getContext("2d");
    if (!context) return false;

    let start = this.getStartCoordinates();
    const end = this.setCoordinates(event); // start for next segment
    this.setStartCoordinates(end);
    if (start !== null) {
      basicLine(context, start, end);
      return true;
    }
    return false;
  }
}
