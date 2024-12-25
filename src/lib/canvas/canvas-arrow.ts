import { Coordinate } from "./types";

function drawCurvedLine(
  ctx: CanvasRenderingContext2D,
  from: Coordinate,
  to: Coordinate,
  controlPoint: Coordinate,
  lineWidth: number
) {
  ctx.beginPath();
  ctx.lineWidth = lineWidth;

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

  const adjustedDistance = distance - padding * 2;
  const headLength = Math.max(
    Math.min(headSize, (adjustedDistance * headSize) / 50),
    1.5 * lineWidth
  );

  const adjustedFrom = {
    x: from.x + unitX * padding,
    y: from.y + unitY * padding,
  };
  const adjustedTo = {
    x: to.x - unitX * padding,
    y: to.y - unitY * padding,
  };

  const midX = (adjustedFrom.x + adjustedTo.x) / 2;
  const midY = (adjustedFrom.y + adjustedTo.y) / 2;

  const control = {
    x: midX - (adjustedTo.y - adjustedFrom.y) * curvature,
    y: midY + (adjustedTo.x - adjustedFrom.x) * curvature,
  };

  const t =
    1 - (headLength - Math.abs(6 * curvature) * (12 + lineWidth)) / distance;

  const tangentX =
    2 * (1 - t) * (control.x - adjustedFrom.x) +
    2 * t * (adjustedTo.x - control.x);
  const tangentY =
    2 * (1 - t) * (control.y - adjustedFrom.y) +
    2 * t * (adjustedTo.y - control.y);
  const angle = Math.atan2(tangentY, tangentX);

  const backHead = {
    x: to.x - unitX * padding - (headLength / 5) * 3 * Math.cos(angle),
    y: to.y - unitY * padding - (headLength / 5) * 3 * Math.sin(angle),
  };

  // const lineEnd = {
  //   x:
  //     (1 - t) * (1 - t) * adjustedFrom.x +
  //     2 * (1 - t) * t * control.x +
  //     t * t * adjustedTo.x,
  //   y:
  //     (1 - t) * (1 - t) * adjustedFrom.y +
  //     2 * (1 - t) * t * control.y +
  //     t * t * adjustedTo.y,
  // };

  // Set the lineCap to 'butt' for a straight edge
  ctx.lineCap = "butt";

  ctx.globalAlpha = opacity;
  if (color) {
    ctx.strokeStyle = color;
  }
  // ctx.lineWidth = lineWidth;

  drawCurvedLine(ctx, adjustedFrom, backHead, control, lineWidth);

  // Draw the arrowhead
  ctx.beginPath();
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.globalAlpha = opacity;

  ctx.moveTo(
    adjustedTo.x - headLength * Math.cos(angle - Math.PI / 6),
    adjustedTo.y - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(adjustedTo.x, adjustedTo.y);

  ctx.lineTo(
    adjustedTo.x - headLength * Math.cos(angle + Math.PI / 6),
    adjustedTo.y - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(backHead.x, backHead.y);
  ctx.stroke();
  ctx.closePath();

  ctx.globalAlpha = opacity;
  ctx.fillStyle = color || ctx.strokeStyle;
  ctx.fill();

  return control;
}
