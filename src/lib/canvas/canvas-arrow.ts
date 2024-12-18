import { Coordinate } from "./types";

function drawCurvedLine(
  ctx: CanvasRenderingContext2D,
  from: Coordinate,
  to: Coordinate,
  controlPoint: Coordinate
) {
  ctx.beginPath();

  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, to.x, to.y);
  ctx.stroke();
  ctx.closePath();
}

export function drawArrow({
  ctx,
  from,
  to,
  color,
  curvature = 0.1,
  lineWidth = 2,
  opacity = 1,
  padding = 5,
  headSize = 30,
}: {
  ctx: CanvasRenderingContext2D;
  from: Coordinate;
  to: Coordinate;
  color?: string | CanvasGradient | CanvasPattern | null;
  curvature?: number;
  lineWidth?: number;
  opacity?: number;
  padding?: number;
  headSize?: number;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / distance;
  const unitY = dy / distance;

  const adjustedFrom = {
    x: from.x + unitX * padding,
    y: from.y + unitY * padding,
  };
  const adjustedTo = {
    x: to.x - unitX * padding,
    y: to.y - unitY * padding,
  };

  const adjustedDistance = distance - padding * 2;
  const headLength = Math.max(
    Math.min(headSize, (adjustedDistance * headSize) / 50),
    2 * lineWidth
  );
  curvature * lineWidth;

  const midX = (adjustedFrom.x + adjustedTo.x) / 2;
  const midY = (adjustedFrom.y + adjustedTo.y) / 2;
  const controlX = midX - (adjustedTo.y - adjustedFrom.y) * curvature;
  const controlY = midY + (adjustedTo.x - adjustedFrom.x) * curvature;

  const t = 1 - (headLength - Math.abs(curvature) * lineWidth) / distance;
  const lineEndX =
    (1 - t) * (1 - t) * adjustedFrom.x +
    2 * (1 - t) * t * controlX +
    t * t * adjustedTo.x;
  const lineEndY =
    (1 - t) * (1 - t) * adjustedFrom.y +
    2 * (1 - t) * t * controlY +
    t * t * adjustedTo.y;

  // Set the lineCap to 'butt' for a straight edge
  ctx.lineCap = "butt";

  ctx.globalAlpha = opacity;
  if (color) {
    ctx.strokeStyle = color;
  }
  ctx.lineWidth = lineWidth;

  drawCurvedLine(
    ctx,
    adjustedFrom,
    { x: lineEndX, y: lineEndY },
    { x: controlX, y: controlY }
  );

  const tangentX =
    2 * (1 - t) * (controlX - adjustedFrom.x) +
    2 * t * (adjustedTo.x - controlX);
  const tangentY =
    2 * (1 - t) * (controlY - adjustedFrom.y) +
    2 * t * (adjustedTo.y - controlY);
  const angle = Math.atan2(tangentY, tangentX);

  // Draw the arrowhead
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  // ctx.globalAlpha = opacity > 0.5 ? opacity - 0.2 : opacity;

  ctx.moveTo(adjustedTo.x, adjustedTo.y);
  ctx.moveTo(adjustedTo.x, adjustedTo.y);
  ctx.lineTo(
    adjustedTo.x - headLength * Math.cos(angle - Math.PI / 6),
    adjustedTo.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    adjustedTo.x - headLength * Math.cos(angle + Math.PI / 6),
    adjustedTo.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
  ctx.closePath();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color || ctx.strokeStyle;
  ctx.fill();
  // ctx.lineWidth = lineWidth;

  return {
    x: controlX,
    y: controlY,
  };
}
