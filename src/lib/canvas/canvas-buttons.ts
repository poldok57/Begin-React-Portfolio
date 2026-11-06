/**
 * Part of the canvas module that contains the functions to draw buttons on the canvas
 */
import { rotationHandleGeometry } from "../mouse-position";
import { Coordinate, RotationHandle, Size } from "./types";
import { basicCircle } from "./canvas-basic";
const CIRCLE_COLOR = "#e0e0e0"; // color of the circle around control buttons

export const OVERSIZE_FACTOR = 1.5;
/**
 * Function to draw a check mark
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - x coordinate
 * @param {number} y  - y coordinate
 * @param {number} size - size of the check mark
 */

export const drawCheckMark = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number = 1
) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size / 4, y + size / 4);
  ctx.lineTo(x + size, y - size / 2);
  ctx.strokeStyle = "green"; // Color of the check mark
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 2; // width of the check mark
  ctx.stroke();
  ctx.closePath();
};
/**
 * Function to draw a circle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {number} radius - radius of the circle
 * @param {string} color - color of the circle
 */

const drawDisk = (
  ctx: CanvasRenderingContext2D,
  coordinate: Coordinate,
  diameter: number,
  fillStyle: string,
  opacity: number = 1
) => {
  // cercle parameters
  // draw the circle
  ctx.beginPath();
  basicCircle(ctx, coordinate, diameter);
  // ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = fillStyle;
  ctx.globalAlpha = opacity;
  ctx.fill();
  ctx.closePath();
};

export const drawCornerButton = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity: number,
  overSize: boolean = false
) => {
  // cercle parameters
  const rad = overSize ? radius * OVERSIZE_FACTOR : radius;
  drawDisk(
    ctx,
    { x, y },
    rad * 2,
    opacity === 1 ? "white" : CIRCLE_COLOR,
    opacity
  );

  // draw the check mark
  drawCheckMark(ctx, x - 1 - radius / 2, y, radius + 1, opacity);
};

export const drawCornerButtonDelete = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity: number,
  overSize: boolean = false
) => {
  // Draw the red circle
  const rad = overSize ? radius * OVERSIZE_FACTOR : radius;
  drawDisk(ctx, { x, y }, rad * 2, "red", opacity);
  const scale = 3;
  // Draw the black X
  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.moveTo(x - radius / scale, y - radius / scale);
  ctx.lineTo(x + radius / scale, y + radius / scale);
  ctx.moveTo(x + radius / scale, y - radius / scale);
  ctx.lineTo(x - radius / scale, y + radius / scale);
  ctx.stroke();
  ctx.closePath();
};

/**
 * Draw the rotation lever: a bar from the element center to a knob.
 * `center` and `size` are in canvas pixels. Returns the hit geometry.
 */
export const drawRotationHandle = (
  ctx: CanvasRenderingContext2D,
  center: Coordinate,
  size: Size,
  rotation: number,
  active: boolean
): RotationHandle => {
  const handle = rotationHandleGeometry(center, size, rotation);
  const knobRadius = active ? handle.radius + 1.5 : handle.radius;

  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = "#1d4ed8";
  ctx.fillStyle = "#1d4ed8";
  ctx.lineWidth = active ? 2.5 : 1.5;
  ctx.globalAlpha = active ? 0.95 : 0.8;

  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(handle.handleX, handle.handleY);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(handle.handleX, handle.handleY, knobRadius, 0, Math.PI * 2);
  ctx.fillStyle = active ? "#2563eb" : "#ffffff";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1d4ed8";
  ctx.stroke();

  if (active) {
    drawRotationLabel(ctx, center, handle, rotation);
  }

  ctx.restore();
  return handle;
};

const drawRotationLabel = (
  ctx: CanvasRenderingContext2D,
  center: Coordinate,
  handle: RotationHandle,
  rotation: number
) => {
  const label = `${Math.round(rotation) % 360}°`;
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const dirX = handle.handleX - center.x;
  const dirY = handle.handleY - center.y;
  const len = Math.hypot(dirX, dirY) || 1;
  const metrics = ctx.measureText(label);
  const boxW = metrics.width + 8;
  const boxH = 16;
  let lx = handle.handleX + (-dirY / len) * (handle.radius + 16);
  let ly = handle.handleY + (dirX / len) * (handle.radius + 16);
  lx = Math.min(ctx.canvas.width - boxW / 2 - 2, Math.max(boxW / 2 + 2, lx));
  ly = Math.min(ctx.canvas.height - boxH / 2 - 2, Math.max(boxH / 2 + 2, ly));

  ctx.beginPath();
  ctx.roundRect(lx - boxW / 2, ly - boxH / 2, boxW, boxH, 4);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#1d4ed8";
  ctx.stroke();
  ctx.fillStyle = "#1e3a8a";
  ctx.fillText(label, lx, ly);
};
