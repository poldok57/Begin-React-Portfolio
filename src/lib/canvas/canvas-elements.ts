import { BORDER, badgePosition, middleButtonPosition } from "../mouse-position";
import { Coordinate, Area } from "../types";
import {
  SHAPE_TYPE,
  isDrawingShape,
  ShapeDefinition,
  paramsGeneral,
  isDrawingSquare,
} from "./canvas-defines";
import { drawBadge, drawMiddleButtons } from "./canvas-buttons";
import { drawDashedRectangle } from "./canvas-dashed-rect";

const TEXT_PADDING = 20;

/**
 * Function to draw a rounded rectangle
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 */
const drawRoundedRect = (
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
const drawRectWithRoundedCorner = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  type: string
) => {
  ctx.beginPath();

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
  ctx.rotate(angle);
  ctx.translate(-(sSize.x + sSize.width / 2), -(sSize.y + sSize.height / 2));
};

/**
 * calculate the size and position of the shape then the shape is not filled
 * @param square
 * @param lineWidth
 * @returns
 */
const getShapeSize = (square: Area, lineWidth: number = 0) => {
  let { x, y, width, height } = square;

  if (lineWidth > 0) {
    width -= lineWidth;
    height -= lineWidth;
    x += lineWidth / 2;
    y += lineWidth / 2;
  }
  return { x, y, width, height } as Area;
};

/**
 * Function to show a square on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} squareSize: Area - {x, y, width, height}
 * @param {number} lineWidth - width of the line
 * @param {number} radius - radius of the square
 */
const drawSquare = (
  ctx: CanvasRenderingContext2D,
  squareSize: Area,
  lineWidth: number,
  radius: number
) => {
  const newArea = getShapeSize(squareSize, lineWidth);

  ctx.beginPath();

  if (!radius || radius < 1) {
    ctx.lineJoin = "miter";
    const { x, y, width, height } = newArea;
    ctx.rect(x, y, width, height);
  } else {
    drawRoundedRect(ctx, newArea, radius);
  }
};
/**
 * Function to show a square with one rounded angle
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 */
const drawSquareWithRoundedCorner = (
  ctx: CanvasRenderingContext2D,
  squareSize: Area,
  lineWidth: number,
  radius: number,
  shapeType: string
) => {
  let { x, y, width, height } = getShapeSize(squareSize, lineWidth);

  if (!radius || radius < 1) {
    ctx.lineJoin = "miter";
  }
  drawRectWithRoundedCorner(ctx, x, y, width, height, radius, shapeType);
};
/**
 * Function to show an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 */
const drawEllipse = (
  ctx: CanvasRenderingContext2D,
  squareSize: Area,
  lineWidth: number,
  radius: number
) => {
  let { x, y, width, height } = getShapeSize(squareSize, lineWidth);

  if (width === height) {
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
  } else {
    ctx.ellipse(
      x + width / 2,
      y + height / 2,
      width / 2,
      height / 2,
      0,
      0,
      2 * Math.PI
    );
  }
};

/**
 * Function to show a square on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} squareSize: Area - {x, y, width, height}
 * @param {ImageData} data - image data to show on the canvas
 */
const drawImage = (
  ctx: CanvasRenderingContext2D,
  square: ShapeDefinition,
  withBtn: boolean,
  virtualCanval: HTMLCanvasElement | null
) => {
  if (!virtualCanval || !virtualCanval.width || !virtualCanval.height) {
    return;
  }
  const { rotation, blackWhite } = square;
  const squareSize = square.size;
  const radius = square.shape.radius;

  ctx.save();
  if (rotation !== 0) {
    rotateElement(ctx, squareSize, rotation, false);
  }

  let { x, y, width, height } = squareSize;

  if (radius > 0) {
    const radiusPc = (Math.min(width, height) * radius) / 100;
    ctx.beginPath();
    drawRoundedRect(ctx, squareSize, radiusPc);
    ctx.clip();
  }

  if (blackWhite) {
    ctx.filter = "grayscale(100%)";
  }
  ctx.drawImage(
    virtualCanval,
    0,
    0,
    virtualCanval.width,
    virtualCanval.height,
    x,
    y,
    width,
    height
  );

  // Draw the border if needed
  if (square.shape.withBorder) {
    if (!withBtn) {
      ctx.globalAlpha = square.border.opacity;
    }
    drawBorder(
      ctx,
      square.border,
      square.size,
      radius,
      square.type,
      isDrawingSquare
    );
  }

  ctx.restore();
};

/**
 * Function to show a border around a square or an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color,  rotation}
 * @param {object} squareBorder - {color, lineWidth, opacity, interval}
 * @param {number} radius - radius of the shape
 * @param {string} shapeType - type of the shape
 * @param {Function} drawingFunction - function to draw the shape
 */
const drawBorder = (
  ctx: CanvasRenderingContext2D,
  squareBorder: paramsGeneral,
  squareSize: Area,
  radius: number,
  shapeType: string,
  drawingFunction: Function
) => {
  const bWidth = squareBorder.lineWidth;
  const bInterval = squareBorder.interval ?? 0;

  const bSize: Area = { ...squareSize };
  const addRadius = bWidth + bInterval;
  bSize.width += addRadius * 2;
  bSize.height += addRadius * 2;
  bSize.x -= bWidth + bInterval;
  bSize.y -= bWidth + bInterval;

  let radiusB: number = radius;
  if (radius > 0) {
    radiusB += addRadius;
  }

  ctx.beginPath();
  ctx.globalAlpha = squareBorder.opacity;
  ctx.strokeStyle = squareBorder.color;
  ctx.lineWidth = bWidth;

  drawingFunction(ctx, bSize, bWidth, radiusB, shapeType);

  ctx.stroke();
};
/**
 * Function to show a text on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 */
const drawText = (ctx: CanvasRenderingContext2D, square: ShapeDefinition) => {
  let w: number, h: number, paddingX: number, paddingY: number;
  const rotation: number = square.rotation + square.text.rotation;
  if (rotation !== 0) {
    rotateElement(ctx, square.size, rotation);
  }

  const paramsText = square.text;
  const text = paramsText.text ?? "";

  ctx.font = `${paramsText.bold} ${paramsText.italic ? "italic" : ""} ${
    paramsText.fontSize
  }px ${paramsText.font}`;

  // console.log("draw text", square);
  ctx.fillStyle = paramsText.color;

  w = ctx.measureText(text).width;
  h = ctx.measureText(text).actualBoundingBoxAscent;

  if (square.type === SHAPE_TYPE.TEXT) {
    // text alone
    paddingY = paddingX = Math.min(TEXT_PADDING, h);

    square.size.width = w + 2 * paddingX;
    square.size.height = h + 2 * paddingY;
  } else {
    // text with rectangle or ellipse
    paddingY = (square.size.height - h) / 2;
    paddingX = (square.size.width - w) / 2;
    ctx.globalAlpha = square.general.opacity;
  }
  ctx.fillText(text, square.size.x + paddingX, square.size.y + h + paddingY);

  if (rotation !== 0) {
    ctx.restore();
  }
};

/**
 * draw buttons from shape on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 * @param {string} border - border where the mouse is
 */
const drawButtonsAndLines = (
  ctx: CanvasRenderingContext2D,
  square: ShapeDefinition,
  border: string | null
) => {
  const sSize: Area = square.size;
  if (square.rotation !== 0 || square.type === SHAPE_TYPE.CIRCLE) {
    const alpha: number = ctx.globalAlpha;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.strokeStyle = "silver";
    ctx.lineWidth = 1;
    ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
    ctx.stroke();
    ctx.globalAlpha = alpha;
  }

  if (square.withCornerButton) {
    const opacity = border === BORDER.ON_BUTTON ? 1 : 0.5;
    const bPos = badgePosition(square.size, ctx.canvas.width);
    drawBadge(ctx, bPos.centerX, bPos.centerY, bPos.radius, opacity);
  }
  /**
   * draw the middle button used to rotate the shape
   */
  if (square.withMiddleButtons) {
    drawMiddleButtons(ctx, sSize, border);
  }

  const rotation =
    square.rotation +
    (square.type === SHAPE_TYPE.TEXT ? square.text.rotation : 0);
  if (rotation !== 0) {
    rotateElement(ctx, square.size, square.rotation);
  }
  switch (square.type) {
    case SHAPE_TYPE.IMAGE:
      ctx.beginPath();
      ctx.strokeStyle = "rgba(49,130,236,0.6)";
      ctx.lineWidth = 4;

      ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
      ctx.stroke();
      ctx.fillStyle = "rgba(50, 50, 50, 0.20)";
      ctx.beginPath();
      ctx.rect(sSize.x + 1, sSize.y + 1, sSize.width - 2, sSize.height - 2);
      ctx.fill();
      break;
    case SHAPE_TYPE.TEXT:
      ctx.beginPath();
      ctx.strokeStyle = "grey";
      ctx.lineWidth = 1;

      ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
      ctx.stroke();
      break;

    case SHAPE_TYPE.CIRCLE:
      // show the rectangle around the ellipse
      if (square.rotation !== 0 && sSize.width != sSize.height) {
        ctx.lineWidth = 0.5;
        ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
        ctx.stroke();
      }
      break;

    default:
      // show the rectangle around the shape
      if (
        square.shape &&
        square.shape.radius > 10 &&
        square.shape.withBorder === false
      ) {
        ctx.lineWidth = 0.5;
        ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
        ctx.stroke();
      }
      break;
  }

  if (rotation !== 0) {
    ctx.restore();
  }
};

/**
 * function to shapDraw a shape on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 * @param {Function} drawingFunction - function to draw the shape
 */
const shapeDrawing = (
  ctx: CanvasRenderingContext2D,
  square: ShapeDefinition,
  withBtn: boolean,
  drawingFunction: Function
) => {
  if (square.rotation !== 0) {
    rotateElement(ctx, square.size, square.rotation);
  }

  let { radius = 0, filled } = square.shape;
  let { lineWidth, color } = square.general;

  ctx.fillStyle = color;
  if (!filled) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
  } else {
    lineWidth = 0;
  }
  ctx.beginPath();
  drawingFunction(ctx, square.size, lineWidth, radius, square.type);

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }

  // Draw the border if needed
  if (square.shape.withBorder) {
    if (!withBtn) {
      ctx.globalAlpha = square.border.opacity;
    }
    drawBorder(
      ctx,
      square.border,
      square.size,
      radius,
      square.type,
      drawingFunction
    );
  }

  if (square.rotation !== 0) {
    ctx.restore();
  }
};
/**
 * Function to show a element (square, ellipse or text) on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, rotation, type, text}
 * @param {boolean} withBtn - show button to resize the square
 * @param {string} mouseOnShape - border where the mouse is
 */
export const showElement = (
  ctx: CanvasRenderingContext2D | null,
  square: ShapeDefinition,
  withBtn: boolean = true,
  mouseOnShape: string | null = null
) => {
  if (!ctx) return;
  // console.log("show", square.type, square.size);
  switch (square.type) {
    case SHAPE_TYPE.TEXT:
      if (!square.text || !square.text.text) return;
      drawText(ctx, square);
      break;
    case SHAPE_TYPE.SELECT:
      drawDashedRectangle(ctx, square.size);
      return;
    case SHAPE_TYPE.IMAGE:
      {
        const img: HTMLCanvasElement | null =
          square.canvasImageTransparent ?? square.canvasImage;
        drawImage(ctx, square, withBtn, img);
      }
      break;
    case SHAPE_TYPE.SQUARE:
      // drawSquare(ctx, square);
      shapeDrawing(ctx, square, withBtn, drawSquare);
      break;
    case SHAPE_TYPE.CIRCLE:
      shapeDrawing(ctx, square, withBtn, drawEllipse);
      break;

    default:
      shapeDrawing(ctx, square, withBtn, drawSquareWithRoundedCorner);
      // drawSquareWithRoundedCorner(ctx, square);
      break;
  }

  if (isDrawingShape(square.type)) {
    if (square.shape.withText) {
      // text inside the square
      drawText(ctx, square);
    }
  }

  if (withBtn) {
    drawButtonsAndLines(ctx, square, mouseOnShape);
  }
};
