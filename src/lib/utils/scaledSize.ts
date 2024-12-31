import { Area, Coordinate } from "@/lib/canvas/types";

export const scaledSize = (area: Area, scale: number) => {
  if (scale === 1) {
    return area;
  }

  return {
    ...area,
    x: parseFloat((area.x * scale).toFixed(2)),
    y: parseFloat((area.y * scale).toFixed(2)),
    width: parseFloat((area.width * scale).toFixed(2)),
    height: parseFloat((area.height * scale).toFixed(2)),
  };
};

export const scaledCoordinate = (coord: Coordinate | null, scale: number) => {
  if (scale === 1 || !coord) {
    return coord;
  }
  return {
    x: parseFloat((coord.x * scale).toFixed(2)),
    y: parseFloat((coord.y * scale).toFixed(2)),
  };
};

export const unScaledCoordinate = (coord: Coordinate, scale: number) => {
  if (scale === 1) {
    return coord;
  }
  return {
    x: parseFloat((coord.x / scale).toFixed(2)),
    y: parseFloat((coord.y / scale).toFixed(2)),
  };
};
