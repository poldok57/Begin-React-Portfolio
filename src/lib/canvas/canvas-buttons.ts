/**
 * Part of the canvas module that contains the functions to draw buttons on the canvas
 */
import { BORDER, middleButtonPosition } from "../mouse-position";
import { Area, Coordinate } from "./types";
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
 * Function to draw a circular arrow on the canvas
 * * Use the function like this
 *  ctx = document.getElementById('myCanvas').getContext('2d');
 *  centerX = 100, centerY = 100, radius = 50;
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {number} radius - radius of the circular arrow
 * @param {number} startAngle - start angle of the arrow
 * @param {number} endAngle - end angle of the arrow
 * @param {boolean} clockwise - direction of the arrow
 * @param {string} color - color of the arrow
 */
export function drawCircularArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  clockwise: boolean,
  color: string,
  opacity: number = 1
) {
  drawDisk(ctx, { x, y }, radius * 2, CIRCLE_COLOR, opacity);

  const radiusArrow = radius * 0.5;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.arc(x, y, radiusArrow, startAngle, endAngle, !clockwise);

  ctx.lineWidth = Math.min(5, radiusArrow / 10);
  ctx.stroke();
  ctx.closePath();

  // Determine the angle of the tangent at the end of the arc
  const arrowAngle = clockwise ? endAngle : endAngle - 2 * Math.PI;
  // Calculate the angle of the tangent
  const tangentAngle = arrowAngle + (clockwise ? Math.PI / 2 : -Math.PI / 2);

  // Coordinates of the arrow tip
  const arrowHeadX = x + Math.cos(arrowAngle) * radiusArrow;
  const arrowHeadY = y + Math.sin(arrowAngle) * radiusArrow;
  const headLength = 6; // Length of the arrow tip
  const sideLength = headLength * Math.tan(Math.PI / 6); // Length of the sides of the tip

  // Draw the arrow tip
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.moveTo(arrowHeadX, arrowHeadY);
  ctx.lineTo(
    arrowHeadX + headLength * Math.cos(tangentAngle),
    arrowHeadY + headLength * Math.sin(tangentAngle)
  );
  ctx.lineTo(
    arrowHeadX - sideLength * Math.cos(tangentAngle - Math.PI / 2),
    arrowHeadY - sideLength * Math.sin(tangentAngle - Math.PI / 2)
  );
  ctx.moveTo(arrowHeadX, arrowHeadY);
  ctx.lineTo(
    arrowHeadX + headLength * Math.cos(tangentAngle),
    arrowHeadY + headLength * Math.sin(tangentAngle)
  );
  ctx.lineTo(
    arrowHeadX + sideLength * Math.cos(tangentAngle - Math.PI / 2),
    arrowHeadY + sideLength * Math.sin(tangentAngle - Math.PI / 2)
  );

  ctx.closePath();
  ctx.fill();
}

export const drawTurningButtons = (
  ctx: CanvasRenderingContext2D,
  squareSize: Area,
  border: string | null
) => {
  const middleButton = middleButtonPosition(squareSize);
  // right buttons , turn shape in horary direction
  drawCircularArrow(
    ctx,
    middleButton.axeX2,
    middleButton.axeY,
    middleButton.radius,
    -Math.PI / 2,
    Math.PI * 1.75,
    true,
    "#101010",
    border === BORDER.ON_BUTTON_RIGHT ? 1 : 0.4
  );
  // left buttons, turn shape in anti-horary direction
  drawCircularArrow(
    ctx,
    middleButton.axeX1,
    middleButton.axeY,
    middleButton.radius,
    Math.PI / 2,
    -Math.PI * 0.75,
    false,
    "#101010",
    border === BORDER.ON_BUTTON_LEFT ? 1 : 0.4
  );
  return middleButton;
};
