import {
  BORDER,
  badgePosition,
  middleButtonPosition,
  mouseIsInsideRect,
  mouseIsOnBorderRect,
  getRectOffset,
  resizeRect,
} from "./mouse-position.js";

/**
 * is the mouse inside the square
 */
export const isInsideSquare = (coord, square) => {
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
  };

  const isInside = mouseIsInsideRect(coord, rect);

  return isInside;
};

export const getSquareOffset = (coord, square) => {
  const rect = {
    left: square.x,
    top: square.y,
  };
  return getRectOffset(coord, rect);
};

export const getSquarePosition = (coord, offset) => {
  return { x: coord.x + offset.x, y: coord.y + offset.y };
};

export const isOnSquareBorder = ({
  coord,
  square,
  withButton = true,
  withResize = true,
  withMiddleButton = true,
  maxWidth = 0,
}) => {
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
  };

  if (withButton) {
    const badgePos = badgePosition(rect, maxWidth);

    if (mouseIsInsideRect(coord, badgePos)) {
      return BORDER.ON_BUTTON;
    }
  }
  if (withMiddleButton) {
    const middleButton = middleButtonPosition(rect);
    if (mouseIsInsideRect(coord, middleButton)) {
      if (coord.x < middleButton.middle) return BORDER.ON_BUTTON_LEFT;
      if (coord.x > middleButton.middle) return BORDER.ON_BUTTON_RIGHT;
      return BORDER.INSIDE;
    }
  }

  if (!mouseIsInsideRect(coord, rect)) return null;

  if (!withResize) {
    // for text mode, no need to resize
    return BORDER.INSIDE;
  }

  return mouseIsOnBorderRect(coord, rect);
};

export const resizeSquare = (coordinate, square, border) => {
  const coord = { ...coordinate };
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
    width: square.width,
    height: square.height,
  };

  const newSquare = resizeRect(coord, rect, border);
  newSquare.x = newSquare.left;
  newSquare.y = newSquare.top;

  // coordinates of the center of the square
  // coord.x = newSquare.x + newSquare.width / 2;
  // coord.y = newSquare.y + newSquare.height / 2;
  coord.x = newSquare.x;
  coord.y = newSquare.y;

  return { coord, newSquare };
};
