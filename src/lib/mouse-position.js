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
  ON_BUTTON: "on-button",
  ON_MIDDLE_BUTTON: "on-button-middle",
  ON_BUTTON_LEFT: "on-button-left",
  ON_BUTTON_RIGHT: "on-button-right",
  INSIDE: "inside",
};

const BADGE_RADIUS = 10;
const MIDDLE_BTN_RADIUS = 12;
let margin = 5;

export const setMargin = (newMargin) => {
  margin = newMargin;
};

export const isBorder = (border) => {
  // if border starts with "brd-" or "crn-" return true
  return border && (border.startsWith("brd-") || border.startsWith("crn-"));
};
export const isCorner = (border) => {
  // if border starts with "crn-" return true
  return border && border.startsWith("crn-");
};
export const isInside = (border) => {
  // if border is "inside" return true
  return border === BORDER.INSIDE;
};
export const isOnButton = (border) => {
  // if border starts with "on-" return true
  return border && border.startsWith("on-");
};

export const getRectOffset = (coord, rect) => {
  const x = rect.left - coord.x;
  const y = rect.top - coord.y;
  return { x, y };
};
export const getRectPosition = (coord, offset) => {
  return { left: coord.x + offset.x, top: coord.y + offset.y };
};

export const mouseIsInsideRect = (coord, rect) => {
  if (
    coord.x >= rect.left &&
    coord.x <= rect.right &&
    coord.y >= rect.top &&
    coord.y <= rect.bottom
  ) {
    return true;
  }

  return false;
};
/**
 * Return type of cursor depending on the border where the mouse is
 * @param {string} mouseOnBorder - border where the mouse is
 */
export const mousePointer = (mouseOnBorder) => {
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
    case BORDER.ON_BUTTON:
    case BORDER.ON_MIDDLE_BUTTON:
    case BORDER.ON_BUTTON_LEFT:
    case BORDER.ON_BUTTON_RIGHT:
      return "pointer";
    default:
      return "default";
  }
};

/**
 * Return the position of the badge at top right of the rectangle
 * @param {object} rect - rectangle coordinates
 */
export const badgePosition = (rect) => {
  const x = rect.x ?? rect.left;
  const y = rect.y ?? rect.top;
  const w = rect.width ?? rect.right - rect.left;
  // const h = rect.height ?? rect.bottom - rect.top;
  const badge = {
    width: BADGE_RADIUS * 2,
    height: BADGE_RADIUS * 2,
    left: Math.max(x + w - BADGE_RADIUS * 2, x + 55),
    top: y,
    bottom: y + BADGE_RADIUS * 2,

    radius: BADGE_RADIUS,
  };
  badge.right = badge.left + badge.width;
  badge.centerX = badge.left + badge.width / 2;
  badge.centerY = badge.top + badge.height / 2;
  return badge;
};
/**
 * Return the position of the middle button at the center of the rectangle
 * @param {object} rect - rectangle coordinates
 */
export const middleButtonPosition = (rect) => {
  const x = rect.x ?? rect.left;
  const y = rect.y ?? rect.top;
  const w = rect.width ?? rect.right - rect.left;
  const h = rect.height ?? rect.bottom - rect.top;
  const middleButton = {
    left: x + w / 2 - MIDDLE_BTN_RADIUS * 2,
    right: x + w / 2 + MIDDLE_BTN_RADIUS * 2,
    middle: x + w / 2,
    top: y + Math.max(h / 2 - MIDDLE_BTN_RADIUS, 30),
    axeX1: x + w / 2 - 1 - MIDDLE_BTN_RADIUS,
    axeX2: x + w / 2 + 1 + MIDDLE_BTN_RADIUS,
    radius: MIDDLE_BTN_RADIUS,
  };
  middleButton.axeY = middleButton.top + MIDDLE_BTN_RADIUS;
  middleButton.bottom = middleButton.top + MIDDLE_BTN_RADIUS * 2;

  return middleButton;
};
/**
 * Return the border where the mouse is
 * @param {object} coord - mouse coordinates
 * @param {object} rect - rectangle coordinates
 * @param {boolean} withButton - if the button is on the rectangle
 * @returns {string} - border where the mouse is
 */
export const mouseIsOnBorderRect = (coord, rect, withButton = false) => {
  if (withButton) {
    const middleButton = middleButtonPosition(rect);

    if (
      coord.x >= middleButton.left &&
      coord.x <= middleButton.right &&
      coord.y >= middleButton.top &&
      coord.y <= middleButton.bottom
    ) {
      if (coord.x < middleButton.middle) return BORDER.ON_BUTTON_LEFT;
      if (coord.x > middleButton.middle) return BORDER.ON_BUTTON_RIGHT;
    }
  } else if (
    coord.x >= rect.right - margin &&
    coord.x <= rect.right &&
    coord.y >= rect.top &&
    coord.y <= rect.top + margin
  ) {
    return BORDER.CORNER.TOP_RIGHT;
  }
  if (
    coord.x >= rect.left &&
    coord.x <= rect.left + margin &&
    coord.y >= rect.top &&
    coord.y <= rect.top + margin
  ) {
    return BORDER.CORNER.TOP_LEFT;
  }
  if (
    coord.x >= rect.left &&
    coord.x <= rect.left + margin &&
    coord.y >= rect.bottom - margin &&
    coord.y <= rect.bottom
  ) {
    return BORDER.CORNER.BOTTOM_LEFT;
  }
  if (
    coord.x >= rect.right - margin &&
    coord.x <= rect.right &&
    coord.y >= rect.bottom - margin &&
    coord.y <= rect.bottom
  ) {
    return BORDER.CORNER.BOTTOM_RIGHT;
  }

  if (coord.x >= rect.left && coord.x <= rect.left + margin) {
    return BORDER.LEFT;
  }
  if (coord.x >= rect.right - margin && coord.x <= rect.right) {
    return BORDER.RIGHT;
  }
  if (coord.y >= rect.top && coord.y <= rect.top + margin) {
    return BORDER.TOP;
  }
  if (coord.y >= rect.bottom - margin && coord.y <= rect.bottom) {
    return BORDER.BOTTOM;
  }

  if (
    coord.x >= rect.left &&
    coord.x <= rect.right &&
    coord.y >= rect.top &&
    coord.y <= rect.bottom
  ) {
    return BORDER.INSIDE;
  }

  return null;
};
export const resizeRect = (coord, rect, border) => {
  let newRect = { ...rect };
  const minimumSize = 25;
  switch (border) {
    case BORDER.CORNER.TOP_LEFT:
      newRect.width = Math.max(rect.width + rect.left - coord.x, minimumSize);
      newRect.height = Math.max(rect.height + rect.top - coord.y, minimumSize);
      newRect.left = coord.x;
      newRect.top = coord.y;
      break;
    case BORDER.CORNER.TOP_RIGHT:
      newRect.width = Math.max(coord.x - rect.left, minimumSize);
      newRect.height = Math.max(rect.height + rect.top - coord.y, minimumSize);
      newRect.top = coord.y;
      break;
    case BORDER.CORNER.BOTTOM_LEFT:
      newRect.width = Math.max(rect.width + rect.left - coord.x, minimumSize);
      newRect.height = Math.max(coord.y - rect.top, minimumSize);
      newRect.left = coord.x;
      break;
    case BORDER.CORNER.BOTTOM_RIGHT:
      newRect.width = Math.max(coord.x - rect.left, minimumSize);
      newRect.height = Math.max(coord.y - rect.top, minimumSize);
      break;
    case BORDER.LEFT:
      newRect.width = Math.max(rect.width + rect.left - coord.x, minimumSize);
      newRect.left = coord.x;
      break;
    case BORDER.RIGHT:
      newRect.width = Math.max(coord.x - rect.left, minimumSize);
      break;
    case BORDER.TOP:
      newRect.height = Math.max(rect.height + rect.top - coord.y, minimumSize);
      newRect.top = coord.y;
      break;
    case BORDER.BOTTOM:
      newRect.height = Math.max(coord.y - rect.top, minimumSize);
      break;
    default:
      break;
  }
  return newRect;
};

export const resizeElement = ({ style, mouse, component, border }) => {
  const rect = component.getBoundingClientRect();
  let newRect = { ...style };
  newRect.left = rect.left;
  newRect.top = rect.top;
  newRect.width = rect.width;
  newRect.height = rect.height;

  switch (border) {
    case BORDER.CORNER.TOP_LEFT:
      newRect.width = component.offsetWidth + component.offsetLeft - mouse.x;
      newRect.height = component.offsetHeight + component.offsetTop - mouse.y;
      newRect.left = mouse.x;
      newRect.top = mouse.y;
      break;
    case BORDER.CORNER.TOP_RIGHT:
      newRect.width = mouse.x - component.offsetLeft;
      newRect.height = component.offsetHeight + component.offsetTop - mouse.y;
      newRect.top = mouse.y;
      break;

    case BORDER.CORNER.BOTTOM_LEFT:
      newRect.width = component.offsetWidth + component.offsetLeft - mouse.x;
      newRect.height = mouse.y - component.offsetTop;
      newRect.left = mouse.x;
      break;
    case BORDER.CORNER.BOTTOM_RIGHT:
      newRect.width = mouse.x - component.offsetLeft;
      newRect.height = mouse.y - component.offsetTop;
      break;
    case BORDER.LEFT:
      newRect.width = component.offsetWidth + component.offsetLeft - mouse.x;
      newRect.left = mouse.x;
      break;
    case BORDER.RIGHT:
      newRect.width = mouse.x - component.offsetLeft;
      break;
    case BORDER.TOP:
      newRect.height = component.offsetHeight + component.offsetTop - mouse.y;
      newRect.top = mouse.y;
      break;
    case BORDER.BOTTOM:
      newRect.height = mouse.y - component.offsetTop;
      break;
    default:
      break;
  }
  return newRect;
};
