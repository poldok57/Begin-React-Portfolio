import { BORDER } from "./mouse-position";
import { badgePosition, middleButtonPosition } from "./mouse-position";

const CIRCLE_COLOR = "#e0e0e0"; // color of the circle

/**
 * Function to draw a basic line on the canvas
 * @param {CanvasRenderingContext2D} context
 * @param {object} start {x, y}
 * @param {object} end {x, y}
 */
export const basicLine = (context, start, end) => {
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.closePath();
};

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
  ctx.fillStyle = square.color;

  ctx.beginPath();

  if (!square.filled) {
    ctx.lineWidth = square.lineWidth;
    const lineWidth = square.lineWidth;
    width -= lineWidth;
    height -= lineWidth;
    x += lineWidth / 2;
    y += lineWidth / 2;
  }

  if (!square.radius || square.radius < 1) {
    ctx.rect(x, y, width, height);
  } else {
    drawRoundedRect(ctx, x, y, width, height, square.radius);
  }

  if (square.filled) {
    ctx.fill();
  } else {
    if (square.radius === 0) {
      ctx.lineJoin = "miter";
    }
    ctx.stroke();
  }

  if (square.rotation !== 0) {
    ctx.restore();
  }
};
/**
 * Function to show a square or an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 */
export const drawEllipse = (ctx, square) => {
  let { x, y, width, height } = square;
  if (square.rotation !== 0) {
    rotateElement(ctx, square, square.rotation);
  }

  ctx.fillStyle = square.color;
  ctx.beginPath();

  if (!square.filled) {
    ctx.lineWidth = square.lineWidth;
    const lineWidth = square.lineWidth || 1;
    width -= lineWidth;
    height -= lineWidth;
    x += lineWidth / 2;
    y += lineWidth / 2;
  }

  ctx.ellipse(
    x + width / 2,
    y + height / 2,
    width / 2,
    height / 2,
    0,
    0,
    2 * Math.PI
  );
  if (square.filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }

  if (square.rotation !== 0) {
    ctx.restore();
  }
};

/**
 * Function to show a border around a square or an ellipse on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 */
export const drawBorder = (ctx, square) => {
  const bWidth = parseFloat(square.border.width);
  const bInterval = parseFloat(square.border.interval);
  const borderShape = { ...square };

  ctx.strokeStyle = square.border.color;
  ctx.lineWidth = bWidth;
  borderShape.filled = false;
  borderShape.width += bWidth * 2 + bInterval * 2;
  borderShape.height += bWidth * 2 + bInterval * 2;
  borderShape.x -= bWidth + bInterval;
  borderShape.y -= bWidth + bInterval;

  if (borderShape.radius > 0) {
    borderShape.radius = borderShape.radius + bWidth + bInterval;
  } else {
    ctx.lineJoin = "miter";
  }

  switch (borderShape.type) {
    case "circle":
      drawEllipse(ctx, borderShape);
      break;
    default:
      drawSquare(ctx, borderShape);
  }
};
/**
 * Function to show a text on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 */
export const drawText = (ctx, square) => {
  let w, h;
  const text = square.text.text;

  if (square.rotation !== 0) {
    rotateElement(ctx, square, square.rotation);
  }

  // console.log("draw text", square);
  ctx.fillStyle = square.text.color;
  ctx.font = square.fontString;

  w = ctx.measureText(text).width;
  h = ctx.measureText(text).actualBoundingBoxAscent;

  if (square.withText) {
    // text with rectangle or ellipse
    const paddingY = (square.height - h) / 2;
    const paddingX = (square.width - w) / 2;
    ctx.globalAlpha = square.opacity;
    ctx.fillText(text, square.x + paddingX, square.y + h + paddingY);
  } else {
    // text alone
    ctx.fillText(text, square.x, square.y + h);
  }

  if (square.rotation !== 0) {
    ctx.restore();
  }
};
/**
 * Function to show a square, an ellipse or a text on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 * @param {boolean} withBtn - if the button should be displayed
 */
export const drawElement = (ctx, square, withBtn, border) => {
  switch (square.type) {
    case "text":
      drawText(ctx, square);
      break;
    case "circle":
      drawEllipse(ctx, square);
      break;
    default: // square
      drawSquare(ctx, square);
  }
  if (withBtn) {
    drawButtons(ctx, square, border);
  }
};

/**
 * draw buttons from shape on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
 * @param {string} border - border where the mouse is
 */
export const drawButtons = (ctx, square, border) => {
  if (square.rotation !== 0 || square.type === "circle") {
    ctx.beginPath();
    ctx.strokeStyle = "silver";
    ctx.lineWidth = 1;
    ctx.rect(square.x, square.y, square.width, square.height);
    ctx.stroke();
  }

  const opacity = border === BORDER.ON_BUTTON ? 1 : 0.5;
  const badgePos = badgePosition(square);
  drawBadge(ctx, badgePos.centerX, badgePos.centerY, badgePos.radius, opacity);

  const middleButton = middleButtonPosition(square);

  const opacity2 =
    border === BORDER.ON_BUTTON_LEFT || border === BORDER.ON_BUTTON_RIGHT
      ? 1
      : 0.4;
  drawCircularArrow(
    ctx,
    middleButton.axeX2,
    middleButton.axeY,
    middleButton.radius,
    Math.PI / 2,
    Math.PI * 1.75,
    true,
    "#101010",
    opacity2
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
    opacity2
  );

  if (square.rotation !== 0) {
    rotateElement(ctx, square, square.rotation);
  }
  switch (square.type) {
    case "text":
      {
        const w = ctx.measureText(square.text.text).width;
        const h = ctx.measureText(square.text.text).actualBoundingBoxAscent;

        const padding = Math.min(5, h / 2);

        // console.log("draw text, w:", square.width, " h:", square.height);
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;
        ctx.rect(
          square.x - padding,
          square.y - padding,
          w + padding * 2,
          h + padding * 2
        );
        ctx.stroke();

        square.width = w;
        square.height = h;
      }
      break;

    case "circle":
      // show the rectangle around the ellipse
      if (square.rotation !== 0 && square.width != square.height) {
        ctx.lineWidth = 0.5;
        ctx.rect(square.x, square.y, square.width, square.height);
        ctx.stroke();
      }
      break;

    default:
      // show the rectangle around the form
      if (square.radius > 10 && square.withBorder === false) {
        ctx.lineWidth = 0.5;
        ctx.rect(square.x, square.y, square.width, square.height);
        ctx.stroke();
      }
      break;
  }

  if (square.rotation !== 0) {
    ctx.restore();
  }
};
