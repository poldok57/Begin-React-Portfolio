import { Rectangle, Coordinate, Area, ArgsMouseOnShape } from "./canvas/types";
import {
  BORDER,
  topRightPosition,
  middleButtonPosition,
  coordinateIsInsideRect,
  mouseIsOnBorderRect,
  getRectOffset,
  resizeRect,
  topRightPositionOver,
} from "./mouse-position";

export const rotateMouseCoord = (
  coord: Coordinate,
  rect: Rectangle | Area,
  angle: number
) => {
  const x = "left" in rect ? rect.left : rect.x;
  const y = "top" in rect ? rect.top : rect.y;

  // Calculate the center of the rectangle
  const centerX = x + rect.width / 2;
  const centerY = y + rect.height / 2;

  // Transform the coordinates of the point to cancel the rotation
  const angleRad = (angle * Math.PI) / 180;
  const cos = Math.cos(-angleRad);
  const sin = Math.sin(-angleRad);

  // Translate the point relative to the rotation center
  const dx = coord.x - centerX;
  const dy = coord.y - centerY;

  // Apply the inverse rotation
  const rotatedX = dx * cos - dy * sin + centerX;
  const rotatedY = dx * sin + dy * cos + centerY;

  // Create a point with the transformed coordinates
  return {
    x: rotatedX,
    y: rotatedY,
  } as Coordinate;
};

/**
 * is the mouse inside the square
 */
export const isInsideSquare = (
  coord: Coordinate | null,
  size: Area | null,
  angle: number = 0
) => {
  if (!coord || !size) return false;
  if (angle === 0) {
    // Si pas de rotation, calcul simple
    return (
      coord.x >= size.x &&
      coord.x <= size.x + size.width &&
      coord.y >= size.y &&
      coord.y <= size.y + size.height
    );
  }

  const rotatedCoord = rotateMouseCoord(coord, size, angle);

  // Vérifier si le point transformé est dans le rectangle non-rotaté
  return (
    rotatedCoord.x >= size.x &&
    rotatedCoord.x <= size.x + size.width &&
    rotatedCoord.y >= size.y &&
    rotatedCoord.y <= size.y + size.height
  );
};

export const mouseIsOnBorderSquare = (
  coord: Coordinate,
  rect: Rectangle,
  angle: number
): string | null => {
  // If no rotation, use the existing function
  if (angle === 0) {
    return mouseIsOnBorderRect(coord, rect);
  }

  const rotatedCoord = rotateMouseCoord(coord, rect, angle);

  // Use mouseIsOnBorderRect with the transformed coordinates
  return mouseIsOnBorderRect(rotatedCoord, rect);
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
  withTurningButtons = true,
  maxWidth = 0,
  maxHeight = 0,
  rotation = 0,
}: ArgsMouseOnShape) => {
  const rect = {
    left: area.x,
    top: area.y,
    right: area.x + area.width,
    bottom: area.y + area.height,
    width: area.width,
    height: area.height,
  } as Rectangle;

  if (withCornerButton) {
    const badgePos = topRightPosition(rect, maxWidth, maxHeight, rotation);

    if (coordinateIsInsideRect(coordinate, badgePos)) {
      return BORDER.ON_BUTTON;
    }
    const btnDel = topRightPositionOver(rect, maxWidth, maxHeight, rotation);
    if (coordinateIsInsideRect(coordinate, btnDel)) {
      return BORDER.ON_BUTTON_DELETE;
    }
  }
  if (withTurningButtons) {
    const middleButton = middleButtonPosition(rect);
    if (coordinateIsInsideRect(coordinate, middleButton)) {
      if (coordinate.x < middleButton.middle) return BORDER.ON_BUTTON_LEFT;
      if (coordinate.x > middleButton.middle) return BORDER.ON_BUTTON_RIGHT;
      return BORDER.INSIDE;
    }
  }

  if (!isInsideSquare(coordinate, area, rotation)) return null;

  if (!withResize) {
    // for text mode, no need to resize
    return BORDER.INSIDE;
  }

  return mouseIsOnBorderSquare(coordinate, rect, rotation);
};

export const resizeSquare = (
  coordinate: Coordinate,
  area: Area,
  border: string,
  rotation: number = 0
) => {
  // if rotation calculate mouse position
  if (rotation !== 0) {
    const rotatedCoord = rotateMouseCoord(coordinate, area, rotation);
    coordinate = rotatedCoord;
  }
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
