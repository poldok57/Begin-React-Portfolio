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

  // Set the lineCap to 'butt' for a straight edge
  ctx.lineCap = "butt";

  ctx.globalAlpha = opacity;
  if (color) {
    ctx.strokeStyle = color;
  }
  // ctx.lineWidth = lineWidth;

  drawCurvedLine(ctx, adjustedFrom, backHead, control, lineWidth);

  // Draw the arrowhead
  const headLine = 5;
  ctx.beginPath();
  ctx.lineWidth = headLine;
  ctx.lineCap = "round";
  ctx.globalAlpha = opacity;

  const corner1 = {
    x: adjustedTo.x - headLength * Math.cos(angle - Math.PI / 6),
    y: adjustedTo.y - headLength * Math.sin(angle - Math.PI / 6),
  };
  const corner2 = {
    x: adjustedTo.x - headLength * Math.cos(angle + Math.PI / 6),
    y: adjustedTo.y - headLength * Math.sin(angle + Math.PI / 6),
  };
  ctx.moveTo(corner1.x, corner1.y);
  ctx.lineTo(adjustedTo.x, adjustedTo.y);

  ctx.lineTo(corner2.x, corner2.y);
  ctx.lineTo(backHead.x, backHead.y);
  ctx.stroke();
  ctx.closePath();

  ctx.globalAlpha = opacity;
  ctx.fillStyle = color || ctx.strokeStyle;
  ctx.fill();
  let x = control.x;
  let y = control.y;
  if (Math.abs(curvature) >= 0.08) {
    if (x > adjustedFrom.x && control.x > adjustedTo.x) {
      x = Math.max(x, corner1.x + headLine, corner2.x + headLine);
    } else if (x < adjustedFrom.x && control.x < adjustedTo.x) {
      x = Math.min(x, corner1.x - headLine, corner2.x - headLine);
    }
    if (y > adjustedFrom.y && control.y > adjustedTo.y) {
      y = Math.max(y, corner1.y + headLine, corner2.y + headLine);
    } else if (y < adjustedFrom.y && control.y < adjustedTo.y) {
      y = Math.min(y, corner1.y - headLine, corner2.y - headLine);
    }
    if (x !== control.x || y !== control.y) {
      return { x, y };
    }
  }
  if (adjustedFrom.x < adjustedTo.x) {
    x = Math.max(x, corner1.x + headLine, corner2.x + headLine);
  } else {
    x = Math.min(x, corner1.x - headLine, corner2.x - headLine);
  }
  if (adjustedFrom.y < adjustedTo.y) {
    y = Math.max(y, corner1.y + headLine, corner2.y + headLine);
  } else {
    y = Math.min(y, corner1.y - headLine, corner2.y - headLine);
  }

  return { x, y };
}
