import {
  mouseIsInsideRect,
  mouseIsOnBorderRect,
  setDecalage,
  getRectDecalage,
  resizeRect,
} from "./mouse-position.js";

/**
 * is the mouse inside the square
 */
export const isInsideSquare = (coord, square, setDecal = false) => {
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
  };

  const isInside = mouseIsInsideRect(coord, rect);
  if (setDecal && isInside) {
    setDecalage(coord, rect);
  }

  return isInside;
};

export const setSquareDecalage = (coord, square) => {
  const rect = {
    left: square.x,
    top: square.y,
  };
  return setDecalage(coord, rect);
};

export const getSquareDecalage = (coord) => {
  const rect = getRectDecalage(coord);
  return { x: rect.left, y: rect.top };
};

export const isOnSquareBorder = (coord, square, withButton = false) => {
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
  };

  if (!mouseIsInsideRect(coord, rect)) return null;

  return mouseIsOnBorderRect(coord, rect, withButton);
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
