interface Point {
  x: number;
  y: number;
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
}: {
  ctx: CanvasRenderingContext2D;
  from: Point;
  to: Point;
  color: string;
  curvature?: number;
  lineWidth?: number;
  opacity?: number;
  padding?: number;
}) {
  // Calculer la distance entre les points from et to

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / distance;
  const unitY = dy / distance;

  // Ajuster les points de départ et d'arrivée en fonction du padding
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
    Math.min(30, adjustedDistance * 0.6),
    2 * lineWidth
  );

  const midX = (adjustedFrom.x + adjustedTo.x) / 2;
  const midY = (adjustedFrom.y + adjustedTo.y) / 2;
  const controlX = midX - (adjustedTo.y - adjustedFrom.y) * curvature;
  const controlY = midY + (adjustedTo.x - adjustedFrom.x) * curvature;

  // Calculer le point où la ligne s'arrête (avant la tête de flèche)
  const t = 1 - headLength / distance;
  const lineEndX =
    (1 - t) * (1 - t) * adjustedFrom.x +
    2 * (1 - t) * t * controlX +
    t * t * adjustedTo.x;
  const lineEndY =
    (1 - t) * (1 - t) * adjustedFrom.y +
    2 * (1 - t) * t * controlY +
    t * t * adjustedTo.y;

  // Dessiner la ligne courbe
  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.moveTo(adjustedFrom.x, adjustedFrom.y);
  ctx.quadraticCurveTo(controlX, controlY, lineEndX, lineEndY);
  ctx.stroke();

  // Calculer l'angle tangent à la courbe au point final
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
  ctx.fillStyle = color;
  ctx.fill();
}
