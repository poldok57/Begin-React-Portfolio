/**
 * Function to draw a basic line on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} start {x, y}
 * @param {object} end {x, y}
 */
export const basicLine = (context, start, end) => {
  if (!start || !end) return;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
};

export const drawPoint = (context, coord, color = null, borderColor = null) => {
  if (!coord) return;
  const width = context.lineWidth;

  context.beginPath();
  if (color) {
    context.fillStyle = color;
    if (borderColor) {
      context.strokeStyle = borderColor;
      context.lineWidth = 0.5;
    }
  } else context.fillStyle = context.strokeStyle;
  context.arc(coord.x, coord.y, width / 2, 0, Math.PI * 2);
  context.fill();
  if (borderColor) context.stroke();
  context.lineWidth = width;
};
/**
 * Function to draw a hatched circle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} coord {x, y} - center of the circle
 * @param {string} color - color of the circle
 * @param {string} borderColor - color of the border
 */
export const hatchedCircle = (ctx, coord, color = null, borderColor) => {
  const width = ctx.lineWidth;

  if (width < 10) {
    drawPoint(ctx, coord, color, borderColor);
    return;
  }
  const radius = width / 2;
  ctx.lineWidth = Math.max(0.1, radius / 50);
  // Dessiner un cercle
  ctx.beginPath();
  ctx.arc(coord.x, coord.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color; // Couleur de remplissage
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  const hatchSpacing = radius > 12 ? Math.PI / 8 : Math.PI / 6;

  let startX, startY, endX, endY;
  for (let angle = 0; angle < Math.PI * 2; angle += hatchSpacing) {
    startX = coord.x + Math.cos(angle) * radius;
    startY = coord.y + Math.sin(angle) * radius;
    endX = coord.x - Math.sin(angle) * radius;
    endY = coord.y - Math.cos(angle) * radius;

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    if (radius > 10) {
      // draw hatch on the over diagonal
      startX = coord.x - Math.cos(angle) * radius;
      startY = coord.y + Math.sin(angle) * radius;
      endX = coord.x + Math.sin(angle) * radius;
      endY = coord.y - Math.cos(angle) * radius;
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    }
  }

  ctx.strokeStyle = borderColor; // Couleur des lignes
  ctx.stroke();

  // ctx.restore();
  ctx.lineWidth = width;
};
/**
 * Function to draw a cross on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} center {x, y}
 * @param {number} width - width of the cross
 */
export const crossLine = (context, center, width) => {
  if (!center) return;

  context.beginPath();
  // fine and black lines
  context.lineWidth = 1;
  context.strokeStyle = "black";
  context.moveTo(center.x, center.y - width / 2);
  context.lineTo(center.x, center.y + width / 2);
  context.moveTo(center.x - width / 2, center.y);
  context.lineTo(center.x + width / 2, center.y);

  context.stroke();
};

export class CanvasLine {
  constructor(canvas) {
    this.mCanvas = canvas;
    if (!canvas) return;
    this.context = canvas.getContext("2d");

    this.currentCoordinate = { x: 0, y: 0 };
    this.startCoordinate = null;
    this.endCoordinate = null;
    this.drawing = false;
  }

  // const ctx = mCanvas.getContext("2d");

  setCoordinates(event, canvas = null) {
    if (!event) return { x: 0, y: 0 };

    if (!canvas) canvas = this.mCanvas;

    let rect = canvas.getBoundingClientRect();

    let x = event.clientX - rect.left,
      y = event.clientY - rect.top;

    return (this.currentCoordinate = { x, y });
  }

  setCanvas(canvas) {
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  getCoordinates() {
    return this.currentCoordinate;
  }
  eraseCoordinate() {
    this.currentCoordinate = null;
  }

  setStartCoordinates(coordinate = null) {
    this.startCoordinate = coordinate || this.currentCoordinate;
  }

  getStartCoordinates() {
    return this.startCoordinate;
  }
  eraseStartCoordinates() {
    this.startCoordinate = null;
    this.endCoordinate = null;
  }

  eraseLastCoordinates() {
    if (this.endCoordinate) {
      this.endCoordinate = null;
      return;
    }
    this.startCoordinate = null;
  }

  setEndCoordinates(coordinate = null) {
    this.endCoordinate = coordinate || this.currentCoordinate;
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
  setStartFromEnd() {
    this.startCoordinate = this.endCoordinate;
    this.endCoordinate = null;
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

    let start = this.getStartCoordinates();
    const end = this.currentCoordinate; // start for next segment
    this.setStartCoordinates(end);
    if (start !== null) {
      basicLine(context, start, end);
      return true;
    }
    return false;
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

    if (withCross) {
      const lineWidth = context.lineWidth;
      const color = context.strokeStyle;
      const SIZE_CROSS = 16;
      crossLine(context, start, SIZE_CROSS);
      crossLine(context, end, SIZE_CROSS);
      // crossLine(context, current, SIZE_CROSS);
      context.lineWidth = lineWidth;
      context.strokeStyle = color;
    }

    if (!start || !end) return false;

    // draw the arc between the start and end coordinates passing through current coordinate
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(current.x, current.y, end.x, end.y);
    context.stroke();
    context.closePath();

    return true;
  }
}
