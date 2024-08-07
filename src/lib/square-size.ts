import { Size } from "./canvas/types";

export const resizeElement = (element: HTMLElement, size: Size) => {
  if (size?.width) {
    element.style.width = `${size.width}px`;
  }
  if (size?.height) {
    element.style.height = `${size.height}px`;
  }
};
