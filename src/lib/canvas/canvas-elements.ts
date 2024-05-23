import { BORDER, badgePosition, middleButtonPosition } from "../mouse-position";
import { resizeSquare } from "../square-position";
import { Coordinate, Area } from "../types";
import {
  SHAPE_TYPE,
  isDrawingShape,
  ShapeDefinition,
  paramsGeneral,
} from "./canvas-defines";

const CIRCLE_COLOR = "#e0e0e0"; // color of the circle around control buttons
const TEXT_PADDING = 20;

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
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  opacity: number = 1
) => {
  // cercle parameters
  // draw the circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
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

  drawCircle(ctx, x, y, radius, CIRCLE_COLOR, opacity);

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
function drawCircularArrow(
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
  drawCircle(ctx, x, y, radius, CIRCLE_COLOR, opacity);

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
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();

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
 */
const rotateElement = (
  ctx: CanvasRenderingContext2D,
  sSize: Area,
  angle: number
) => {
  if (angle === 0) {
    return;
  }
  ctx.save();
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
  return { x, y, width, height };
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
  let { x, y, width, height } = getShapeSize(squareSize, lineWidth);

  ctx.beginPath();

  if (!radius || radius < 1) {
    ctx.lineJoin = "miter";
    ctx.rect(x, y, width, height);
  } else {
    drawRoundedRect(ctx, x, y, width, height, radius);
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
 * Function to draw a dashed rectangle on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} bounds - {left, top, right, bottom}
 */
export const drawDashedRectangle = (
  ctx: CanvasRenderingContext2D,
  bounds: Area
) => {
  if (!bounds) return;
  const alpha = ctx.globalAlpha;
  const interval = 5;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.strokeStyle = "#201010";
  ctx.lineWidth = 0.5;
  let { x, y, width, height } = bounds;

  const overage = interval * 1.6;

  ctx.setLineDash([interval, (interval * 2) / 3]); // Configure the dashes: 5 pixels painted, 5 pixels unpainted

  ctx.fillStyle = "rgba(70, 70, 70, 0.20)";
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.beginPath();

  x -= 1;
  y -= 1;
  width += 2;
  height += 2;
  ctx.moveTo(x - overage, y);
  ctx.lineTo(x + width + overage, y);
  ctx.moveTo(x, y - overage);
  ctx.lineTo(x, y + height + overage);
  ctx.moveTo(x + width, y - overage);
  ctx.lineTo(x + width, y + height + overage);
  ctx.moveTo(x - overage, y + height);
  ctx.lineTo(x + width + overage, y + height);
  ctx.stroke();
  ctx.setLineDash([]); // Resets to a solid line for other drawings

  // show circles at the corners
  for (let w = 0; w <= width; w += width) {
    for (let h = 0; h <= height; h += height) {
      ctx.beginPath();
      ctx.arc(x + w, y + h, 4, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = alpha;
};

/**
 * Function to show a square on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} squareSize: Area - {x, y, width, height}
 * @param {ImageData} data - image data to show on the canvas
 */
const drawImage = (
  ctx: CanvasRenderingContext2D,
  squareSize: Area,
  rotation: number,
  virtualCanval: HTMLCanvasElement
) => {
  if (!virtualCanval || !virtualCanval.width || !virtualCanval.height) {
    return;
  }
  if (rotation !== 0) {
    rotateElement(ctx, squareSize, rotation);
  }
  let { x, y, width, height } = squareSize;

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
  if (rotation !== 0) {
    ctx.restore();
  }
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
export const drawButtons = (
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
    const middleButton = middleButtonPosition(square.size);

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
  ctx: CanvasRenderingContext2D,
  square: ShapeDefinition,
  withBtn: boolean = true,
  mouseOnShape: string | null = null
) => {
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
      drawImage(ctx, square.size, square.rotation, square.canvasImage);
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
    drawButtons(ctx, square, mouseOnShape);
  }
};

const calculateRatio = (area: Area, ratio: number, mouseOnShape: string) => {
  const newArea: Area = { ...area };
  switch (mouseOnShape) {
    case BORDER.TOP:
    case BORDER.BOTTOM:
      newArea.width = area.height * ratio;
      break;
    default:
      newArea.height = area.width / ratio;
      break;
  }
  return newArea;
};

/**
 * Function to resize the element on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, rotation, type, text}
 * @param {object} coordinate - {Coordinate}
 * @param {string} mouseOnShape - border or button where the mouse is
 */
export const resizingElement = (
  ctx: CanvasRenderingContext2D,
  square: ShapeDefinition,
  coordinate: Coordinate,
  mouseOnShape: string | null
) => {
  if (square.lockRatio && !square.size.ratio) {
    square.size.ratio = square.size.width / square.size.height;
  } else {
    square.size.ratio = 0;
  }
  if (mouseOnShape) {
    let { newArea } = resizeSquare(coordinate, square.size, mouseOnShape);
    if (square.lockRatio && square.size.ratio) {
      newArea = calculateRatio(newArea, square.size.ratio, mouseOnShape);
    }

    showElement(ctx, { ...square, ...newArea });
    return newArea;
  }
  return null;
};
