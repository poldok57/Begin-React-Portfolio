import { WindowType, WindowStyle } from "./types";

export const TITLE_HEIGHT = 40;
const DURATION_HORIZONTAL = 0.6;
const DURATION_VERTICAL = 0.5;
const DEFAULT_LEFT = "1px";
const DEFAULT_TOP = "0";
const FRAME_WIDTH = "calc(100% - 2px)";
const FRAME_HEIGHT = "calc(100% - 1px)";
const DEFAULT_OVERFLOW = "auto";

// Fonction pour déterminer si une valeur est en pourcentage ou utilise calc()
const isPercentageOrCalc = (value: string): boolean => {
  return value.includes("%") || value.includes("calc");
};

export const copyDivStyle = (
  currentDiv: HTMLElement | null | undefined,
  id: string
): WindowType | undefined => {
  if (!currentDiv) return undefined;

  const style = getComputedStyle(currentDiv);
  const cssStyle = currentDiv.style;

  // Utiliser le style CSS si c'est un pourcentage ou calc, sinon utiliser le style calculé
  const width = isPercentageOrCalc(cssStyle.width)
    ? cssStyle.width
    : style.width;
  const height = isPercentageOrCalc(cssStyle.height)
    ? cssStyle.height
    : style.height;

  const win: WindowType = {
    id: id,
    isMinimized: true,
    isMaximized: false,
    style: {
      top: style.top,
      left: style.left,
      right: style.right,
      width: width,
      height: height,
      bottom: style.bottom,
      overflow: style.overflow,
      position: style.position,
      borderRadius: style.borderRadius,
      opacity: style.opacity,
      transition: "",
    },
  };
  return win;
};

export const toggleWindowSize = (
  currentDiv: HTMLDivElement | null | undefined,
  win: WindowType | undefined
) => {
  const style: WindowStyle = {} as WindowStyle;
  const minimize = win ? win.isMinimized : false;
  const maximize = win ? win.isMaximized : true;

  if (minimize) {
    // Minimized state
    style.left = "1px";
    style.top = `${window.innerHeight - TITLE_HEIGHT}px`;
    style.width = "20%";
    style.height = `${TITLE_HEIGHT}px`;
    style.position = "fixed";
    style.overflow = "hidden";
    style.bottom = "0";
  } else if (maximize || !win) {
    style.left = DEFAULT_LEFT;
    style.top = DEFAULT_TOP;
    style.width = FRAME_WIDTH;
    style.height = FRAME_HEIGHT;
    style.bottom = "auto";
    style.overflow = DEFAULT_OVERFLOW;
  } else {
    style.left = win.style.left;
    style.top = win.style.top;
    style.width = win.style.width;
    style.height = win.style.height;
    style.bottom = win.style.bottom;
    style.overflow = win.style.overflow;
    style.position = win.style.position;
    style.borderRadius = win.style.borderRadius;
    style.opacity = win.style.opacity;
  }

  if (currentDiv) {
    // Apply transitions
    setTimeout(() => {
      currentDiv.style.top = style.top;
      currentDiv.style.left = style.left;
      currentDiv.style.width = style.width;
      currentDiv.style.height = style.height;
      currentDiv.style.bottom = style.bottom;
      currentDiv.style.overflow = style.overflow;

      currentDiv.style.position = "fixed";
      currentDiv.style.cursor = minimize ? "pointer" : "default";
      currentDiv.style.transition = `top ${DURATION_VERTICAL}s, ${DURATION_VERTICAL}s, width ${DURATION_HORIZONTAL}s, height ${DURATION_HORIZONTAL}s`;

      // console.log(" toogle Up, style", style);
    }, 50); // Delay transitions to allow for reset
  }
};
