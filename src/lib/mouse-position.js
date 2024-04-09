export const BORDER = {
  RIGHT: "right",
  LEFT: "left",
  TOP: "top",
  BOTTOM: "bottom",
  CORNER: {
    TOP_LEFT: "top-left",
    TOP_RIGHT: "top-right",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_RIGHT: "bottom-right",
  },
  ON_BUTTON: "on-button",
  INSIDE: "inside",
};

let margin = 5;

export const setMargin = (newMargin) => {
  margin = newMargin;
};

let decalage = { x: 0, y: 0 };

export const setDecalage = (coord, rect) => {
  decalage.x = coord.x - rect.left;
  decalage.y = coord.y - rect.top;
};
export const getRectDecalage = (coord) => {
  return { left: coord.x - decalage.x, top: coord.y - decalage.y };
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
      return "pointer";
    default:
      return "default";
  }
};

export const mouseIsOnBorderRect = (coord, rect, withButton = false) => {
  if (withButton) {
    // button is on top right corner of the rectangle (double margin)
    if (
      coord.x >= rect.right - margin * 4 &&
      coord.x <= rect.right &&
      coord.y >= rect.top &&
      coord.y <= rect.top + margin * 4
    ) {
      return BORDER.ON_BUTTON;
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
  switch (border) {
    case BORDER.CORNER.TOP_LEFT:
      newRect.width = rect.width + rect.left - coord.x;
      newRect.height = rect.height + rect.top - coord.y;
      newRect.left = coord.x;
      newRect.top = coord.y;
      break;
    case BORDER.CORNER.TOP_RIGHT:
      newRect.width = coord.x - rect.left;
      newRect.height = rect.height + rect.top - coord.y;
      newRect.top = coord.y;
      break;
    case BORDER.CORNER.BOTTOM_LEFT:
      newRect.width = rect.width + rect.left - coord.x;
      newRect.height = coord.y - rect.top;
      newRect.left = coord.x;
      break;
    case BORDER.CORNER.BOTTOM_RIGHT:
      newRect.width = coord.x - rect.left;
      newRect.height = coord.y - rect.top;
      break;
    case BORDER.LEFT:
      newRect.width = rect.width + rect.left - coord.x;
      newRect.left = coord.x;
      break;
    case BORDER.RIGHT:
      newRect.width = coord.x - rect.left;
      break;
    case BORDER.TOP:
      newRect.height = rect.height + rect.top - coord.y;
      newRect.top = coord.y;
      break;
    case BORDER.BOTTOM:
      newRect.height = coord.y - rect.top;
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
