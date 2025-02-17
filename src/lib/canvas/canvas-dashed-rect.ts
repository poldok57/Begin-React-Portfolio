/**
 * Part of the canvas module that contains the functions to draw a dashed rectangle on the canvas
 */
import { drawRoundedRect } from "./canvas-elements";
import { Area, Rectangle } from "./types";

const INTERVAL = 5;
export const OVERAGE = Math.round(INTERVAL * 1.6);
export const OVERAGE2 = OVERAGE + 1;

/**
 * Function to draw a dashed rectangle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} bounds - {left, top, right, bottom}
 */

export const drawDashedRectangle = (
  ctx: CanvasRenderingContext2D | null,
  bounds: Area | Rectangle | null,
  globalAlpha: number = 0.8,
  rotation: number = 0
) => {
  if (!bounds || !ctx) return;
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = globalAlpha;

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

  // Save the context before rotation
  if (rotation !== 0) {
    ctx.save();

    // Move the origin point to the center of the element
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Reset the origin point for drawing
    x = -width / 2;
    y = -height / 2;
  }

  ctx.beginPath();
  ctx.strokeStyle = "#201010";
  ctx.lineWidth = 0.5;
  ctx.setLineDash([INTERVAL, (INTERVAL * 2) / 3]);

  // Draw the semi-transparent rectangle
  ctx.fillStyle = "rgba(40, 40, 40, 0.20)";
  ctx.rect(x, y, width, height);
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  // Draw the dashed lines
  x -= 1;
  y -= 1;
  width += 2;
  height += 2;

  ctx.beginPath();
  ctx.moveTo(x - OVERAGE, y);
  ctx.lineTo(x + width + OVERAGE, y);
  ctx.moveTo(x, y - OVERAGE);
  ctx.lineTo(x, y + height + OVERAGE);
  ctx.moveTo(x + width, y - OVERAGE);
  ctx.lineTo(x + width, y + height + OVERAGE);
  ctx.moveTo(x - OVERAGE, y + height);
  ctx.lineTo(x + width + OVERAGE, y + height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw the circles at the corners
  for (let w = 0; w <= width; w += width) {
    for (let h = 0; h <= height; h += height) {
      ctx.beginPath();
      ctx.arc(x + w, y + h, 4, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.closePath();
    }
  }

  // Restore the context (undo rotation and translation)
  if (rotation !== 0) {
    ctx.restore();
  }
  ctx.globalAlpha = alpha;
};

/**
 * Function to draw a dashed red rectangle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} bounds - {left, top, right, bottom}
 */
export const drawDashedRedRectangle = (
  ctx: CanvasRenderingContext2D | null,
  bounds: Area | Rectangle | null,
  globalAlpha: number = 1,
  rotation: number = 0,
  overage: number = 0
) => {
  if (!bounds || !ctx) return;
  // console.log("Dashed Red Rectangle", bounds, rotation, globalAlpha);
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = globalAlpha;

  const { width, height } = bounds;
  let x = 0,
    y = 0;
  if ("left" in bounds && "top" in bounds) {
    x = bounds.left;
    y = bounds.top;
  } else {
    x = bounds.x;
    y = bounds.y;
  }

  // Save the context before rotation
  if (rotation !== 0) {
    ctx.save();

    // Move the origin point to the center of the element
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    x = -width / 2;
    y = -height / 2;
  }

  // ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 10]);

  overage += OVERAGE2;

  const area: Area = {
    x: x - overage,
    y: y - overage,
    width: width + overage * 2,
    height: height + overage * 2,
  };

  // Draw the semi-transparent rectangle
  ctx.strokeStyle = "rgba(250, 60, 60, 0.80)";

  drawRoundedRect(ctx, area, 4);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.setLineDash([]);

  // Restore the context (undo rotation and translation)
  if (rotation !== 0) {
    ctx.restore();
  }
  ctx.globalAlpha = alpha;
};
