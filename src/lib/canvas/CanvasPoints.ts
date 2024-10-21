/**
 * @module canvas-points
 * @description
 * this interface is used to draw points on a canvas
 */

import { drawDashedRectangle } from "@/lib/canvas/canvas-dashed-rect";
import { Coordinate, Area, LinePath, ArgsMouseOnShape } from "./types";
import { ParamsGeneral, ThingsToDraw } from "./canvas-defines";
import { badgePosition, BORDER } from "../mouse-position";
import { drawCornerButton } from "./canvas-buttons";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";
import { CanvasDrawableObject } from "./CanvasDrawableObject";
import { OVERAGE } from "./canvas-dashed-rect";

export const MARGIN = 10;
const DEFAULT_OPACITY = 0.5;

interface CanvasPointsData extends ThingsToDraw {
  items: LinePath[] | Coordinate[];
}

export abstract class CanvasPoints extends CanvasDrawableObject {
  protected data: CanvasPointsData;

  protected angleFound: number;
  protected coordFound: number;
  protected lastMousePosition: Coordinate | null;
  protected lastButtonOpacity: number = DEFAULT_OPACITY;
  protected isFinished: boolean = false;
  protected maxWidthLine: number = 0;

  constructor() {
    super();
    this.angleFound = -1;
    this.coordFound = -1;
    this.lastMousePosition = null;
    this.isFinished = false;

    this.data = {
      type: "",
      rotation: 0,
      size: { x: 0, y: 0, width: 0, height: 0 },
      general: {
        color: "#000",
        lineWidth: 1,
        opacity: 1,
      },
      items: [],
    };
  }

  setParamsGeneral(params: ParamsGeneral) {
    this.data.general = { ...this.data.general, ...params };
    this.maxWidthLine = Math.max(this.maxWidthLine, params.lineWidth);
  }

  setMaxWidthLine(width: number) {
    this.maxWidthLine = Math.max(this.maxWidthLine, width);
  }

  startArea(firstPoint: Coordinate) {
    this.data.size = {
      x: firstPoint.x - 1,
      y: firstPoint.y - 1,
      width: 2,
      height: 2,
    };
  }

  addPointInArea(coord: Coordinate) {
    if (!this.data.size) {
      return;
    }

    const size = this.data.size;
    const right = Math.max(size.x + size.width, coord.x);
    const bottom = Math.max(size.y + size.height, coord.y);
    size.x = Math.min(size.x, coord.x);
    size.y = Math.min(size.y, coord.y);

    size.width = right - size.x;
    size.height = bottom - size.y;
  }

  addItem(item: LinePath | Coordinate) {
    const prevItem = this.data.items[this.data.items.length - 1];
    if (prevItem && "end" in prevItem && prevItem.end) {
      const prevEnd = prevItem.end as Coordinate;
      const currentEnd = (item as LinePath).end as Coordinate;
      if (prevEnd.x === currentEnd.x && prevEnd.y === currentEnd.y) {
        // console.log("ignore add item", prevEnd, currentEnd);
        return; // Ignore adding the current item if it's the same as the previous item
      }
    }
    // Verify if the current item is of type Coordinate
    if ("x" in item && "y" in item) {
      const currentPoint = item as Coordinate;
      if (prevItem && "x" in prevItem && "y" in prevItem) {
        const prevPoint = prevItem as Coordinate;
        if (prevPoint.x === currentPoint.x && prevPoint.y === currentPoint.y) {
          return; // Ignore adding the current item if it's the same as the previous item
        }
      }
    }

    this.data.items.push(item as LinePath & Coordinate);
    if ("end" in item && (item as LinePath).end) {
      const end = (item as LinePath).end as Coordinate;
      this.addPointInArea(end);
      if ("coordinates" in item && item.coordinates) {
        this.addPointInArea(item.coordinates);
      }
    } else {
      this.addPointInArea(item as Coordinate);
    }
    this.angleFound = -1;
  }

  cancelLastItem() {
    if (this.data.items.length > 0) {
      this.data.items.pop();
      // Recalculate the rectangle after removing the last line
      this.data.size = this.getArea(null);
      this.angleFound = -1;
      this.coordFound = -1;
      return true;
    }
    return false;
  }

  getLastItem() {
    if (this.data.items.length > 0) {
      return this.data.items[this.data.items.length - 1];
    }
    return null;
  }

  setFinished(isFinished: boolean) {
    this.isFinished = isFinished;
  }

  getItemsLength() {
    return this.data.items.length;
  }

  protected getArea(insidePoint: Coordinate | null): Area {
    let left = insidePoint ? insidePoint.x : Infinity;
    let top = insidePoint ? insidePoint.y : Infinity;
    let right = 0;
    let bottom = 0;

    this.data.items.forEach((line) => {
      const coord: Coordinate | null =
        "end" in line ? (line.end as Coordinate) : (line as Coordinate);

      if (coord) {
        left = Math.min(left, coord.x);
        top = Math.min(top, coord.y);
        right = Math.max(right, coord.x);
        bottom = Math.max(bottom, coord.y);
        if ("coordinates" in line && line.coordinates) {
          left = Math.min(left, line.coordinates.x - 2);
          top = Math.min(top, line.coordinates.y - 2);
          right = Math.max(right, line.coordinates.x + 2);
          bottom = Math.max(bottom, line.coordinates.y + 2);
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
    if (!ctx || !this.data.size) {
      return;
    }
    const badge = badgePosition(this.data.size, ctx.canvas.width);
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
    if (!ctx || !this.data.size) {
      return;
    }
    drawDashedRectangle(ctx, this.data.size, 0.35);

    if (this.isFinished) {
      this.drawCornerButton(
        ctx,
        mouseOnRectangle === BORDER.ON_BUTTON ? 1 : DEFAULT_OPACITY
      );
    }
  }

  clearAreaOnCanvas(ctx: CanvasRenderingContext2D | null) {
    if (this.data.size) {
      const width = Math.max(this.maxWidthLine, OVERAGE + 1);
      ctx?.clearRect(
        this.data.size.x - width,
        this.data.size.y - width,
        this.data.size.width + width * 2,
        this.data.size.height + width * 2
      );
    }
  }

  isInArea(coord: Coordinate): boolean {
    if (!this.data.size || !coord) {
      return false;
    }
    return (
      coord.x >= this.data.size.x &&
      coord.x <= this.data.size.x + this.data.size.width &&
      coord.y >= this.data.size.y &&
      coord.y <= this.data.size.y + this.data.size.height
    );
  }

  private lastCallTime: number = 0;

  findSameAnge(coord: Coordinate): boolean {
    const currentTime = Date.now();
    if (currentTime - this.lastCallTime > 100) {
      this.lastCallTime = currentTime;
      return false;
    }
    this.lastCallTime = currentTime;

    const marginPlus = MARGIN * 2;
    // Verify found angle with marginPlus
    if (this.angleFound >= 0) {
      const element = (this.data.items[this.angleFound] as LinePath).end;
      if (element) {
        return (
          Math.abs(element.x - coord.x) < marginPlus &&
          Math.abs(element.y - coord.y) < marginPlus
        );
      }
    }

    if (this.coordFound >= 0) {
      const element = (this.data.items[this.coordFound] as LinePath)
        .coordinates;

      if (element)
        return (
          Math.abs(element.x - coord.x) < marginPlus &&
          Math.abs(element.y - coord.y) < marginPlus
        );
    }
    return false;
  }

  findAngle(coord: Coordinate): boolean {
    // Vérifier le point de départ
    // Cash controle

    if (this.angleFound >= 0 && this.findSameAnge(coord)) {
      return true;
    }

    // Verify end of each line
    for (let i = 0; i < this.data.items.length; i++) {
      const line = this.data.items[i];
      if ("end" in line && line.end) {
        if (
          Math.abs(coord.x - line.end.x) < MARGIN &&
          Math.abs(coord.y - line.end.y) < MARGIN
        ) {
          this.angleFound = i;
          this.coordFound = -1;
          return true;
        }
      }
      if ("coordinates" in line && line.coordinates) {
        if (
          Math.abs(coord.x - line.coordinates.x) < MARGIN &&
          Math.abs(coord.y - line.coordinates.y) < MARGIN
        ) {
          this.coordFound = i;
          this.angleFound = -1;
          return true;
        }
      }
    }

    // no angle found
    this.angleFound = -1;
    this.coordFound = -1;
    return false;
  }

  eraseAngleCoordFound() {
    this.angleFound = -1;
    this.coordFound = -1;
  }

  move(offset: Coordinate) {
    const item = this.data.items[0];
    if (typeof item === "object" && item !== null && "end" in item) {
      const lines = this.data.items as LinePath[];

      lines.forEach((line) => {
        if (line.end) {
          line.end.x += offset.x;
          line.end.y += offset.y;
        }

        if ("coordinates" in line && line.coordinates) {
          line.coordinates.x += offset.x;
          line.coordinates.y += offset.y;
        }
      });
    } else {
      const points = this.data.items as Coordinate[];
      points.forEach((point) => {
        point.x += offset.x;
        point.y += offset.y;
      });
    }

    if (this.data.size) {
      this.data.size.x += offset.x;
      this.data.size.y += offset.y;
    }
    this.angleFound = -1;
    this.coordFound = -1;
  }

  mouseDown(ctx: CanvasRenderingContext2D | null, mousePosition: Coordinate) {
    this.lastMousePosition = mousePosition;
    if (this.data.size) {
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
        this.clearAreaOnCanvas(ctx);
        this.move(coord);
        this.draw(ctx, true);
        this.lastMousePosition = newMousePosition;
      }
    },
    30
  );

  moveAngle(newCoord: Coordinate) {
    if (this.angleFound === 0) {
      // first angle

      const lastItem = this.getLastItem();
      const firstItem = this.data.items[0];
      if (
        lastItem &&
        "end" in lastItem &&
        lastItem.end &&
        "end" in firstItem &&
        firstItem.end &&
        lastItem.end.x === firstItem.end.x &&
        lastItem.end.y === firstItem.end.y
      ) {
        // console.log("close line", lastItem.end, firstItem.end);
        lastItem.end = { ...newCoord };
        firstItem.end = { ...newCoord };
      }

      this.data.size = this.getArea(newCoord);
      return true;
    }

    if (this.angleFound > 0 && this.angleFound <= this.data.items.length) {
      const line = this.data.items[this.angleFound];
      if ("end" in line) {
        line.end = newCoord;
      } else {
        (line as Coordinate).x = newCoord.x;
        (line as Coordinate).y = newCoord.y;
      }
      this.data.size = this.getArea(newCoord);
      return true;
    }
    if (this.coordFound > 0 && this.coordFound <= this.data.items.length) {
      const line = this.data.items[this.coordFound];
      if ("coordinates" in line) {
        line.coordinates = newCoord;
      }
      this.data.size = this.getArea(newCoord);
      return true;
    }
    return false;
  }

  mouseOverPath(
    ctx: CanvasRenderingContext2D | null,
    event: MouseEvent | TouchEvent | null,
    mousePosition: Coordinate
  ) {
    let cursorType = "default";
    let inArea = false;
    if (this.isInArea(mousePosition)) {
      // action after the path is closed
      cursorType = "move";
      inArea = true;
    }
    const btnPressed =
      event === null
        ? false
        : event instanceof MouseEvent
        ? event.buttons === 1
        : event instanceof TouchEvent
        ? event.touches.length > 0
        : false;

    if ((btnPressed || inArea) && this.findAngle(mousePosition)) {
      cursorType = "pointer";
      if (btnPressed) {
        this.clearAreaOnCanvas(ctx);
        this.moveAngle(mousePosition);
        this.draw(ctx, true);
        if (event) {
          event.preventDefault();
        }
      }
    } else if (btnPressed && inArea && this.lastMousePosition) {
      if (event) {
        event.preventDefault();
      }
      this.throttleMovePath(ctx, mousePosition);
      cursorType = "grabbing";
    } else {
      const mouseOnRectangle = this.handleMouseOnRectange(ctx, mousePosition);
      if (mouseOnRectangle === BORDER.ON_BUTTON) {
        this.drawCornerButton(ctx, 1);
        cursorType = "pointer";
      } else if (this.lastButtonOpacity !== DEFAULT_OPACITY) {
        this.clearAreaOnCanvas(ctx);
        this.draw(ctx, true);
      }
    }
    return cursorType;
  }

  handleMouseOnRectange(
    ctx: CanvasRenderingContext2D | null,
    mousePosition: Coordinate
  ): string | null {
    if (!this.data.size || !ctx || !mousePosition) {
      return null;
    }
    // console.log("area", this.data.size, "mousePosition", mousePosition);
    const argsMouseOnArea: ArgsMouseOnShape = {
      coordinate: mousePosition,
      area: this.data.size,
      withResize: false,
      withCornerButton: true,
      withTurningButtons: false,
      maxWidth: ctx.canvas.width,
    };

    return isOnSquareBorder(argsMouseOnArea);
  }
}
