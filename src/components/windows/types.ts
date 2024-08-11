export enum EVENT {
  MOUSE_DOWN = "mousedown",
  MOUSE_UP = "mouseup",
  MOUSE_MOVE = "mousemove",
  MOUSE_OVER = "mouseover",
  MOUSE_LEAVE = "mouseleave",
  MOUSE_ENTER = "mouseenter",
  TOUCH_START = "touchstart",
  TOUCH_END = "touchend",
  TOUCH_MOVE = "touchmove",
  TOUCH_CANCEL = "touchcancel",
}
export enum POSITION {
  RELATIVE = "relative",
  ABSOLUTE = "absolute",
  STATIC = "static",
  FIXED = "fixed",
}

export type WindowRect = {
  top: string;
  left: string;
  width: string;
  height: string;
};

export type WindowStyle = WindowRect & {
  right: string;
  bottom: string;
  position: string;
  overflow: string;
  borderRadius: string;
  opacity: string;
  zIndex: string;
  transition: string;
};

export type WindowType = {
  id: string;
  title: string;
  bgColor: string | null;
  color: string | null;
  htmlDiv: HTMLDivElement | null;
  isMinimized: boolean;
  isMaximized: boolean;
  isLocked: boolean;
  toggleUp: () => void;
  onClose: (() => void) | undefined;
  style: WindowStyle;
};
