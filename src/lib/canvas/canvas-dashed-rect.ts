/**
 * Part of the canvas module that contains the functions to draw a dashed rectangle on the canvas
 */
import { Area, Rectangle } from "./types";

const INTERVAL = 5;
export const OVERAGE = Math.round(INTERVAL * 1.6);

/**
 * Function to draw a dashed rectangle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} bounds - {left, top, right, bottom}
 */

export const drawDashedRectangle = (
  ctx: CanvasRenderingContext2D | null,
  bounds: Area | Rectangle | null,
  globalAlpha: number = 0.8
) => {
  if (!bounds || !ctx) return;
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = globalAlpha;
  ctx.beginPath();
  ctx.strokeStyle = "#201010";
  ctx.lineWidth = 0.5;
  let { width, height } = bounds;
  let x = 0,
    y = 0;
  if ("left" in bounds && "top" in bounds) {
    x = bounds.left;
    y = bounds.top;
  } else {
    x = bounds.x;
    y = bounds.y;
  }

  ctx.setLineDash([INTERVAL, (INTERVAL * 2) / 3]); // Configure the dashes: 5 pixels painted, 5 pixels unpainted

  ctx.fillStyle = "rgba(70, 70, 70, 0.20)";
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.closePath();

  x -= 1;
  y -= 1;
  width += 2;
  height += 2;
  ctx.moveTo(x - OVERAGE, y);
  ctx.lineTo(x + width + OVERAGE, y);
  ctx.moveTo(x, y - OVERAGE);
  ctx.lineTo(x, y + height + OVERAGE);
  ctx.moveTo(x + width, y - OVERAGE);
  ctx.lineTo(x + width, y + height + OVERAGE);
  ctx.moveTo(x - OVERAGE, y + height);
  ctx.lineTo(x + width + OVERAGE, y + height);
  ctx.stroke();
  ctx.setLineDash([]); // Resets to a solid line for other drawings

  // show circles at the corners
  for (let w = 0; w <= width; w += width) {
    for (let h = 0; h <= height; h += height) {
      ctx.beginPath();
      ctx.arc(x + w, y + h, 4, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }
  }
  ctx.globalAlpha = alpha;
};
