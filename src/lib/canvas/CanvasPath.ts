/**
 * @module canvas-path
 * @description
 * This module provides functions to draw and manipulate paths on a canvas.
 */

import { Coordinate, LinePath, LineType } from "./types";
import { ParamsPath } from "./canvas-defines";
import { CanvasPoints } from "./CanvasPoints";
import { crossLine } from "./canvas-basic";
import { MARGIN } from "./CanvasPoints";

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
  filled: boolean;
  fillStyle: string = "gray";

  constructor(line: LinePath) {
    super();
    if (!line.coordinates) {
      throw new Error("Line coordinates are required");
    }
    const end: Coordinate = roundCoordinates(line.coordinates) as Coordinate;
    this.startArea(end);
    this.filled = false;
    const item: LinePath = {
      type: LineType.START,
      end: end,
    };
    this.addItem(item);

    this.setParamsGeneral({
      opacity: line.globalAlpha || 1,
      color: line.strokeStyle || "#000",
      lineWidth: line.lineWidth || 1,
    });
  }

  private getLastParams() {
    let strokeStyle: string = "black";
    let globalAlpha: number = this.general.opacity;
    let lineWidth: number = 1;

    (this.items as LinePath[]).forEach((line) => {
      if (line.strokeStyle) {
        strokeStyle = line.strokeStyle;
      }
      if (line.globalAlpha !== null && line.globalAlpha !== undefined) {
        globalAlpha = line.globalAlpha;
      }
      if (line.lineWidth) {
        lineWidth = line.lineWidth;
      }
    });
    return {
      strokeStyle,
      globalAlpha,
      lineWidth,
    };
  }

  fillPath(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) {
      return false;
    }
    ctx.globalAlpha = 0;
    ctx.lineWidth = 1;
    ctx.fillStyle = "transparent";
    ctx.beginPath();

    (this.items as LinePath[]).forEach((line) => {
      switch (line.type) {
        case LineType.START:
          if (line.end) {
            ctx.moveTo(line.end.x, line.end.y);
          }
          break;
        case LineType.LINE:
          if (line.end) {
            ctx.lineTo(line.end.x, line.end.y);
          }
          break;
        case LineType.CURVE:
          if (line.coordinates && line.end) {
            ctx.quadraticCurveTo(
              line.coordinates.x,
              line.coordinates.y,
              line.end.x,
              line.end.y
            );
          }
          break;
      }
    });
    ctx.stroke();

    ctx.globalAlpha = this.general.opacity;
    ctx.fillStyle = this.fillStyle;
    ctx.fill();
    return true;
  }

  draw(
    ctx: CanvasRenderingContext2D | null,
    withDashedRectangle: boolean = true
  ): boolean {
    if (!ctx) {
      return false;
    }

    if (this.items.length <= 0) {
      return true;
    }

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;

    const firstItem: LinePath | null = this.items[0] as LinePath;

    let start: Coordinate | null = firstItem?.end as Coordinate;

    (this.items as LinePath[]).forEach((line) => {
      ctx.beginPath();
      if (start) {
        ctx.moveTo(start.x, start.y);
      }

      if (line.lineWidth) {
        ctx.lineWidth = line.lineWidth;
      }
      if (line.strokeStyle) {
        ctx.strokeStyle = line.strokeStyle;
      }
      if (line.globalAlpha !== null && line.globalAlpha !== undefined) {
        ctx.globalAlpha = line.globalAlpha;
      }

      switch (line.type) {
        case LineType.START:
          if (!line.end) {
            throw new Error("Line Path Start must have coordinates");
          }
          start = line.end;
          break;
        case LineType.LINE:
          if (line.end) {
            ctx.lineTo(line.end.x, line.end.y);
          }
          break;
        case LineType.CURVE:
          if (line.coordinates && line.end) {
            ctx.quadraticCurveTo(
              line.coordinates.x,
              line.coordinates.y,
              line.end.x,
              line.end.y
            );
          }
          break;
      }
      ctx.stroke();
      if (line.end) {
        start = line.end;
      }
    });

    if (this.filled) {
      this.fillPath(ctx);
    }

    if (!withDashedRectangle || this.items.length <= 1 || !this.area) {
      return false;
    }
    this.drawDashedRectangle(ctx);

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    // Dessiner des croix à chaque point correspondant à l'argument coordinate des éléments PathLine
    this.items.forEach((item) => {
      if ("end" in item) {
        const line = item as LinePath;
        if (line.end) {
          ctx.strokeStyle = "blue";
          crossLine(ctx, line.end, 10); // Utilisation d'une largeur de 10 pour la croix
        }
        if (line.coordinates) {
          ctx.strokeStyle = "red";
          crossLine(ctx, line.coordinates, 10);
        }
      }
    });

    return true;
  }

  setParams(ctx: CanvasRenderingContext2D | null, params: ParamsPath) {
    const { filled, color, opacity } = params;
    const hasChanged =
      this.filled !== filled ||
      this.fillStyle !== color ||
      this.general.opacity !== opacity;
    if (hasChanged) {
      this.filled = filled;
      this.fillStyle = color;
      this.general.opacity = opacity;

      this.draw(ctx);
    }
    return hasChanged;
  }

  addLine(line: LinePath) {
    const { lineWidth, strokeStyle, globalAlpha } = this.getLastParams();

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
    if (line.lineWidth && line.lineWidth !== lineWidth) {
      newLine.lineWidth = line.lineWidth;
    }

    if (
      line.globalAlpha !== null &&
      line.globalAlpha !== undefined &&
      line.globalAlpha !== globalAlpha
    ) {
      newLine.globalAlpha = line.globalAlpha;
    }
    this.addItem(newLine);
    // this.area = this.getArea();
  }

  cancelLastLine() {
    if (this.items.length > 0) {
      this.cancelLastItem();
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

  close() {
    if (this.items.length <= 0) {
      return;
    }

    const lastItem: LinePath | null = this.getLastItem() as LinePath;

    if (!lastItem || !lastItem.end) {
      return;
    }
    const firstItem: LinePath | null = this.items[0] as LinePath;
    const start: Coordinate = firstItem?.end as Coordinate;

    // for curve we can move last point to start point
    if (lastItem && lastItem.type === LineType.CURVE && lastItem.end) {
      const dx = start.x - lastItem.end.x;
      const dy = start.y - lastItem.end.y;

      if (Math.abs(dx) < MARGIN && Math.abs(dy) < MARGIN) {
        lastItem.end = {
          x: start.x,
          y: start.y,
        };
        if (lastItem.coordinates) {
          lastItem.coordinates = {
            x: lastItem.coordinates.x + dx / 2,
            y: lastItem.coordinates.y + dy / 2,
          };
        }
        // console.log("close curve", lastItem.end);
        return;
      }
    }
    console.log("close line", lastItem.end);
    if (lastItem.end.x !== start.x && lastItem.end.y !== start.y) {
      // add a line to the start point
      const newLine: LinePath = {
        type: LineType.LINE,
        end: { ...start },
      };
      this.addItem(newLine);
    }
  }
}
