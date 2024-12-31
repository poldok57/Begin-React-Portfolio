import { Area, Coordinate } from "./types";

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
  ctx: CanvasRenderingContext2D | null;
  from: Coordinate;
  to: Coordinate;
  color?: string | CanvasGradient | CanvasPattern | null;
  curvature?: number;
  lineWidth?: number;
  opacity?: number;
  padding?: number;
  headSize?: number;
}): Area {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / distance;
  const unitY = dy / distance;
  const arrowLimits = [];

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

  const corner1 = {
    x: adjustedTo.x - headLength * Math.cos(angle - Math.PI / 6),
    y: adjustedTo.y - headLength * Math.sin(angle - Math.PI / 6),
  };
  const corner2 = {
    x: adjustedTo.x - headLength * Math.cos(angle + Math.PI / 6),
    y: adjustedTo.y - headLength * Math.sin(angle + Math.PI / 6),
  };
  const headLine = 5;

  if (ctx) {
    // Set the lineCap to 'butt' for a straight edge
    ctx.lineCap = "butt";

    ctx.globalAlpha = opacity;
    if (color) {
      ctx.strokeStyle = color;
    }
    drawCurvedLine(ctx, adjustedFrom, backHead, control, lineWidth);

    // Draw the arrowhead
    ctx.beginPath();
    ctx.lineWidth = headLine;
    ctx.lineCap = "round";
    ctx.globalAlpha = opacity;

    ctx.moveTo(corner1.x, corner1.y);
    ctx.lineTo(adjustedTo.x, adjustedTo.y);

    ctx.lineTo(corner2.x, corner2.y);
    ctx.lineTo(backHead.x, backHead.y);
    ctx.stroke();
    ctx.closePath();

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color || ctx.strokeStyle;
    ctx.fill();
  }

  /**
   * get position of all arrow limits to get the Area of the arrow
   */
  arrowLimits.push(control);

  if (corner1.x > corner2.x) {
    corner1.x += headLine;
    corner2.x -= headLine;
  } else {
    corner1.x -= headLine;
    corner2.x += headLine;
  }
  if (corner1.y > corner2.y) {
    corner1.y += headLine;
    corner2.y -= headLine;
  } else {
    corner1.y -= headLine;
    corner2.y += headLine;
  }
  arrowLimits.push(corner1);
  arrowLimits.push(corner2);

  if (adjustedFrom.x < adjustedTo.x) {
    adjustedFrom.x -= lineWidth / 2 + 1;
    adjustedTo.x += headLine;
  } else {
    adjustedFrom.x += lineWidth / 2 + 1;
    adjustedTo.x -= headLine;
  }
  if (adjustedFrom.y < adjustedTo.y) {
    adjustedFrom.y -= lineWidth / 2 + 1;
    adjustedTo.y += headLine;
  } else {
    adjustedFrom.y += lineWidth / 2 + 1;
    adjustedTo.y -= headLine;
  }
  arrowLimits.push(adjustedFrom);
  arrowLimits.push(adjustedTo);

  const x = Math.min(...arrowLimits.map((limit) => limit.x));
  const right = Math.max(...arrowLimits.map((limit) => limit.x));
  const y = Math.min(...arrowLimits.map((limit) => limit.y));
  const bottom = Math.max(...arrowLimits.map((limit) => limit.y));
  const width = right - x;
  const height = bottom - y;

  return { x, y, width, height };
}
