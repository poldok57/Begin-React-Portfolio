import {
  BORDER,
  badgePosition,
  middleButtonPosition,
  mouseIsInsideRect,
  mouseIsOnBorderRect,
  getRectOffset,
  resizeRect,
} from "./mouse-position";

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
  coordinate,
  area,
  withButton = true,
  withResize = true,
  withMiddleButtons = true,
  maxWidth = 0,
}) => {
  const rect = {
    left: area.x,
    top: area.y,
    right: area.x + area.width,
    bottom: area.y + area.height,
  };

  if (withButton) {
    const badgePos = badgePosition(rect, maxWidth);

    if (mouseIsInsideRect(coordinate, badgePos)) {
      return BORDER.ON_BUTTON;
    }
  }
  if (withMiddleButtons) {
    const middleButton = middleButtonPosition(rect);
    if (mouseIsInsideRect(coordinate, middleButton)) {
      if (coordinate.x < middleButton.middle) return BORDER.ON_BUTTON_LEFT;
      if (coordinate.x > middleButton.middle) return BORDER.ON_BUTTON_RIGHT;
      return BORDER.INSIDE;
    }
  }

  if (!mouseIsInsideRect(coordinate, rect)) return null;

  if (!withResize) {
    // for text mode, no need to resize
    return BORDER.INSIDE;
  }

  return mouseIsOnBorderRect(coordinate, rect);
};

export const resizeSquare = (coordinate, area, border) => {
  const coord = { ...coordinate };
  const rect = {
    left: area.x,
    top: area.y,
    right: area.x + area.width,
    bottom: area.y + area.height,
    width: area.width,
    height: area.height,
  };

  const newSquare = resizeRect(coord, rect, border);
  newSquare.x = newSquare.left;
  newSquare.y = newSquare.top;

  // coordinates of the center of the square
  // coordinate.x = newSquare.x + newSquare.width / 2;
  // coordinate.y = newSquare.y + newSquare.height / 2;
  coord.x = newSquare.x;
  coord.y = newSquare.y;

  return { coord, newSquare };
};
