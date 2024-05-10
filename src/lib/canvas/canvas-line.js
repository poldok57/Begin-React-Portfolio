import { getCoordinates } from "./canvas-tools";

const SIZE_CROSS_MIN = 16;
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
/**
 * Function to draw a point on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} coord {x, y}
 * @param {string} color - color of the point
 * @param {string} borderColor - color of the border
 * @param {number} width - width of the point
 */
export const drawPoint = (
  context,
  coord,
  color = null,
  borderColor = null,
  width = 0
) => {
  if (!coord) return;
  if (width <= 0) width = context.lineWidth;

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
 * Function to show a circle on the canvas to highlight the cursor
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} coord [x, y]
 * @param {object} element - {width, color, lineWidth, filled}
 */
export const hightLightMouseCursor = (ctx, coord, element) => {
  ctx.beginPath();

  if (element.filled) {
    ctx.fillStyle = element.color;
    ctx.arc(coord.x, coord.y, element.width / 2, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    ctx.lineWidth = element.lineWidth;
    ctx.strokeStyle = element.color;
    ctx.arc(coord.x, coord.y, element.width / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
};
/**
 * Function to draw a hatched circle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} coord {x, y} - center of the circle
 * @param {string} color - color of the circle
 * @param {string} borderColor - color of the border
 * @param {number} width - width of the circle
 */
export const hatchedCircle = (
  ctx,
  coord,
  color = null,
  borderColor = null,
  width = 0
) => {
  const lineWidth = ctx.lineWidth;
  if (width <= 0) width = lineWidth;
  const radius = width / 2;

  if (radius <= 5) {
    drawPoint(ctx, coord, color, borderColor, width);
    return;
  }

  ctx.lineWidth = Math.max(0.1, radius / 50);
  // Dessiner un cercle
  ctx.setLineDash([2, 2]);

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

  ctx.strokeStyle = borderColor ?? "black"; // Couleur des lignes
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.lineWidth = lineWidth;
};
/**
 * Function to draw a cross on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} center {x, y}
 * @param {number} width - width of the cross
 */
export const crossLine = (ctx, center, width) => {
  if (!center) return;

  width = Math.max(SIZE_CROSS_MIN, width);
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  // fine and black lines
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.moveTo(center.x, center.y - width / 2);
  ctx.lineTo(center.x, center.y + width / 2);
  ctx.moveTo(center.x - width / 2, center.y);
  ctx.lineTo(center.x + width / 2, center.y);

  ctx.stroke();
  ctx.setLineDash([]);
};

export class CanvasLine {
  constructor(canvas) {
    this.mCanvas = canvas;
    if (!canvas) return;
    this.context = canvas.getContext("2d");

    this.currentCoordinates = { x: 0, y: 0 };
    this.startCoordinates = null;
    this.endCoordinates = null;
    this.drawing = false;
  }

  // const ctx = mCanvas.getContext("2d");

  setCoordinates(event, canvas = null) {
    if (!event) return { x: 0, y: 0 };
    if (!canvas) canvas = this.mCanvas;

    this.currentCoordinates = getCoordinates(event, canvas);
    return this.currentCoordinates;
  }

  setCanvas(canvas) {
    if (!canvas) return;
    this.mCanvas = canvas;
    this.context = canvas.getContext("2d");
  }

  getCoordinates() {
    return this.currentCoordinates;
  }
  eraseCoordinate() {
    this.currentCoordinates = null;
  }

  setStartCoordinates(coord = null) {
    this.startCoordinates = coord || this.currentCoordinates;
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
    this.endCoordinates = coord || this.currentCoordinates;
  }
  getEndCoordinates() {
    return this.endCoordinates;
  }
  setDrawing(drawing) {
    this.drawing = drawing;
  }
  isDrawing() {
    return this.drawing;
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
    const end = this.currentCoordinates; // start for next segment
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
    if (!this.startCoordinates || !this.currentCoordinates) return false;

    if (this.strokeStyle) {
      context.strokeStyle = this.strokeStyle;
    }
    if (this.lineWidth) {
      context.lineWidth = this.lineWidth;
    }
    basicLine(context, this.startCoordinates, this.currentCoordinates);
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
