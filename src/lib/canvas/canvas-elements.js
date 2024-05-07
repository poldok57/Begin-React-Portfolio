import { BORDER, badgePosition, middleButtonPosition } from "../mouse-position";
import { resizeSquare } from "../../lib/square-position";
import { SHAPE_TYPE } from "./canvas-defines";

const CIRCLE_COLOR = "#e0e0e0"; // color of the circle around control buttons
const TEXT_PADDING = 20;

/**
 * Function to draw a check mark
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - x coordinate
 * @param {number} y  - y coordinate
 * @param {number} size - size of the check mark
 */
export const drawCheckMark = (ctx, x, y, size, opacity = 1) => {
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
export const drawCircle = (ctx, x, y, radius, color, opacity = 1) => {
  // cercle parameters
  // draw the circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.fill();
};

export const drawBadge = (ctx, x, y, radius, opacity) => {
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
export const drawArrow = (ctx, x, y, size, direction) => {
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
  ctx,
  x,
  y,
  radius,
  startAngle,
  endAngle,
  clockwise,
  color,
  opacity = 1
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
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();

  radius = Math.min(parseInt(radius), width / 2, height / 2);

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
 * rotation for an element
 */
export const rotateElement = (ctx, square, angle) => {
  if (angle === 0) {
    return;
  }
  ctx.save();
  ctx.translate(square.x + square.width / 2, square.y + square.height / 2);
  ctx.rotate(angle);
  ctx.translate(
    -(square.x + square.width / 2),
    -(square.y + square.height / 2)
  );
};

/**
 * Function to show a square or an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 */
export const drawSquare = (ctx, square) => {
  let { x, y, width, height } = square;
  if (square.rotation !== 0) {
    rotateElement(ctx, square, square.rotation);
  }

  const radius = square.shape.radius;
  const filled = square.shape.filled;

  if (!filled) {
    const lineWidth = square.general.lineWidth;
    width -= lineWidth;
    height -= lineWidth;
    x += lineWidth / 2;
    y += lineWidth / 2;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = square.general.color;
  }

  ctx.beginPath();
  ctx.fillStyle = square.general.color;

  if (!radius || radius < 1) {
    ctx.lineJoin = "miter";
    ctx.rect(x, y, width, height);
  } else {
    drawRoundedRect(ctx, x, y, width, height, radius);
  }

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }

  if (square.rotation !== 0) {
    ctx.restore();
  }
};
/**
 * Function to show a square or an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 */
export const drawEllipse = (ctx, square) => {
  let { x, y, width, height } = square;
  if (!height) {
    height = width;
  }
  if (square.rotation !== 0) {
    rotateElement(ctx, square, square.rotation);
  }

  ctx.beginPath();
  ctx.fillStyle = square.general.color;

  const filled = square.shape.filled;

  if (!filled) {
    ctx.strokeStyle = square.general.color;
    ctx.lineWidth = square.general.lineWidth;
    const lineWidth = square.general.lineWidth || 1;
    width -= lineWidth;
    height -= lineWidth;
    x += lineWidth / 2;
    y += lineWidth / 2;
  }

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
  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
  ctx.closePath();

  if (square.rotation !== 0) {
    ctx.restore();
  }
};

/**
 * Function to show a border around a square or an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color,  rotation}
 */
export const drawBorder = (ctx, square) => {
  const bWidth = parseFloat(square.border.lineWidth);
  const bInterval = parseFloat(square.border.interval);
  let radius = parseInt(square.shape.radius);
  const borderShape = { ...square };

  // borderShape.general.lineWidth = bWidth;
  // borderShape.general.color = square.border.color;
  borderShape.width += bWidth * 2 + bInterval * 2;
  borderShape.height += bWidth * 2 + bInterval * 2;
  borderShape.x -= bWidth + bInterval;
  borderShape.y -= bWidth + bInterval;

  if (square.type == SHAPE_TYPE.SQUARE && radius > 0) {
    radius = radius + bWidth + bInterval;
  }
  borderShape.general = { ...square.border };
  borderShape.shape = { radius: radius, filled: false };

  switch (square.type) {
    case SHAPE_TYPE.CIRCLE:
      drawEllipse(ctx, borderShape);
      break;
    default:
      drawSquare(ctx, borderShape);
  }
};
/**
 * Function to show a text on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, type, rotation}
 */
export const drawText = (ctx, square) => {
  let w, h, paddingX, paddingY;
  const rotation = square.rotation + square.text.rotation;
  if (rotation !== 0) {
    rotateElement(ctx, square, rotation);
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

    square.width = w + 2 * paddingX;
    square.height = h + 2 * paddingY;
  } else {
    // text with rectangle or ellipse
    paddingY = (square.height - h) / 2;
    paddingX = (square.width - w) / 2;
    ctx.globalAlpha = square.general.opacity;
  }
  ctx.fillText(text, square.x + paddingX, square.y + h + paddingY);

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
export const drawButtons = (ctx, square, border) => {
  if (square.rotation !== 0 || square.type === SHAPE_TYPE.CIRCLE) {
    ctx.beginPath();
    ctx.strokeStyle = "silver";
    ctx.lineWidth = 1;
    ctx.rect(square.x, square.y, square.width, square.height);
    ctx.stroke();
  }

  const opacity = border === BORDER.ON_BUTTON ? 1 : 0.5;
  const badgePos = badgePosition(square, ctx.canvas.width);
  drawBadge(ctx, badgePos.centerX, badgePos.centerY, badgePos.radius, opacity);
  /**
   * draw the middle button used to rotate the shape
   */
  if (
    square.type === SHAPE_TYPE.TEXT ||
    (square.type === SHAPE_TYPE.CIRCLE &&
      square.width === square.height &&
      !square.shape.withText)
  ) {
    // don't show the middle button if the shape is a circle without text
    square.withMiddleButton = false;
  } else {
    square.withMiddleButton = true;

    const middleButton = middleButtonPosition(square);

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
    rotateElement(ctx, square, square.rotation);
  }
  switch (square.type) {
    case SHAPE_TYPE.TEXT:
      {
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;

        ctx.rect(square.x, square.y, square.width, square.height);
        ctx.stroke();
      }
      break;

    case SHAPE_TYPE.CIRCLE:
      // show the rectangle around the ellipse
      if (square.rotation !== 0 && square.width != square.height) {
        ctx.lineWidth = 0.5;
        ctx.rect(square.x, square.y, square.width, square.height);
        ctx.stroke();
      }
      break;

    default:
      // show the rectangle around the shape
      if (square.radius > 10 && square.shape.withBorder === false) {
        ctx.lineWidth = 0.5;
        ctx.rect(square.x, square.y, square.width, square.height);
        ctx.stroke();
      }
      break;
  }

  if (rotation !== 0) {
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
  ctx,
  square,
  withBtn = true,
  mouseOnShape = null
) => {
  switch (square.type) {
    case SHAPE_TYPE.SQUARE:
      drawSquare(ctx, square);
      break;
    case SHAPE_TYPE.CIRCLE:
      drawEllipse(ctx, square);
      break;
    case SHAPE_TYPE.TEXT:
      if (!square.text || !square.text.text) return;
      drawText(ctx, square);
  }

  if (square.type !== SHAPE_TYPE.TEXT) {
    if (square.shape.withBorder) {
      if (!withBtn) {
        ctx.globalAlpha = square.border.opacity;
      }
      drawBorder(ctx, square);
    }
    if (square.shape.withText) {
      // text inside the square
      drawText(ctx, square);
    }
  }
  if (withBtn) {
    drawButtons(ctx, square, mouseOnShape);
  }
};
/**
 * Function to resize the element on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, rotation, type, text}
 * @param {object} coordinate - {x, y}
 * @param {string} mouseOnShape - border or button where the mouse is
 */
export const resizingElement = (ctx, square, coordinate, mouseOnShape) => {
  if (mouseOnShape) {
    const { newSquare } = resizeSquare(coordinate, square, mouseOnShape);

    showElement(ctx, { ...square, ...newSquare });
    return newSquare;
  }
  return null;
};
/**
 * Function to show a circle on the canvas to highlight the cursor
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} coord [x, y]
 * @param {object} element - {x, y, width, height, color, type, rotation}
 */
export const hightLightMouseCursor = (ctx, coord, element) => {
  element.rotation = 0;
  const eHeight = element.height ?? element.width;

  element.x = coord.x - element.width / 2;
  element.y = coord.y - eHeight / 2;
  element.shape = { ...element.shape, filled: element.filled };
  element.general = { ...element.general, color: element.color };

  drawEllipse(ctx, element);
};
