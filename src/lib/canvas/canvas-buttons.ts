/**
 * Part of the canvas module that contains the functions to draw buttons on the canvas
 */
import { BORDER, middleButtonPosition } from "../mouse-position";
import { Area, Coordinate } from "./types";
import { basicCircle } from "./canvas-basic";
const CIRCLE_COLOR = "#e0e0e0"; // color of the circle around control buttons

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
  color: string,
  opacity: number = 1
) => {
  // cercle parameters
  // draw the circle
  ctx.beginPath();
  basicCircle(ctx, coordinate, diameter);
  // ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.fill();
};

export const drawBadge = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  opacity: number
) => {
  // cercle parameters
  drawDisk(ctx, { x, y }, radius * 2, CIRCLE_COLOR, opacity);

  // draw the check mark
  drawCheckMark(ctx, x - 1 - radius / 2, y, radius + 1, opacity);
};
/**
 * Function to draw an arrow on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {number} size - size of the arrow
 * @param {string} direction - direction of the arrow ('right' or 'left')
 */

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  direction: string
) => {
  ctx.beginPath();
  // Taille de la tige de la flèche
  const shaftLength = size * 0.6;
  const shaftWidth = size * 0.1;

  // Taille de la pointe de la flèche
  const headLength = size * 0.4;
  const headWidth = size * 0.3;

  // Direction de la flèche ('right' ou 'left')
  const angle = direction === "right" ? 0 : Math.PI; // 0 pour droite, π pour gauche

  // Dessiner la tige de la flèche
  ctx.moveTo(x, y - shaftWidth / 2);
  ctx.lineTo(x + shaftLength * Math.cos(angle), y - shaftWidth / 2);
  ctx.lineTo(x + shaftLength * Math.cos(angle), y + shaftWidth / 2);
  ctx.lineTo(x, y + shaftWidth / 2);
  ctx.closePath();

  // Dessiner la tête de la flèche
  ctx.moveTo(x + shaftLength * Math.cos(angle), y - headWidth / 2);
  ctx.lineTo(x + (shaftLength + headLength) * Math.cos(angle), y);
  ctx.lineTo(x + shaftLength * Math.cos(angle), y + headWidth / 2);
  ctx.closePath();

  // Appliquer le style et remplir la flèche
  ctx.fillStyle = "black";
  ctx.fill();
};
/**
 * Function to draw a circular arrow on the canvas
 * * Use the function like this
 *  ctx = document.getElementById('myCanvas').getContext('2d');
 *  centerX = 100, centerY = 100, radius = 50;
 *
 * Dessiner une flèche circulaire dans le sens horaire
 * drawCircularArrow(ctx, centerX, centerY, radius, Math.PI/2, Math.PI * 1.75, true, 'black');
 * Dessiner une flèche circulaire dans le sens anti-horaire
 * drawCircularArrow(ctx, centerX, centerY, radius, Math.PI/2, Math.PI * 1.75, false, 'red');
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

  // Déterminer l'angle de la tangente à la fin de l'arc
  const arrowAngle = clockwise ? endAngle : endAngle - 2 * Math.PI;
  // Calculer l'angle de la tangente
  const tangentAngle = arrowAngle + (clockwise ? Math.PI / 2 : -Math.PI / 2);

  // Coordonnées de la pointe de la flèche
  const arrowHeadX = x + Math.cos(arrowAngle) * radiusArrow;
  const arrowHeadY = y + Math.sin(arrowAngle) * radiusArrow;
  const headLength = 6; // Longueur de la pointe de la flèche
  const sideLength = headLength * Math.tan(Math.PI / 6); // Longueur des côtés de la pointe

  // Dessiner la pointe de la flèche
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

export const drawMiddleButtons = (
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
    Math.PI / 2,
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
};
