const SIZE_CROSS_MIN = 16;
import { Coordinate, MouseCircle } from "./types";
export type drawingCircle = {
  context: CanvasRenderingContext2D;
  coordinate: Coordinate | null;
  color: string | null;
  borderColor: string | null;
  diameter: number;
};

/**
 * Function to draw a basic line on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} start {x, y}
 * @param {object} end {x, y}
 */
export const basicLine = (
  context: CanvasRenderingContext2D,
  start: Coordinate | null,
  end: Coordinate | null
) => {
  if (!start || !end) return;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
};
/**
 * Function to draw a basic cercle on the canvas
 */
export const basicCircle = (
  context: CanvasRenderingContext2D,
  coord: Coordinate,
  diameter: number
) => {
  if (!coord) return;
  context.arc(coord.x, coord.y, diameter / 2, 0, Math.PI * 2);
};
/**
 * Function to draw a point on the canvas
 * @param {drawingCircle} drawingCircle
 */
export const drawPoint: (drawingCircle: drawingCircle) => void = ({
  context,
  coordinate,
  color = null,
  borderColor = null,
  diameter = 0,
}: drawingCircle) => {
  if (!coordinate) return;
  if (diameter <= 0) diameter = context.lineWidth;

  context.beginPath();
  if (color) {
    context.fillStyle = color;
    if (borderColor) {
      context.strokeStyle = borderColor;
      context.lineWidth = 0.5;
    }
  } else context.fillStyle = context.strokeStyle;
  basicCircle(context, coordinate, diameter);
  context.fill();
  if (borderColor) context.stroke();
  context.lineWidth = diameter;
};
/**
 * Function to show a circle on the canvas to highlight the cursor
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} coord [x, y]
 * @param {object} element - {width, color, lineWidth, filled}
 */

export const hightLightMouseCursor = (
  ctx: CanvasRenderingContext2D,
  coord: Coordinate,
  element: MouseCircle
) => {
  ctx.beginPath();
  if (element.globalAlpha) ctx.globalAlpha = element.globalAlpha;

  if (element.filled) {
    ctx.fillStyle = element.color;
    basicCircle(ctx, coord, element.width);
    ctx.fill();
  } else {
    ctx.lineWidth = element.lineWidth;
    ctx.strokeStyle = element.color;
    basicCircle(ctx, coord, element.width);
    ctx.stroke();
  }
  ctx.closePath();
};
/**
 * Function to draw a hatched circle on the canvas
 * @param {drawingCircle} drawingCircle
 */
export const hatchedCircle: (drawingCircle: drawingCircle) => void = ({
  context,
  coordinate,
  color = null,
  borderColor = null,
  diameter = 0,
}: drawingCircle) => {
  const lineWidth = context.lineWidth;
  if (diameter <= 0) diameter = lineWidth;
  const radius = diameter / 2;

  if (radius <= 5) {
    drawPoint({
      context,
      coordinate,
      color,
      borderColor,
      diameter,
    } as drawingCircle);
    return;
  }

  if (!coordinate) {
    throw new Error("Drawing cercle with NULL coordinate");
  }

  context.lineWidth = Math.max(0.1, radius / 50);
  // Dessiner un cercle
  context.setLineDash([2, 2]);

  context.beginPath();
  basicCircle(context, coordinate, diameter);
  if (color) context.fillStyle = color; // Couleur de remplissage
  context.fill();
  if (borderColor) context.strokeStyle = borderColor;
  context.stroke();
  context.closePath();
  const hatchSpacing = radius > 12 ? Math.PI / 8 : Math.PI / 6;

  let startX: number, startY: number, endX: number, endY: number;
  for (let angle = 0; angle < Math.PI * 2; angle += hatchSpacing) {
    startX = coordinate.x + Math.cos(angle) * radius;
    startY = coordinate.y + Math.sin(angle) * radius;
    endX = coordinate.x - Math.sin(angle) * radius;
    endY = coordinate.y - Math.cos(angle) * radius;

    context.moveTo(startX, startY);
    context.lineTo(endX, endY);

    if (radius > 10) {
      // draw hatch on the over diagonal
      startX = coordinate.x - Math.cos(angle) * radius;
      startY = coordinate.y + Math.sin(angle) * radius;
      endX = coordinate.x + Math.sin(angle) * radius;
      endY = coordinate.y - Math.cos(angle) * radius;
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
    }
  }

  context.strokeStyle = borderColor ?? "black"; // Couleur des lignes
  context.stroke();
  context.setLineDash([]);

  context.lineWidth = lineWidth;
};
/**
 * Function to draw a cross on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} center {x, y}
 * @param {number} width - width of the cross
 */
export const crossLine = (
  ctx: CanvasRenderingContext2D,
  center: Coordinate | null,
  width: number,
  color: string | null = null,
  shape: "X" | "x" | "+" = "+"
) => {
  if (!center) return;

  width = Math.max(SIZE_CROSS_MIN, width);
  ctx.setLineDash([4, 2]);
  ctx.beginPath();
  // fine and black lines
  ctx.lineWidth = color ? 1.5 : 1;
  ctx.strokeStyle = color ?? "#111111";
  if (shape === "+") {
    ctx.moveTo(center.x, center.y - width / 2);
    ctx.lineTo(center.x, center.y + width / 2);
    ctx.moveTo(center.x - width / 2, center.y);
    ctx.lineTo(center.x + width / 2, center.y);
  } else {
    width = Math.round(width / 1.4);
    ctx.moveTo(center.x - width / 2, center.y - width / 2);
    ctx.lineTo(center.x + width / 2, center.y + width / 2);
    ctx.moveTo(center.x - width / 2, center.y + width / 2);
    ctx.lineTo(center.x + width / 2, center.y - width / 2);
  }

  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
};
