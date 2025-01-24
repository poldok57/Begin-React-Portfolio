import { Area, Coordinate } from "@/lib/canvas/types";

export const scaledSize = (area: Area, scale: number) => {
  if (scale === 1) {
    return { ...area };
  }

  return {
    ...area,
    x: Number((area.x * scale).toFixed(2)),
    y: Number((area.y * scale).toFixed(2)),
    width: Number((area.width * scale).toFixed(2)),
    height: Number((area.height * scale).toFixed(2)),
  };
};

export const scaledCoordinate = (coord: Coordinate | null, scale: number) => {
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
