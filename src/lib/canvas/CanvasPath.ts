/**
 * @module canvas-path
 * @description
 * This module provides functions to draw and manipulate paths on a canvas.
 */

import { drawDashedRectangle } from "@/lib/canvas/canvas-dashed-rect";
import {
  Coordinate,
  Area,
  LinePath,
  LineType,
  ArgsMouseOnShape,
} from "./types";
import { badgePosition, BORDER } from "../mouse-position";
import { drawBadge } from "./canvas-buttons";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";

const MARGIN = 10;
const DEFAULT_OPACITY = 0.5;

const roundCoordinates = (
  coord: Coordinate | null | undefined
): Coordinate | null => {
  if (!coord) {
    return null;
  }
  return {
    x: Math.round(coord.x),
    y: Math.round(coord.y),
  };
};

export class CanvasPath {
  start: Coordinate;
  rectangle?: Area;
  closed: boolean;
  filled: boolean;
  fillStyle: string;
  globalAlpha: number;
  lines: LinePath[];
  angleFound: number;
  lastMousePosition: Coordinate | null;
  lastButtonOpacity: number = DEFAULT_OPACITY;

  constructor(line: LinePath) {
    if (!line.coordinates) {
      throw new Error("Line coordinates are required");
    }
    this.start = roundCoordinates(line.coordinates) as Coordinate;
    this.globalAlpha = line.globalAlpha || 1;

    this.closed = false;
    this.filled = false;
    this.fillStyle = "gray";
    this.globalAlpha = 1;
    this.lines = [];
    this.angleFound = -1;
    this.lastMousePosition = null;
  }

  private drawLine(ctx: CanvasRenderingContext2D, line: LinePath) {
    if (!line.end) {
      return;
    }
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
  }

  private drawCurve(ctx: CanvasRenderingContext2D, line: LinePath) {
    if (!line.coordinates || !line.end) {
      return;
    }
    ctx.quadraticCurveTo(
      line.coordinates.x,
      line.coordinates.y,
      line.end.x,
      line.end.y
    );
    ctx.stroke();
  }

  private getRectangle(): Area {
    let left = this.start.x;
    let top = this.start.y;
    let right = this.start.x;
    let bottom = this.start.y;

    this.lines.forEach((line) => {
      if (line.end) {
        left = Math.min(left, line.end.x);
        top = Math.min(top, line.end.y);
        right = Math.max(right, line.end.x);
        bottom = Math.max(bottom, line.end.y);
      }
      if (line.type === LineType.CURVE && line.coordinates) {
        left = Math.min(left, line.coordinates.x);
        top = Math.min(top, line.coordinates.y);
        right = Math.max(right, line.coordinates.x);
        bottom = Math.max(bottom, line.coordinates.y);
      }
    });
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }

  private getLastParams() {
    let strokeStyle: string = "black";
    let globalAlpha: number = this.globalAlpha;

    this.lines.forEach((line) => {
      if (line.strokeStyle) {
        strokeStyle = line.strokeStyle;
      }
      if (line.globalAlpha !== null && line.globalAlpha !== undefined) {
        globalAlpha = line.globalAlpha;
      }
    });
    return {
      strokeStyle,
      globalAlpha,
    };
  }

  draw(
    ctx: CanvasRenderingContext2D | null,
    withDashedRectangle: boolean = true
  ): boolean {
    if (!ctx || !this.start) {
      return false;
    }

    ctx.beginPath();
    ctx.globalAlpha = this.globalAlpha;
    ctx.moveTo(this.start.x, this.start.y);

    this.lines.forEach((line, idx) => {
      ctx.lineWidth = line.lineWidth;
      if (line.strokeStyle) {
        ctx.strokeStyle = line.strokeStyle;
        console.log(idx, " style", line.strokeStyle);
      }
      if (line.globalAlpha !== null && line.globalAlpha !== undefined) {
        ctx.globalAlpha = line.globalAlpha;
      }
      switch (line.type) {
        case LineType.LINE:
          this.drawLine(ctx, line);
          break;
        case LineType.CURVE:
          this.drawCurve(ctx, line);
          break;
      }
      ctx.stroke();
    });

    if (this.closed) {
      ctx.closePath();
      ctx.stroke();
    }

    if (this.filled) {
      ctx.globalAlpha = this.globalAlpha;
      ctx.fillStyle = this.fillStyle;
      ctx.fill();
    }

    this.rectangle = this.getRectangle();

    if (withDashedRectangle && this.lines.length > 1 && this.rectangle) {
      this.drawDashedRectangle(ctx);
    }

    return true;
  }

  drawBadge(ctx: CanvasRenderingContext2D | null, opacity: number) {
    if (!ctx || !this.rectangle) {
      return;
    }
    const badge = badgePosition(this.rectangle, ctx.canvas.width);
    if (badge) {
      drawBadge(
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
    if (!ctx || !this.rectangle) {
      return;
    }
    drawDashedRectangle(ctx, this.rectangle, 0.35);

    this.drawBadge(
      ctx,
      mouseOnRectangle === BORDER.ON_BUTTON ? 1 : DEFAULT_OPACITY
    );
  }

  addLine(line: LinePath) {
    const { strokeStyle, globalAlpha } = this.getLastParams();

    const newLine: LinePath = {
      type: line.type,
      end: roundCoordinates(line.end),
      lineWidth: line.lineWidth,
    };
    if (line.coordinates) {
      newLine.coordinates = roundCoordinates(line.coordinates);
    }
    if (line.strokeStyle && line.strokeStyle !== strokeStyle) {
      console.log("add new Style", line.strokeStyle);
      newLine.strokeStyle = line.strokeStyle;
    }
    if (
      line.globalAlpha !== null &&
      line.globalAlpha !== undefined &&
      line.globalAlpha !== globalAlpha
    ) {
      newLine.globalAlpha = line.globalAlpha;
    }
    this.lines.push(newLine);
    this.rectangle = this.getRectangle();
  }

  setFillStyle(fillStyle: string | null = null) {
    if (fillStyle == null) {
      this.filled = false;
      return;
    }
    this.filled = true;
    this.fillStyle = fillStyle;
  }

  setGlobalAlpha(globalAlpha: number) {
    this.globalAlpha = globalAlpha;
    if (globalAlpha === 0) {
      this.filled = false;
    }
  }

  close() {
    if (this.lines.length > 0) {
      const lastLine = this.lines[this.lines.length - 1];
      if (
        lastLine.type === LineType.CURVE &&
        lastLine.end &&
        Math.abs(lastLine.end.x - this.start.x) < MARGIN &&
        Math.abs(lastLine.end.y - this.start.y) < MARGIN
      ) {
        const dx = this.start.x - lastLine.end.x;
        const dy = this.start.y - lastLine.end.y;
        lastLine.end = {
          x: this.start.x,
          y: this.start.y,
        };

        if (lastLine.coordinates) {
          lastLine.coordinates = {
            x: lastLine.coordinates.x + dx / 2,
            y: lastLine.coordinates.y + dy / 2,
          };
        }
      }
    }

    this.closed = true;
    // console.log("closed", this);
  }

  isClosed() {
    return this.closed;
  }

  isInRectangle(coord: Coordinate): boolean {
    if (!this.rectangle) {
      return false;
    }
    return (
      coord.x >= this.rectangle.x &&
      coord.x <= this.rectangle.x + this.rectangle.width &&
      coord.y >= this.rectangle.y &&
      coord.y <= this.rectangle.y + this.rectangle.height
    );
  }

  findAngle(coord: Coordinate): boolean {
    // Vérifier le point de départ
    if (
      Math.abs(this.start.x - coord.x) < MARGIN &&
      Math.abs(this.start.y - coord.y) < MARGIN
    ) {
      this.angleFound = 0; // 1 pour le point de départ (0 + 1)
      return true;
    }

    // Vérifier les points de fin de chaque ligne
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (line.end) {
        if (
          Math.abs(line.end.x - coord.x) < MARGIN &&
          Math.abs(line.end.y - coord.y) < MARGIN
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

  moveAngle(newCoord: Coordinate) {
    if (this.angleFound === 0) {
      this.start = newCoord;
      this.rectangle = this.getRectangle();
      return true;
    }
    if (this.angleFound > 0 && this.angleFound <= this.lines.length) {
      this.lines[this.angleFound - 1].end = { ...newCoord };
      this.rectangle = this.getRectangle();
      return true;
    }
    return false;
  }

  move(offset: Coordinate) {
    this.start.x += offset.x;
    this.start.y += offset.y;
    this.lines.forEach((line) => {
      if (line.end) {
        line.end.x += offset.x;
        line.end.y += offset.y;
      }
      if (line.coordinates) {
        line.coordinates.x += offset.x;
        line.coordinates.y += offset.y;
      }
    });
    if (this.rectangle) {
      this.rectangle.x += offset.x;
      this.rectangle.y += offset.y;
    }
    this.angleFound = -1;
  }

  mouseDown(ctx: CanvasRenderingContext2D | null, mousePosition: Coordinate) {
    this.lastMousePosition = mousePosition;
    if (this.rectangle) {
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

  mouseOverPath(
    ctx: CanvasRenderingContext2D | null,
    mousePosition: Coordinate,
    btnPressed: boolean
  ) {
    let cursorType = "default";
    let inRectangle = false;
    if (this.isInRectangle(mousePosition)) {
      // action after the path is closed
      cursorType = "move";
      inRectangle = true;
    }
    if ((btnPressed || inRectangle) && this.findAngle(mousePosition)) {
      cursorType = "pointer";
      if (btnPressed) {
        ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.moveAngle(mousePosition);
        this.draw(ctx);
      }
    } else if (btnPressed && inRectangle && this.lastMousePosition) {
      this.throttleMovePath(ctx, mousePosition);
    } else {
      const mouseOnRectangle = this.handleMouseOnRectange(ctx, mousePosition);
      if (mouseOnRectangle === BORDER.ON_BUTTON) {
        this.drawBadge(ctx, 1);
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
    if (!this.rectangle || !ctx) {
      return null;
    }
    const argsMouseOnRectangle: ArgsMouseOnShape = {
      coordinate: mousePosition,
      area: this.rectangle,
      withResize: false,
      withCornerButton: true,
      withTurningButtons: false,
      maxWidth: ctx.canvas.width,
    };

    return isOnSquareBorder(argsMouseOnRectangle);
  }
}
