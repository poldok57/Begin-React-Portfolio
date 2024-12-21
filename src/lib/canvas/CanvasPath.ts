/**
 * @module canvas-path
 * @description
 * This module provides functions to draw and manipulate paths on a canvas.
 */

import { Coordinate, LinePath, LineType } from "./types";
import {
  DRAW_TYPE,
  ParamsPath,
  ParamsGeneral,
  CanvasPointsData,
  ParamsArrow,
} from "./canvas-defines";
import { CanvasPoints } from "./CanvasPoints";
import { crossLine } from "./canvas-basic";
import { drawArrow } from "./canvas-arrow";

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
  protected arrowHasChanged: boolean = false;
  constructor(line: LinePath | null) {
    super();
    this.setDataType(DRAW_TYPE.LINES_PATH);
    if (!line) {
      return;
    }
    if (!line.coordinates) {
      throw new Error("Line coordinates are required");
    }
    const end: Coordinate = roundCoordinates(line.coordinates) as Coordinate;
    this.startArea(end);
    const item: LinePath = {
      type: LineType.START,
      end: end,
    };
    this.data.path = {
      filled: false,
      color: "gray",
      opacity: 0,
    };
    this.addItem(item);
  }

  getData(): CanvasPointsData | null {
    let firstItem: LinePath | null = null;

    if (!this.data.items || this.data.items.length <= 1) {
      return null;
    }

    firstItem = this.data.items[1] as LinePath;
    this.data.general.color = firstItem.strokeStyle ?? "gray";
    // change type to arrow if first item is an arrow
    if (firstItem.type === LineType.ARROW) {
      this.data.type = DRAW_TYPE.ARROW;
      this.data.path = undefined;
    }
    // select main color for illustration in draw list
    if (this.data.path?.filled) {
      this.data.general.color = this.data.path?.color;
    } else if (firstItem) {
      this.data.general.color = firstItem.strokeStyle ?? "gray";
    }
    return { ...this.data };
  }

  private getLastParams() {
    let strokeStyle: string = "black";
    let globalAlpha: number = this.data.general.opacity;
    let lineWidth: number = 1;

    (this.data.items as LinePath[]).forEach((line) => {
      if (line.strokeStyle) {
        strokeStyle = line.strokeStyle;
      }
      if (line.globalAlpha) {
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

  fillPath(ctx: CanvasRenderingContext2D | null, minWidth: number) {
    if (!ctx || !this.data.path) {
      return false;
    }
    ctx.globalAlpha = 0;
    ctx.lineWidth = minWidth;
    ctx.beginPath();

    (this.data.items as LinePath[]).forEach((line) => {
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

    ctx.globalAlpha = this.data.path.opacity;
    ctx.fillStyle = this.data.path.color;
    ctx.fill();
    return true;
  }

  /**
   * Draw the path on the canvas
   * @param ctx - canvas context
   * @returns true if the path is drawn, false otherwise
   */
  drawLines(ctx: CanvasRenderingContext2D | null): boolean {
    if (!ctx) {
      return false;
    }

    if (this.data.items.length <= 1) {
      return true;
    }

    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    let minWidth = 100;
    let maxWidth = 0;
    let start: Coordinate | null = null;

    let hasChanged = true;
    let lineWidth: number | null = null;
    let strokeStyle: string | null = null;
    let globalAlpha: number | null = null;

    (this.data.items as LinePath[]).forEach((line) => {
      if (line.lineWidth && line.lineWidth !== ctx.lineWidth) {
        minWidth = Math.min(minWidth, line.lineWidth);
        maxWidth = Math.max(maxWidth, line.lineWidth);
        lineWidth = line.lineWidth;
        hasChanged = true;
      }
      if (line.strokeStyle && line.strokeStyle !== ctx.strokeStyle) {
        strokeStyle = line.strokeStyle;
        hasChanged = true;
      }
      if (line.globalAlpha && line.globalAlpha !== ctx.globalAlpha) {
        globalAlpha = line.globalAlpha;
        hasChanged = true;
      }

      if (hasChanged) {
        if (start) {
          // finish the previous line
          ctx.stroke();
        }
        ctx.beginPath();
        if (lineWidth) {
          ctx.lineWidth = lineWidth;
          lineWidth = null;
        }
        if (strokeStyle) {
          ctx.strokeStyle = strokeStyle;
        }
        if (globalAlpha) {
          ctx.globalAlpha = globalAlpha;
          globalAlpha = null;
        }

        if (start) {
          ctx.moveTo(start.x, start.y);
        }
        hasChanged = false;
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
        case LineType.ARROW:
          if (start && line.end) {
            const coord: Coordinate = drawArrow({
              ctx,
              from: start,
              to: line.end,
              lineWidth: line.lineWidth ?? ctx.lineWidth,
              opacity: line.globalAlpha ?? ctx.globalAlpha,
              color: line.strokeStyle ?? ctx.strokeStyle,
              headSize: line.headSize ?? 0,
              padding: line.padding ?? 2,
              curvature: line.curvature ?? 0.2,
            });

            line.coordinates = roundCoordinates(coord);
            if (this.arrowHasChanged && line.coordinates) {
              this.addPointInArea(line.coordinates);
              this.arrowHasChanged = false;
            }
          }
          break;
      }
      if (line.end) {
        start = line.end;
      }
    });
    ctx.stroke();

    if (this.data.path && this.data.path.filled) {
      this.fillPath(ctx, minWidth);
    }
    return true;
  }

  drawAddingInfos(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) {
      return false;
    }

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    // Dessiner des croix à chaque point correspondant à l'argument coordinate des éléments PathLine
    this.data.items.forEach((item) => {
      if ("end" in item) {
        const line = item as LinePath;
        if (line.end) {
          ctx.strokeStyle = "blue";
          const coord = {
            x: line.end.x + this.data.size.x,
            y: line.end.y + this.data.size.y,
          };
          crossLine(ctx, coord, 10); // Utilisation d'une largeur de 10 pour la croix
        }
        if (line.coordinates && line.type === LineType.CURVE) {
          ctx.strokeStyle = "red";
          const coord = {
            x: line.coordinates.x + this.data.size.x,
            y: line.coordinates.y + this.data.size.y,
          };
          crossLine(ctx, coord, 10);
        }
      }
    });
  }

  setParamsPath(ctx: CanvasRenderingContext2D | null, params: ParamsPath) {
    const hasChanged =
      this.data.path &&
      (this.data.path.filled !== params.filled ||
        this.data.path.color !== params.color ||
        this.data.path.opacity !== params.opacity);
    if (hasChanged) {
      this.data.path = { ...params };
    }
    return hasChanged;
  }

  changeParams(params: ParamsGeneral, paramsArrow: ParamsArrow) {
    // Apply color, line width and opacity to the first path item
    if (this.data.items.length > 1) {
      // first item is start point
      const secondItem = this.data.items[1] as LinePath;

      secondItem.strokeStyle = params.color;
      secondItem.lineWidth = params.lineWidth;
      secondItem.globalAlpha = params.opacity;
      if (secondItem.type === LineType.ARROW) {
        secondItem.headSize = paramsArrow.headSize;
        secondItem.padding = paramsArrow.padding;
        secondItem.curvature = paramsArrow.curvature;
        this.arrowHasChanged = true;
      }
    }
  }

  addLine(line: LinePath) {
    const { lineWidth, strokeStyle, globalAlpha } = this.getLastParams();

    const newLine: LinePath = {
      type: line.type,
      end: roundCoordinates(line.end),
    };
    if (
      (line.type === LineType.CURVE || line.type === LineType.ARROW) &&
      line.coordinates
    ) {
      newLine.coordinates = roundCoordinates(line.coordinates);
    }
    if (line.type === LineType.ARROW) {
      newLine.headSize = line.headSize;
      newLine.padding = line.padding;
      newLine.curvature = line.curvature;
    }
    if (line.strokeStyle && line.strokeStyle !== strokeStyle) {
      newLine.strokeStyle = line.strokeStyle;
    }
    if (line.lineWidth && line.lineWidth !== lineWidth) {
      newLine.lineWidth = line.lineWidth;
    }

    if (line.globalAlpha && line.globalAlpha !== globalAlpha) {
      newLine.globalAlpha = line.globalAlpha;
    }
    this.addItem(newLine);
  }

  cancelLastLine() {
    if (this.data.items.length > 0) {
      this.cancelLastItem();
      return true;
    }
    return false;
  }

  getLastLine(): LinePath | null {
    return this.getLastItem() as LinePath;
  }

  setFillStyle(fillStyle: string | null = null) {
    if (fillStyle == null) {
      this.data.path = {
        filled: false,
        color: "gray",
        opacity: 0,
      };
      return;
    }
    this.data.path = {
      filled: true,
      color: fillStyle,
      opacity: 1,
    };
  }

  /**
   * Close the path by adding a line to the start point,
   * if the last item is close to the start point, we can close the path
   */
  close() {
    if (this.data.items.length <= 1) {
      return;
    }

    const lastItem: LinePath | null = this.getLastItem() as LinePath;
    if (!lastItem || !lastItem.end) {
      return;
    }

    // if the last item is not close to the start point, we add a line to the start point to close the path
    if (!this.isCloseFromStart(lastItem.end)) {
      const newLine: LinePath = {
        type: LineType.LINE,
        end: { ...this.getStartCoordinates() },
      };
      this.addItem(newLine);
      return;
    }

    // if the last item is close to the start point, we can close the path

    const start = (this.data.items[0] as LinePath).end as Coordinate;
    const midX = (start.x - lastItem.end.x) / 2;
    const midY = (start.y - lastItem.end.y) / 2;

    if (midX === 0 && midY === 0) {
      // exact same point
      return;
    }

    // for curve we can move last point to start point
    if (lastItem && lastItem.type === LineType.CURVE) {
      lastItem.end = {
        x: start.x,
        y: start.y,
      };
      if (lastItem.coordinates) {
        lastItem.coordinates = {
          x: lastItem.coordinates.x + midX,
          y: lastItem.coordinates.y + midY,
        };
      }
      // console.log("close curve", lastItem.end);
      return;
    }
    // if the last item is a line, we can close the path
    // Move the start point and the end point to the middle point
    start.x = start.x + midX;
    start.y = start.y + midY;
    lastItem.end.x = start.x;
    lastItem.end.y = start.y;
  }
}
