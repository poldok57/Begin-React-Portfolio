import { Rect, Coordinate, Area, ArgsMouseOnShape } from "./types";
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
export const isInsideSquare = (coord: Coordinate | Area, square: Area) => {
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
  } as Rect;

  const isInside = mouseIsInsideRect(coord, rect);

  return isInside;
};

export const getSquareOffset = (coord, square) => {
  const rect = {
    left: square.x,
    top: square.y,
  } as Rect;
  return getRectOffset(coord, rect);
};

export const getSquarePosition = (coord, offset) => {
  return { x: coord.x + offset.x, y: coord.y + offset.y };
};

export const isOnSquareBorder = ({
  coordinate,
  area,
  withResize = true,
  withCornerButton = true,
  withMiddleButtons = true,
  maxWidth = 0,
}: ArgsMouseOnShape) => {
  const rect = {
    left: area.x,
    top: area.y,
    right: area.x + area.width,
    bottom: area.y + area.height,
  } as Rect;

  if (withCornerButton) {
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

  coord.x = newSquare.left;
  coord.y = newSquare.top;
  coord.width = newSquare.width;
  coord.height = newSquare.height;

  return { coord, newSquare };
};
