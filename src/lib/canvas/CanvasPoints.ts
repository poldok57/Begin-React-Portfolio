/**
 * @module canvas-points
 * @description
 * this interface is used to draw points on a canvas
 */

import { drawDashedRectangle } from "@/lib/canvas/canvas-dashed-rect";
import { Coordinate, Area, LinePath, ArgsMouseOnShape } from "./types";
import { badgePosition, BORDER } from "../mouse-position";
import { drawCornerButton } from "./canvas-buttons";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";

const MARGIN = 10;
const DEFAULT_OPACITY = 0.5;

// const roundCoordinates = (
//   coord: Coordinate | null | undefined
// ): Coordinate | null => {
//   if (!coord) {
//     return null;
//   }
//   return {
//     x: Math.round(coord.x),
//     y: Math.round(coord.y),
//   };
// };

export abstract class CanvasPoints {
  start: Coordinate = { x: 0, y: 0 };
  area?: Area;
  items: LinePath[] | Coordinate[];
  angleFound: number;
  lastMousePosition: Coordinate | null;
  lastButtonOpacity: number = DEFAULT_OPACITY;

  constructor() {
    this.items = [];
    this.angleFound = -1;
    this.lastMousePosition = null;
  }

  addItem(item: LinePath | Coordinate) {
    this.items.push(item as LinePath & Coordinate);
  }

  cancelLastItem() {
    if (this.items.length > 0) {
      this.items.pop();
      // Recalculate the rectangle after removing the last line
      this.area = this.getArea();
      this.angleFound = -1;
      return true;
    }
    return false;
  }

  getLastItem() {
    if (this.items.length > 0) {
      return this.items[this.items.length - 1];
    }
    return null;
  }

  abstract draw(ctx: CanvasRenderingContext2D | null): void;

  protected getArea(): Area {
    if (!this.start) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    let left = this.start.x;
    let top = this.start.y;
    let right = this.start.x;
    let bottom = this.start.y;

    this.items.forEach((line) => {
      const coord: Coordinate | null =
        "end" in line ? (line.end as Coordinate) : (line as Coordinate);

      if (coord) {
        left = Math.min(left, coord.x);
        top = Math.min(top, coord.y);
        right = Math.max(right, coord.x);
        bottom = Math.max(bottom, coord.y);
        if ("coordinates" in line && line.coordinates) {
          left = Math.min(left, (line.coordinates.x + coord.x) / 2);
          top = Math.min(top, (line.coordinates.y + coord.y) / 2);
          right = Math.max(right, (line.coordinates.x + coord.x) / 2);
          bottom = Math.max(bottom, (line.coordinates.y + coord.y) / 2);
        }
      }
    });
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  drawCornerButton(ctx: CanvasRenderingContext2D | null, opacity: number) {
    if (!ctx || !this.area) {
      return;
    }
    const badge = badgePosition(this.area, ctx.canvas.width);
    if (badge) {
      drawCornerButton(
        ctx,
        badge.centerX,
        badge.centerY,
        opacity === 1 ? badge.radius * 1.6 : badge.radius,
        opacity
      );
      this.lastButtonOpacity = opacity;
    }
  }

  drawDashedRectangle(
    ctx: CanvasRenderingContext2D | null,
    mouseOnRectangle: string | null = null
  ) {
    if (!ctx || !this.area) {
      return;
    }
    drawDashedRectangle(ctx, this.area, 0.35);

    this.drawCornerButton(
      ctx,
      mouseOnRectangle === BORDER.ON_BUTTON ? 1 : DEFAULT_OPACITY
    );
  }

  isInArea(coord: Coordinate): boolean {
    if (!this.area) {
      return false;
    }
    return (
      coord.x >= this.area.x &&
      coord.x <= this.area.x + this.area.width &&
      coord.y >= this.area.y &&
      coord.y <= this.area.y + this.area.height
    );
  }

  findAngle(coord: Coordinate): boolean {
    if (!this.start) {
      return false;
    }
    // Vérifier le point de départ
    if (
      Math.abs(this.start.x - coord.x) < MARGIN &&
      Math.abs(this.start.y - coord.y) < MARGIN
    ) {
      this.angleFound = 0; // 1 pour le point de départ (0 + 1)
      return true;
    }

    // Vérifier les points de fin de chaque ligne
    for (let i = 0; i < this.items.length; i++) {
      const line = this.items[i];
      const coordItem: Coordinate | null =
        "end" in line ? (line.end as Coordinate) : (line as Coordinate);
      if (coordItem) {
        if (
          Math.abs(coord.x - coordItem.x) < MARGIN &&
          Math.abs(coord.y - coordItem.y) < MARGIN
        ) {
          this.angleFound = i + 1; // i + 2 car i commence à 0 et on ajoute 1
          return true;
        }
      }
    }

    // Aucun angle trouvé
    this.angleFound = -1;
    return false;
  }

  move(offset: Coordinate) {
    if (!this.start) {
      return;
    }
    this.start.x += offset.x;
    this.start.y += offset.y;
    this.items.forEach((line) => {
      const coord: Coordinate | null =
        "end" in line ? (line.end as Coordinate) : (line as Coordinate);
      if (coord) {
        coord.x += offset.x;
        coord.y += offset.y;
      }
      if ("coordinates" in line && line.coordinates) {
        line.coordinates.x += offset.x;
        line.coordinates.y += offset.y;
      }
    });
    if (this.area) {
      this.area.x += offset.x;
      this.area.y += offset.y;
    }
    this.angleFound = -1;
  }

  mouseDown(ctx: CanvasRenderingContext2D | null, mousePosition: Coordinate) {
    this.lastMousePosition = mousePosition;
    if (this.area) {
      const mouseOnRectangle = this.handleMouseOnRectange(ctx, mousePosition);
      if (mouseOnRectangle === BORDER.ON_BUTTON) {
        return true;
      }
    }
    return false;
  }

  throttleMovePath = throttle(
    (ctx: CanvasRenderingContext2D | null, newMousePosition: Coordinate) => {
      if (this.lastMousePosition) {
        const coord = { ...newMousePosition } as Coordinate;
        coord.x = Math.round(coord.x - this.lastMousePosition.x);
        coord.y = Math.round(coord.y - this.lastMousePosition.y);
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.move(coord);
        this.draw(ctx);
        this.lastMousePosition = newMousePosition;
      }
    },
    25
  );

  moveAngle(newCoord: Coordinate) {
    if (this.angleFound === 0) {
      this.start = newCoord;
      this.area = this.getArea();
      return true;
    }
    if (this.angleFound > 0 && this.angleFound <= this.items.length) {
      const line = this.items[this.angleFound - 1];
      if ("end" in line) {
        line.end = newCoord;
      } else {
        (line as Coordinate).x = newCoord.x;
        (line as Coordinate).y = newCoord.y;
      }
      this.area = this.getArea();
      return true;
    }
    return false;
  }

  mouseOverPath(
    ctx: CanvasRenderingContext2D | null,
    mousePosition: Coordinate,
    btnPressed: boolean
  ) {
    let cursorType = "default";
    let inArea = false;
    if (this.isInArea(mousePosition)) {
      // action after the path is closed
      cursorType = "move";
      inArea = true;
    }
    if ((btnPressed || inArea) && this.findAngle(mousePosition)) {
      cursorType = "pointer";
      if (btnPressed) {
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.moveAngle(mousePosition);
        this.draw(ctx);
      }
    } else if (btnPressed && inArea && this.lastMousePosition) {
      this.throttleMovePath(ctx, mousePosition);
    } else {
      const mouseOnRectangle = this.handleMouseOnRectange(ctx, mousePosition);
      if (mouseOnRectangle === BORDER.ON_BUTTON) {
        this.drawCornerButton(ctx, 1);
        cursorType = "pointer";
      } else if (this.lastButtonOpacity !== DEFAULT_OPACITY) {
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.draw(ctx);
      }
    }
    return cursorType;
  }

  handleMouseOnRectange(
    ctx: CanvasRenderingContext2D | null,
    mousePosition: Coordinate
  ): string | null {
    if (!this.area || !ctx) {
      return null;
    }
    const argsMouseOnArea: ArgsMouseOnShape = {
      coordinate: mousePosition,
      area: this.area,
      withResize: false,
      withCornerButton: true,
      withTurningButtons: false,
      maxWidth: ctx.canvas.width,
    };

    return isOnSquareBorder(argsMouseOnArea);
  }
}
