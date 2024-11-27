import { Rectangle, Coordinate, Area, ArgsMouseOnShape } from "./canvas/types";
import {
  BORDER,
  topRightPosition,
  middleButtonPosition,
  coordinateIsInsideRect,
  mouseIsOnBorderRect,
  getRectOffset,
  resizeRect,
} from "./mouse-position";

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

  // Calculer le centre du rectangle
  const centerX = size.x + size.width / 2;
  const centerY = size.y + size.height / 2;

  // Transformer les coordonnées du point pour annuler la rotation
  const angleRad = (angle * Math.PI) / 180;
  const cos = Math.cos(-angleRad);
  const sin = Math.sin(-angleRad);

  // Translater le point par rapport au centre de rotation
  const dx = coord.x - centerX;
  const dy = coord.y - centerY;

  // Appliquer la rotation inverse
  const rotatedX = dx * cos - dy * sin + centerX;
  const rotatedY = dx * sin + dy * cos + centerY;

  // Vérifier si le point transformé est dans le rectangle non-rotaté
  return (
    rotatedX >= size.x &&
    rotatedX <= size.x + size.width &&
    rotatedY >= size.y &&
    rotatedY <= size.y + size.height
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

  // Calculate the center of the rectangle
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

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
  const transformedCoord: Coordinate = {
    x: rotatedX,
    y: rotatedY,
  };

  // Use mouseIsOnBorderRect with the transformed coordinates
  return mouseIsOnBorderRect(transformedCoord, rect);
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
    const badgePos = topRightPosition(rect, maxWidth, rotation);

    if (coordinateIsInsideRect(coordinate, badgePos)) {
      return BORDER.ON_BUTTON;
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
  // Si pas de rotation, utiliser la logique existante
  if (rotation === 0) {
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
  }

  // Calculer le centre du rectangle
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;

  // Transformer les coordonnées du point pour annuler la rotation
  const angleRad = (rotation * Math.PI) / 180;
  const cos = Math.cos(-angleRad);
  const sin = Math.sin(-angleRad);

  // Translater le point par rapport au centre de rotation
  const dx = coordinate.x - centerX;
  const dy = coordinate.y - centerY;

  // Appliquer la rotation inverse
  const rotatedX = dx * cos - dy * sin + centerX;
  const rotatedY = dx * sin + dy * cos + centerY;

  // Créer un point avec les coordonnées transformées
  const transformedCoord: Coordinate = {
    x: rotatedX,
    y: rotatedY,
  };

  console.log("transformedCoord", transformedCoord);

  // Utiliser la logique de redimensionnement existante avec les coordonnées transformées
  const rect: Rectangle = {
    left: area.x,
    top: area.y,
    width: area.width,
    height: area.height,
    right: area.x + area.width,
    bottom: area.y + area.height,
  };

  const newSquare = resizeRect(transformedCoord, rect, border);

  // Créer la nouvelle zone
  const newArea: Area = {
    x: newSquare.left,
    y: newSquare.top,
    width: newSquare.width,
    height: newSquare.height,
  };

  // Appliquer la rotation inverse aux nouvelles coordonnées
  const newCenterX = newArea.x + newArea.width / 2;
  const newCenterY = newArea.y + newArea.height / 2;
  const newDx = newArea.x - newCenterX;
  const newDy = newArea.y - newCenterY;

  // Rotation dans le sens original
  const finalX = newCenterX + (newDx * cos + newDy * sin);
  const finalY = newCenterY + (-newDx * sin + newDy * cos);

  newArea.x = finalX;
  newArea.y = finalY;

  return { newArea, newSquare: newArea };
};
