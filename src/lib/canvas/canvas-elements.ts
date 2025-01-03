import { Area } from "./types";
import { SHAPE_TYPE } from "./canvas-defines";

type drawingProps = {
  ctx: CanvasRenderingContext2D;
  squareSize: Area;
  lineWidth?: number;
  radius?: number;
  type?: string;
  virtualCanvas?: HTMLCanvasElement | null;
  blackWhite?: boolean;
};

/**
 * Function to draw a rounded rectangle
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} area - {x, y, width, height}
 * @param {number} radius - radius of the rectangle
 */
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  area: Area,
  radius: number
) => {
  ctx.beginPath();
  const { x, y, width, height } = area;

  radius = Math.min(radius, width / 2, height / 2);

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/**
 * Function to draw a rounded rectangle
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {number} width - width of the rectangle
 * @param {number} height - height of the rectangle
 * @param {number} radius  - radius of the rectangle
 */
export const drawRectWithRoundedCorner = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number | undefined | null,
  type: string
) => {
  ctx.beginPath();

  if (!radius) radius = 0;

  radius = Math.min(radius, width / 2, height / 2);

  // type can be: ONE_RADIUS_T, ONE_RADIUS_B, TWO_RADIUS
  const radiusTop = type === SHAPE_TYPE.ONE_RADIUS_B ? radius : height / 2;
  const radiusBottom = type === SHAPE_TYPE.ONE_RADIUS_T ? radius : height / 2;

  ctx.moveTo(x + radius, y);
  ctx.lineTo(Math.max(x + width - radiusTop, x + radius), y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radiusTop);
  if (type !== SHAPE_TYPE.TWO_RADIUS)
    ctx.lineTo(x + width, y + height - radiusBottom);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    Math.max(x + width - radiusBottom, x + radius),
    y + height
  );
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

/**
 * Function to draw a shadow rectangle
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height}
 * @param {string} strockStyle - style of the stroke
 * @param {number[]} lineDash - dash of the stroke
 */
export const drawShadowRectangle = (
  ctx: CanvasRenderingContext2D,
  square: Area,
  strockStyle = "rgba(132,132,192,0.8)",
  lineDash = [5, 2]
) => {
  ctx.lineWidth = 1;
  ctx.strokeStyle = strockStyle;
  ctx.setLineDash(lineDash);

  const overflow = 12;
  ctx.beginPath();
  ctx.moveTo(square.x - overflow, square.y);
  ctx.lineTo(square.x + square.width + overflow, square.y);
  ctx.moveTo(square.x - overflow, square.y + square.height);
  ctx.lineTo(square.x + square.width + overflow, square.y + square.height);
  ctx.moveTo(square.x, square.y - overflow);
  ctx.lineTo(square.x, square.y + square.height + overflow);
  ctx.moveTo(square.x + square.width, square.y - overflow);
  ctx.lineTo(square.x + square.width, square.y + square.height + overflow);

  // ctx.rect(square.x - overflow, square.y - overflow, square.width + overflow, square.height + overflow);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(172,172,192,0.25)";
  ctx.fill();
};

/**
 * Function to show a square on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} squareSize: Area - {x, y, width, height}
 * @param {ImageData} data - image data to show on the canvas
 */
export const drawImage = ({
  ctx,
  squareSize,
  radius = 0,
  virtualCanvas,
}: drawingProps) => {
  if (!virtualCanvas || !virtualCanvas.width || !virtualCanvas.height) {
    console.error("drawImage: no image to show");
    return;
  }

  if (radius > 0) {
    ctx.save();
  }
  if (radius > 0) {
    ctx.beginPath();
    drawRoundedRect(ctx, squareSize, radius);
    ctx.clip();
  }

  const { x, y, width, height } = squareSize;
  ctx.drawImage(
    virtualCanvas,
    0,
    0,
    virtualCanvas.width,
    virtualCanvas.height,
    x,
    y,
    width,
    height
  );

  if (radius > 0) {
    ctx.restore();
  }
};

/**
 * rotation for an element
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 * @param {number} angle - angle of rotation in radian
 * @param {boolean} saveContext - save the context before rotation
 */
const rotateElement = (
  ctx: CanvasRenderingContext2D,
  sSize: Area,
  angle: number,
  saveContext = true
) => {
  if (angle === 0) {
    return;
  }
  if (saveContext) ctx.save();
  ctx.translate(sSize.x + sSize.width / 2, sSize.y + sSize.height / 2);
  // ctx.rotate(angle);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.translate(-(sSize.x + sSize.width / 2), -(sSize.y + sSize.height / 2));
};

/**
 * Function to show a canvas image on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Area} size - size of the image
 * @param {HTMLCanvasElement} canvasImage - canvas image to show
 * @param {number} rotation - rotation of the image
 */
export const showCanvasImage = (
  ctx: CanvasRenderingContext2D,
  size: Area,
  canvasImage: HTMLCanvasElement,
  rotation?: number
) => {
  if (!ctx || !canvasImage) return;

  if (rotation) {
    rotateElement(ctx, size, rotation);
  }

  drawImage({ ctx, squareSize: size, virtualCanvas: canvasImage });

  if (rotation) {
    ctx.restore();
  }
};
