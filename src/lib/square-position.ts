import { Rectangle, Coordinate, Area, Size } from "./canvas/types";
import {
  BORDER,
  mouseIsOnBorderRect,
  getRectOffset,
  resizeRect,
} from "./mouse-position";

export const rotateMouseCoord = (
  coord: Coordinate,
  center: Coordinate,
  angle: number
) => {
  // Calculate the center of the rectangle
  const centerX = center.x;
  const centerY = center.y;

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
  center: Coordinate,
  size: Size,
  angle: number = 0
) => {
  if (!coord || !size) return false;
  if (angle !== 0 && angle !== 180) {
    coord = rotateMouseCoord(coord, center, angle);
  }
  return (
    Math.abs(coord.x - center.x) <= size.width / 2 &&
    Math.abs(coord.y - center.y) <= size.height / 2
  );
};

export const mouseIsOnBorderSquare = (
  coord: Coordinate,
  center: Coordinate,
  size: Size,
  angle: number
): string | null => {
  // If no rotation, use the existing function
  const rect = {
    left: center.x - size.width / 2,
    top: center.y - size.height / 2,
    width: size.width,
    height: size.height,
  } as Rectangle;
  if (angle === 0) {
    return mouseIsOnBorderRect(coord, rect);
  }

  const rotatedCoord = rotateMouseCoord(coord, center, angle);

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
  center,
  size,
  withResize = true,
  rotation = 0,
}: {
  coordinate: Coordinate;
  center: Coordinate;
  size: Size;
  withResize?: boolean;
  rotation?: number;
}) => {
  if (!isInsideSquare(coordinate, center, size, rotation)) return null;

  if (!withResize) {
    // for text mode, no need to resize
    return BORDER.INSIDE;
  }

  return mouseIsOnBorderSquare(coordinate, center, size, rotation);
};

export const resizeSquare = (
  coordinate: Coordinate,
  area: Area,
  border: string,
  rotation: number = 0
) => {
  // if rotation calculate mouse position
  if (rotation !== 0) {
    const center = {
      x: area.x + area.width / 2,
      y: area.y + area.height / 2,
    };
    const rotatedCoord = rotateMouseCoord(coordinate, center, rotation);
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
