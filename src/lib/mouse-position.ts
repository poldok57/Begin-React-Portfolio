import {
  Area,
  Rectangle,
  Coordinate,
  RectPosition,
  RectangleArgs,
  ButtonArgs,
  MiddleButton,
} from "./canvas/types";
import { isTouchDevice } from "./utils/device";

export const BORDER = {
  RIGHT: "brd-right",
  LEFT: "brd-left",
  TOP: "brd-top",
  BOTTOM: "brd-bottom",
  CORNER: {
    TOP_LEFT: "crn-top-left",
    TOP_RIGHT: "crn-top-right",
    BOTTOM_LEFT: "crn-bottom-left",
    BOTTOM_RIGHT: "crn-bottom-right",
  },
  ON_BUTTON: "btn",
  ON_BUTTON_DELETE: "btn-del",
  ON_MIDDLE_BUTTON: "btn-mid",
  ON_BUTTON_LEFT: "btn-turn-Left", // avoid confusion with border left
  ON_BUTTON_RIGHT: "btn-turn-Right", // avoid confusion with border right
  INSIDE: "inside",
} as const;

const BADGE_RADIUS = 10;
const MIDDLE_BTN_RADIUS = 12;
const BADGE_RADIUS_TOUCH = 15;
const MIDDLE_BTN_RADIUS_TOUCH = 18;

export const MARGIN_ON_BORDER = 6;
let margin = MARGIN_ON_BORDER;

export const setMargin = (newMargin: number): void => {
  margin = newMargin;
};

export const isBorder = (border: string): boolean => {
  return border
    ? border.startsWith("brd-") || border.startsWith("crn-")
    : false;
};

export const isBorderRightOrBottom = (border: string): boolean => {
  return border
    ? border === BORDER.RIGHT ||
        border === BORDER.BOTTOM ||
        border === BORDER.CORNER.BOTTOM_RIGHT
    : false;
};

export const isBorderLeft = (border: string): boolean => {
  return border ? border.includes("left") : false;
};
export const isBorderTop = (border: string): boolean => {
  return border ? border.includes("top") : false;
};
export const isBorderBottom = (border: string): boolean => {
  return border ? border.includes("bottom") : false;
};
export const isBorderRight = (border: string): boolean => {
  return border ? border.includes("right") : false;
};

export const isCorner = (border: string): boolean => {
  return border ? border.startsWith("crn-") : false;
};

export const isOnButton = (border: string): boolean => {
  return border ? border.startsWith("btn") : false;
};
export const isOnButtonDelete = (border: string): boolean => {
  return border ? border.startsWith("btn-del") : false;
};

export const isOnTurnButton = (border: string): boolean => {
  return border ? border.startsWith("btn-turn") : false;
};

export const isInside = (border: string): boolean => {
  return border === BORDER.INSIDE || isOnButton(border);
};

export const getRectOffset = (
  coord: Coordinate,
  rect: DOMRect | Rectangle | RectPosition
): Coordinate => {
  const x = rect.left - coord.x;
  const y = rect.top - coord.y;
  return { x, y } as Coordinate;
};

export const getRectPosition = (
  coord: Coordinate | Area,
  offset: Coordinate
): { left: number; top: number } => {
  return { left: coord.x + offset.x, top: coord.y + offset.y };
};

export const coordinateIsInsideRect = (
  coord: Coordinate | Area,
  rect: DOMRect | Rectangle | null,
  extend = false
): boolean => {
  if (!rect) return false;
  const overhang = !extend ? 0 : isTouchDevice() ? margin : margin / 2;
  return (
    coord.x >= rect.left - overhang &&
    coord.x <= (rect?.right ?? rect.left + rect.width) + overhang &&
    coord.y >= rect.top - overhang &&
    coord.y <= (rect?.bottom ?? rect.top + rect.height) + overhang
  );
};

export const mouseIsInsideComponent = (
  event: MouseEvent | TouchEvent,
  component: HTMLElement | null
): boolean => {
  if (component) {
    const rect = component.getBoundingClientRect();
    let coordinates: Coordinate;
    if ("touches" in event) {
      const touch = event.touches[0];
      coordinates = { x: touch.clientX, y: touch.clientY };
    } else {
      coordinates = { x: event.clientX, y: event.clientY };
    }
    return coordinateIsInsideRect(coordinates, rect);
  }
  return false;
};

export const mouseIsInsideBorder = (
  coord: Coordinate | Area,
  rect: DOMRect | Rectangle
): boolean => {
  return (
    coord.x > rect.left + margin &&
    coord.x < (rect?.right ?? rect.left + rect.width) - margin &&
    coord.y > rect.top + margin &&
    coord.y < (rect?.bottom ?? rect.top + rect.height) - margin
  );
};

export const mouseIsInsideBorderComponent = (
  event: MouseEvent,
  component: HTMLElement | null
): boolean => {
  if (component) {
    const rect = component.getBoundingClientRect();
    const coordinates = { x: event.clientX, y: event.clientY };
    return mouseIsInsideBorder(coordinates, rect);
  }
  return false;
};

export const mouseDistanceFromBorder = (
  coord: Coordinate,
  rect: DOMRect | Rectangle
): number => {
  // Calculate the minimum distance from the coordinate to any edge of the rectangle
  const distanceLeft = rect.left - coord.x;
  const distanceRight = coord.x - (rect.right ?? rect.left + rect.width);
  const distanceTop = rect.top - coord.y;
  const distanceBottom = coord.y - (rect.bottom ?? rect.top + rect.height);

  // Return the minimum of these distances
  return Math.max(distanceLeft, distanceRight, distanceTop, distanceBottom);
};
export const mousePointer = (mouseOnBorder: string): string => {
  if (mouseOnBorder.startsWith("btn")) {
    return "pointer";
  }
  switch (mouseOnBorder) {
    case BORDER.RIGHT:
    case BORDER.LEFT:
      return "ew-resize";
    case BORDER.TOP:
    case BORDER.BOTTOM:
      return "ns-resize";
    case BORDER.CORNER.TOP_LEFT:
    case BORDER.CORNER.BOTTOM_RIGHT:
      return "nwse-resize";
    case BORDER.CORNER.TOP_RIGHT:
    case BORDER.CORNER.BOTTOM_LEFT:
      return "nesw-resize";
    case BORDER.INSIDE:
      return "move";
    default:
      return "default";
  }
};

export const topRightPosition = (
  rect: RectangleArgs,
  maxWidth: number = 0,
  maxHeight: number = 0,
  rotation: number = 0,
  lockAtTop: boolean = true
): ButtonArgs => {
  const badgeRadius = isTouchDevice() ? BADGE_RADIUS_TOUCH : BADGE_RADIUS;

  const x = rect.x ?? rect.left!;
  const y = Math.min(rect.y ?? rect.top!, maxHeight - 2 * badgeRadius);
  const w = rect.width ?? rect.right! - rect.left!;
  const h = rect.height ?? rect.bottom! - rect.top!;

  // base position of the badge
  const badge: ButtonArgs = {
    width: badgeRadius * 2,
    height: badgeRadius * 2,
    left: Math.max(x + w - badgeRadius * 2, x + badgeRadius * 2, 0),
    top: lockAtTop ? Math.max(y, 0) : y,
    radius: badgeRadius,
    centerX: 0,
    centerY: 0,
  };

  badge.bottom = badge.top + badge.height;
  badge.right = badge.left + badge.width;
  if (maxWidth && badge.right > maxWidth) {
    badge.left = maxWidth - badge.width;
    badge.right = maxWidth;
  }

  // Calculate the initial center of the badge
  badge.centerX = badge.left + badge.width / 2;
  badge.centerY = badge.top + badge.height / 2;

  if (rotation !== 0) {
    // Calculate the center of the rectangle
    const rectCenterX = x + w / 2;
    const rectCenterY = y + h / 2;

    // Calculate the distance and angle between the center of the rectangle and the badge
    const dx = badge.centerX - rectCenterX;
    const dy = badge.centerY - rectCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const initialAngle = Math.atan2(dy, dx);

    // Apply the rotation
    const newAngle = initialAngle + (rotation * Math.PI) / 180;

    // Calculate the new coordinates of the center of the badge
    badge.centerX = rectCenterX + distance * Math.cos(newAngle);
    badge.centerY = rectCenterY + distance * Math.sin(newAngle);

    // Update the other coordinates of the badge
    if (maxWidth) {
      badge.centerX = Math.min(badge.centerX, maxWidth - badge.width / 2);
    }
    if (lockAtTop) {
      badge.centerY = Math.max(badge.centerY, badge.height / 2);
    }
    badge.left = badge.centerX - badge.width / 2;
    badge.right = badge.left + badge.width;
    badge.top = badge.centerY - badge.height / 2;
    badge.bottom = badge.top + badge.height;
  }

  return badge;
};

export const topRightPositionOver = (
  rect: RectangleArgs,
  maxWidth: number = 0,
  maxHeight: number = 0,
  rotation: number = 0
): ButtonArgs => {
  const newRect = { ...rect };
  let overhang = BADGE_RADIUS * 2 + 10;
  if (isTouchDevice()) {
    overhang = BADGE_RADIUS_TOUCH * 2 + 12;
  }
  if (newRect.top !== undefined) {
    newRect.top -= overhang;
  }
  if (newRect.y !== undefined) {
    newRect.y -= overhang;
  }
  return topRightPosition(
    newRect,
    maxWidth,
    maxHeight - overhang,
    rotation,
    false
  );
};

export const middleButtonPosition = (rect: RectangleArgs) => {
  const x = rect.x ?? rect.left!;
  const y = rect.y ?? rect.top!;
  const w = rect.width ?? rect.right! - rect.left!;
  const h = rect.height ?? rect.bottom! - rect.top!;
  const btnRadius = isTouchDevice()
    ? MIDDLE_BTN_RADIUS_TOUCH
    : MIDDLE_BTN_RADIUS;
  const middleButton: MiddleButton = {
    left: x + w / 2 - btnRadius * 2,
    right: x + w / 2 + btnRadius * 2,
    middle: x + w / 2,
    top: y + Math.max(h / 2 - btnRadius, 30),
    axeX1: x + w / 2 - 1 - btnRadius,
    axeX2: x + w / 2 + 1 + btnRadius,
    radius: btnRadius,
    axeY: 0,
  } as MiddleButton;
  middleButton.axeY = middleButton.top + btnRadius;
  middleButton.bottom = middleButton.top + btnRadius * 2;

  return middleButton;
};

export const mouseIsOnBorderRect = (
  coord: { x: number; y: number },
  rect: DOMRect | Rectangle
): string | null => {
  if (
    coord.x >= (rect?.right ?? rect.left + rect.width) - margin &&
    coord.x <= (rect?.right ?? rect.left + rect.width) + margin &&
    coord.y >= rect.top - margin &&
    coord.y <= rect.top + margin
  ) {
    return BORDER.CORNER.TOP_RIGHT;
  }
  if (
    coord.x >= rect.left - margin &&
    coord.x <= rect.left + margin &&
    coord.y >= rect.top - margin &&
    coord.y <= rect.top + margin
  ) {
    return BORDER.CORNER.TOP_LEFT;
  }
  if (
    coord.x >= rect.left - margin &&
    coord.x <= rect.left + margin &&
    coord.y >= (rect?.bottom ?? rect.top + rect.height) - margin &&
    coord.y <= (rect?.bottom ?? rect.top + rect.height) + margin
  ) {
    return BORDER.CORNER.BOTTOM_LEFT;
  }
  if (
    coord.x >= (rect?.right ?? rect.left + rect.width) - margin &&
    coord.x <= (rect?.right ?? rect.left + rect.width) + margin &&
    coord.y >= (rect?.bottom ?? rect.top + rect.height) - margin &&
    coord.y <= (rect?.bottom ?? rect.top + rect.height) + margin
  ) {
    return BORDER.CORNER.BOTTOM_RIGHT;
  }
  if (coord.x >= rect.left - margin && coord.x <= rect.left + margin) {
    return BORDER.LEFT;
  }
  if (
    coord.x >= (rect?.right ?? rect.left + rect.width) - margin &&
    coord.x <= (rect?.right ?? rect.left + rect.width) + margin
  ) {
    return BORDER.RIGHT;
  }
  if (coord.y >= rect.top - margin && coord.y <= rect.top + margin) {
    return BORDER.TOP;
  }
  if (
    coord.y >= (rect?.bottom ?? rect.top + rect.height) - margin &&
    coord.y <= (rect?.bottom ?? rect.top + rect.height) + margin
  ) {
    return BORDER.BOTTOM;
  }
  if (
    coord.x >= rect.left &&
    coord.x <= (rect?.right ?? rect.left + rect.width) &&
    coord.y >= rect.top &&
    coord.y <= (rect?.bottom ?? rect.top + rect.height)
  ) {
    return BORDER.INSIDE;
  }
  return null;
};

export const resizeRect = (
  coord: Coordinate | Area,
  rect: DOMRect | Rectangle,
  border: string,
  withPosition: boolean = true
): Rectangle => {
  const newRect: Rectangle = { ...rect };
  const minimumSize = 25;
  switch (border) {
    case BORDER.CORNER.TOP_LEFT:
      newRect.width = Math.max(rect.width + rect.left - coord.x, minimumSize);
      newRect.height = Math.max(rect.height + rect.top - coord.y, minimumSize);
      if (withPosition) {
        newRect.left = coord.x;
        newRect.top = coord.y;
      }
      break;
    case BORDER.CORNER.TOP_RIGHT:
      newRect.width = Math.max(coord.x - rect.left, minimumSize);
      newRect.height = Math.max(rect.height + rect.top - coord.y, minimumSize);
      if (withPosition) {
        newRect.top = coord.y;
      }
      break;
    case BORDER.CORNER.BOTTOM_LEFT:
      newRect.width = Math.max(rect.width + rect.left - coord.x, minimumSize);
      newRect.height = Math.max(coord.y - rect.top, minimumSize);
      if (withPosition) {
        newRect.left = coord.x;
      }
      break;
    case BORDER.CORNER.BOTTOM_RIGHT:
      newRect.width = Math.max(coord.x - rect.left, minimumSize);
      newRect.height = Math.max(coord.y - rect.top, minimumSize);
      break;
    case BORDER.LEFT:
      newRect.width = Math.max(rect.width + rect.left - coord.x, minimumSize);
      if (withPosition) {
        newRect.left = coord.x;
      }
      break;
    case BORDER.TOP:
      newRect.height = Math.max(rect.height + rect.top - coord.y, minimumSize);
      if (withPosition) {
        newRect.top = coord.y;
      }
      break;
    case BORDER.RIGHT:
      newRect.width = Math.max(coord.x - rect.left, minimumSize);
      break;
    case BORDER.BOTTOM:
      newRect.height = Math.max(coord.y - rect.top, minimumSize);
      break;
    default:
      break;
  }
  return newRect;
};
