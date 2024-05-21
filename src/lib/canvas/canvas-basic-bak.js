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
 * Function to draw a basic cercle on the canvas
 */
export const basicCircle = (context, coord, diameter) => {
  context.arc(coord.x, coord.y, diameter / 2, 0, Math.PI * 2);
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
  basicCircle(context, coord, width);
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
    basicCircle(ctx, coord, element.width);
    ctx.fill();
  } else {
    ctx.lineWidth = element.lineWidth;
    ctx.strokeStyle = element.color;
    basicCircle(ctx, coord, element.width);
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
  basicCircle(ctx, coord, width);
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
  ctx.setLineDash([4, 2]);
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
