import { Area, Coordinate, Size } from "@/lib/canvas/types";

export const scaledSize = (area: Area | Size, scale: number) => {
  if (scale === 1) {
    return { ...area };
  }

  if ("x" in area) {
    return {
      ...area,
      x: Number((area.x * scale).toFixed(2)),
      y: Number((area.y * scale).toFixed(2)),
      width: Number((area.width * scale).toFixed(2)),
      height: Number((area.height * scale).toFixed(2)),
    };
  }
  return {
    width: Number((area.width * scale).toFixed(2)),
    height: Number((area.height * scale).toFixed(2)),
  };
};

export const scaledCoordinate = (coord: Coordinate, scale: number) => {
  if (scale === 1 || !coord) {
    return coord;
  }
  return {
    x: Number((coord.x * scale).toFixed(2)),
    y: Number((coord.y * scale).toFixed(2)),
  };
};

export const unScaledCoordinate = (coord: Coordinate, scale: number) => {
  if (scale === 1) {
    return coord;
  }
  return {
    x: Number((coord.x / scale).toFixed(2)),
    y: Number((coord.y / scale).toFixed(2)),
  };
};
