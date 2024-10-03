import { Rectangle, RectPosition as Position } from "@/lib/canvas/types";
import { getGroundOffset } from "../RoomCreat";

export const DEFAULT_TABLE_SIZE = 100;

export const positionTable = (
  offset: Position,
  x: number,
  y: number
): Position => {
  return {
    left: offset.left + DEFAULT_TABLE_SIZE * (0.5 + 1.5 * x),
    top: offset.top + DEFAULT_TABLE_SIZE * (0.5 + y),
  };
};

export const calculateSelectedRect = ({
  parentElement,
  containerRect,
  selectedItems,
  scale,
}: {
  parentElement: HTMLElement | null;
  containerRect: Rectangle | null;
  selectedItems: {
    width: number;
    height: number;
  };
  scale: number;
}): Rectangle => {
  let offsetStart = {
    left: 50,
    top: 50,
  };

  if (parentElement) {
    const parentRect = parentElement.getBoundingClientRect();
    const offset = getGroundOffset();
    offsetStart = {
      left: (parentRect.right + offset.left) / scale + 50,
      top: (parentRect.top + offset.top) / scale + 20,
    };
  }

  let selectedRect = containerRect;

  const start = positionTable(offsetStart, 0, 0);
  const end = positionTable(
    offsetStart,
    selectedItems.width,
    selectedItems.height
  );
  const left = start.left - DEFAULT_TABLE_SIZE / 4;
  const top = start.top - DEFAULT_TABLE_SIZE / 4;
  const width = end.left - start.left + DEFAULT_TABLE_SIZE / 2;
  const height = end.top - start.top + DEFAULT_TABLE_SIZE / 2;

  if (selectedRect === null) {
    selectedRect = {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
    };
  } else {
    selectedRect.width = width;
    selectedRect.height = height;
    selectedRect.right = left + width;
    selectedRect.bottom = top + height;
  }
  return selectedRect;
};
