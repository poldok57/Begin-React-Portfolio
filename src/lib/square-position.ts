import { Rectangle, Coordinate, Area, ArgsMouseOnShape } from "./canvas/types";
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
export const isInsideSquare = (
  coord: Coordinate | Area | null,
  square: Area | null
): boolean => {
  if (!coord || !square) return false;
  const rect = {
    left: square.x,
    top: square.y,
    right: square.x + square.width,
    bottom: square.y + square.height,
  } as Rectangle;

  return mouseIsInsideRect(coord, rect);
};

export const getSquareOffset = (coord: Coordinate, square: Coordinate) => {
  const rect: Rectangle = {
    left: square.x,
    top: square.y,
  } as Rectangle;
  return getRectOffset(coord, rect);
};

export const getSquarePosition = (coord: Coordinate, offset: Coordinate) => {
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
  } as Rectangle;

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

export const resizeSquare = (
  coordinate: Coordinate,
  area: Area,
  border: string
) => {
  const newArea: Area = { ...coordinate } as Area;
  const rect: Rectangle = {
    left: area.x,
    top: area.y,

    width: area.width,
    height: area.height,
    right: area.x + area.width,
    bottom: area.y + area.height,
  };

  const newSquare = resizeRect(newArea, rect, border);

  newArea.x = newSquare.left;
  newArea.y = newSquare.top;
  newArea.width = newSquare.width;
  newArea.height = newSquare.height;

  return { newArea, newSquare };
};
