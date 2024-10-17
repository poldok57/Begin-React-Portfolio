/**
 * @module canvas-points
 * @description
 * this interface is used to draw points on a canvas
 */

import { drawDashedRectangle } from "@/lib/canvas/canvas-dashed-rect";
import { Coordinate, Area, LinePath, ArgsMouseOnShape } from "./types";
import { ParamsGeneral } from "./canvas-defines";
import { badgePosition, BORDER } from "../mouse-position";
import { drawCornerButton } from "./canvas-buttons";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";

import { OVERAGE } from "./canvas-dashed-rect";

export const MARGIN = 10;
const DEFAULT_OPACITY = 0.5;

export abstract class CanvasPoints {
  protected general: ParamsGeneral;
  protected area?: Area | null;
  protected angleFound: number;
  protected coordFound: number;
  protected lastMousePosition: Coordinate | null;
  protected lastButtonOpacity: number = DEFAULT_OPACITY;
  protected isFinished: boolean = false;

  items: LinePath[] | Coordinate[];

  constructor() {
    this.items = [];
    this.angleFound = -1;
    this.coordFound = -1;
    this.lastMousePosition = null;
    this.isFinished = false;

    this.general = {
      color: "#000",
      lineWidth: 1,
      opacity: 1,
    };
  }

  setParamsGeneral(params: ParamsGeneral) {
    this.general = { ...this.general, ...params };
  }

  startArea(firstPoint: Coordinate) {
    this.area = {
      x: firstPoint.x - 1,
      y: firstPoint.y - 1,
      width: 2,
      height: 2,
    };
  }

  addPointInArea(coord: Coordinate) {
    if (!this.area) {
      return;
    }
    const right = Math.max(this.area.x + this.area.width, coord.x);
    const bottom = Math.max(this.area.y + this.area.height, coord.y);
    this.area.x = Math.min(this.area.x, coord.x);
    this.area.y = Math.min(this.area.y, coord.y);

    this.area.width = right - this.area.x;
    this.area.height = bottom - this.area.y;
  }

  addItem(item: LinePath | Coordinate) {
    this.items.push(item as LinePath & Coordinate);
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
    if (this.items.length > 0) {
      this.items.pop();
      // Recalculate the rectangle after removing the last line
      this.area = this.getArea(null);
      this.angleFound = -1;
      this.coordFound = -1;
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

  setFinished(isFinished: boolean) {
    this.isFinished = isFinished;
  }

  abstract draw(
    ctx: CanvasRenderingContext2D | null,
    withDashedRectangle?: boolean
  ): void;

  getItemsLength() {
    return this.items.length;
  }

  protected getArea(insidePoint: Coordinate | null): Area | null {
    let left = insidePoint ? insidePoint.x : 99999;
    let top = insidePoint ? insidePoint.y : 99999;
    let right = 0;
    let bottom = 0;

    this.items.forEach((line) => {
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

    if (this.isFinished) {
      this.drawCornerButton(
        ctx,
        mouseOnRectangle === BORDER.ON_BUTTON ? 1 : DEFAULT_OPACITY
      );
    }
  }

  clearAreaOnCanvas(ctx: CanvasRenderingContext2D | null) {
    if (this.area) {
      const width = Math.max(this.general.lineWidth, OVERAGE + 1);
      ctx?.clearRect(
        this.area.x - width,
        this.area.y - width,
        this.area.width + width * 2,
        this.area.height + width * 2
      );
    }
  }

  isInArea(coord: Coordinate): boolean {
    if (!this.area || !coord) {
      return false;
    }
    return (
      coord.x >= this.area.x &&
      coord.x <= this.area.x + this.area.width &&
      coord.y >= this.area.y &&
      coord.y <= this.area.y + this.area.height
    );
  }

  findSameAnge(coord: Coordinate): boolean {
    const marginPlus = MARGIN * 2;
    // Verify found angle with marginPlus
    if (this.angleFound >= 0) {
      const element = (this.items[this.angleFound] as LinePath).end;
      if (element) {
        return (
          Math.abs(element.x - coord.x) < marginPlus &&
          Math.abs(element.y - coord.y) < marginPlus
        );
      }
    }

    if (this.coordFound >= 0) {
      const element = (this.items[this.coordFound] as LinePath).coordinates;

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
    for (let i = 0; i < this.items.length; i++) {
      const line = this.items[i];
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
    const item = this.items[0];
    if (typeof item === "object" && item !== null && "end" in item) {
      const lines = this.items as LinePath[];

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
      const points = this.items as Coordinate[];
      points.forEach((point) => {
        point.x += offset.x;
        point.y += offset.y;
      });
    }

    if (this.area) {
      this.area.x += offset.x;
      this.area.y += offset.y;
    }
    this.angleFound = -1;
    this.coordFound = -1;
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
      const firstItem = this.items[0];
      if (
        lastItem &&
        "end" in lastItem &&
        lastItem.end &&
        "end" in firstItem &&
        firstItem.end &&
        lastItem.end.x === firstItem.end.x &&
        lastItem.end.y === firstItem.end.y
      ) {
        lastItem.end = { ...newCoord };
        firstItem.end = { ...newCoord };
      }

      this.area = this.getArea(newCoord);
      return true;
    }

    if (this.angleFound > 0 && this.angleFound <= this.items.length) {
      const line = this.items[this.angleFound];
      if ("end" in line) {
        line.end = newCoord;
      } else {
        (line as Coordinate).x = newCoord.x;
        (line as Coordinate).y = newCoord.y;
      }
      this.area = this.getArea(newCoord);
      return true;
    }
    if (this.coordFound > 0 && this.coordFound <= this.items.length) {
      const line = this.items[this.coordFound];
      if ("coordinates" in line) {
        line.coordinates = newCoord;
      }
      this.area = this.getArea(newCoord);
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
        : "buttons" in event
        ? event.buttons === 1
        : "touches" in event && event.touches.length > 0
        ? true
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
    if (!this.area || !ctx || !mousePosition) {
      return null;
    }
    // console.log("area", this.area, "mousePosition", mousePosition);
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
