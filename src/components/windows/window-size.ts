import { WindowType, WindowStyle } from "./types";
import { isAlignedRight } from "../../lib/utils/position";

export const TITLE_HEIGHT = 40;
const DURATION_POSITION = 0.3;
const DURATION_SIZE = 0.4;
const DURATION_OPACITY = 0.6;

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

  const isRightAligned = isAlignedRight(style, cssStyle);
  console.log(`L'élément (${id}) est aligné à droite:`, isRightAligned);

  console.log("copyDivStyle: style right:", style.right, "left:", style.left);
  console.log(
    "copyDivStyle: cssStyle right:",
    cssStyle.right,
    "left:",
    cssStyle.left
  );
  const win: WindowType = {
    id: id,
    title: "-",
    bgColor: null,
    color: null,
    htmlDiv: currentDiv as HTMLDivElement,
    isMinimized: false,
    isMaximized: false,
    isLocked: false,
    toggleUp: () => {},
    onClose: () => {},
    style: {
      top: style.top,
      left: isRightAligned ? "auto" : style.left,
      right:
        isRightAligned || style.right !== "auto" ? style.right : cssStyle.right,
      width: width,
      height: height,
      bottom: style.bottom,
      overflow: style.overflow,
      position: style.position ?? "relative",
      borderRadius: style.borderRadius,
      opacity: style.opacity ?? "1",
      zIndex: style.zIndex,
      transition: "all 1s",
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
    style.left = `${window.innerWidth * 0.4}px`;
    style.top = "auto";
    style.bottom = `-${TITLE_HEIGHT + 5}px`;
    style.width = "20%";
    style.height = `${TITLE_HEIGHT}px`;
    style.position = "fixed";
    style.overflow = "hidden";
    style.opacity = "0.05";
  } else if (maximize || !win) {
    style.left = DEFAULT_LEFT;
    style.top = DEFAULT_TOP;
    style.width = FRAME_WIDTH;
    style.height = FRAME_HEIGHT;
    style.position = "fixed";
    style.bottom = "auto";
    style.overflow = DEFAULT_OVERFLOW;
    style.opacity = "1";
  } else {
    // Copie globale des propriétés de win.style
    Object.assign(style, win.style);
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
      currentDiv.style.position = style.position;
      currentDiv.style.opacity = style.opacity;

      currentDiv.style.cursor = minimize ? "pointer" : "default";
      currentDiv.style.transition = `top ${DURATION_POSITION}s, left ${DURATION_POSITION}s, width ${DURATION_SIZE}s, height ${DURATION_SIZE}s, opacity ${DURATION_OPACITY}s`;
    }, 50); // Delay transitions to allow for reset
  }
};
