interface Point {
  x: number;
  y: number;
}

function drawCurvedLine(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  controlPoint: Point
) {
  ctx.beginPath();

  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, to.x, to.y);
  ctx.stroke();
}

export function drawArrow({
  ctx,
  from,
  to,
  color,
  curvature = 0.2,
  lineWidth = 2,
  opacity = 1,
  padding = 5,
  headSize = 30,
}: {
  ctx: CanvasRenderingContext2D;
  from: Point;
  to: Point;
  color?: string | null;
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
    1.8 * lineWidth
  );

  const midX = (adjustedFrom.x + adjustedTo.x) / 2;
  const midY = (adjustedFrom.y + adjustedTo.y) / 2;
  const controlX = midX - (adjustedTo.y - adjustedFrom.y) * curvature;
  const controlY = midY + (adjustedTo.x - adjustedFrom.x) * curvature;

  const t = 1 - headLength / distance;
  const lineEndX =
    (1 - t) * (1 - t) * adjustedFrom.x +
    2 * (1 - t) * t * controlX +
    t * t * adjustedTo.x;
  const lineEndY =
    (1 - t) * (1 - t) * adjustedFrom.y +
    2 * (1 - t) * t * controlY +
    t * t * adjustedTo.y;

  ctx.lineCap = "round";
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

  // Dessiner la pointe de la flèche
  ctx.beginPath();
  ctx.moveTo(adjustedTo.x, adjustedTo.y);
  ctx.lineTo(
    adjustedTo.x - headLength * Math.cos(angle - Math.PI / 6),
    adjustedTo.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    adjustedTo.x - headLength * Math.cos(angle + Math.PI / 6),
    adjustedTo.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = color || ctx.strokeStyle;
  ctx.fill();
}
