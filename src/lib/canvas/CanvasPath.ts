/**
 * @module canvas-path
 * @description
 * This module provides functions to draw and manipulate paths on a canvas.
 */

import { Coordinate, LinePath, LineType } from "./types";
import { ParamsPath } from "./canvas-defines";
import { CanvasPoints } from "./CanvasPoints";

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

export class CanvasPath extends CanvasPoints {
  closed: boolean;
  filled: boolean;
  fillStyle: string;
  globalAlpha: number;

  constructor(line: LinePath) {
    super();
    if (!line.coordinates) {
      throw new Error("Line coordinates are required");
    }
    this.start = roundCoordinates(line.coordinates) as Coordinate;
    this.globalAlpha = line.globalAlpha || 1;

    this.closed = false;
    this.filled = false;
    this.fillStyle = "gray";
    this.globalAlpha = 1;
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

  private getLastParams() {
    let strokeStyle: string = "black";
    let globalAlpha: number = this.globalAlpha;

    (this.items as LinePath[]).forEach((line) => {
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

    (this.items as LinePath[]).forEach((line) => {
      ctx.lineWidth = line.lineWidth;
      if (line.strokeStyle) {
        ctx.strokeStyle = line.strokeStyle;
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

    this.area = this.getArea();

    if (withDashedRectangle && this.items.length > 1 && this.area) {
      this.drawDashedRectangle(ctx);
    }

    return true;
  }

  setParams(ctx: CanvasRenderingContext2D | null, params: ParamsPath) {
    const { filled, color, opacity } = params;
    const hasChanged =
      this.filled !== filled ||
      this.fillStyle !== color ||
      this.globalAlpha !== opacity;
    if (hasChanged) {
      this.filled = filled;
      this.fillStyle = color;
      this.globalAlpha = opacity;

      this.draw(ctx);
    }
    return hasChanged;
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
      newLine.strokeStyle = line.strokeStyle;
    }
    if (
      line.globalAlpha !== null &&
      line.globalAlpha !== undefined &&
      line.globalAlpha !== globalAlpha
    ) {
      newLine.globalAlpha = line.globalAlpha;
    }
    this.addItem(newLine);
    this.area = this.getArea();
  }

  cancelLastLine() {
    if (this.items.length > 0) {
      this.cancelLastItem();
      this.closed = false;
      return true;
    }
    return false;
  }

  getLastLine() {
    return this.getLastItem();
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
    if (this.items.length > 0) {
      const lastItem: LinePath | null = this.getLastItem() as LinePath;
      if (lastItem && lastItem.type === LineType.CURVE && lastItem.end) {
        const dx = this.start.x - lastItem.end.x;
        const dy = this.start.y - lastItem.end.y;
        lastItem.end = {
          x: this.start.x,
          y: this.start.y,
        };
        if (lastItem.coordinates) {
          lastItem.coordinates = {
            x: lastItem.coordinates.x + dx / 2,
            y: lastItem.coordinates.y + dy / 2,
          };
        }
      }
    }

    this.closed = true;
  }

  isClosed() {
    return this.closed;
  }
}
