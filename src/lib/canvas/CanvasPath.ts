/**
 * @module canvas-path
 * @description
 * This module provides functions to store data to draw a path, lines or an arrow on a canvas.
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

    const item: LinePath = {
      type: LineType.START,
      end: end,
    };
    this.startArea(item);
    this.addItem(item);
  }

  /**
   * Get the data of the path
   * @returns the data of the path
   */
  getData(): CanvasPointsData | null {
    let firstItem: LinePath | null = null;

    if (!this.data.items || this.data.items.length <= 1) {
      return null;
    }
    // console.log("getData", this.data);

    firstItem = this.data.items[1] as LinePath;
    this.data.general.color = firstItem.strokeStyle ?? "gray";
    // change type to arrow if first item is an arrow
    if (firstItem.type === LineType.ARROW) {
      this.data.type = DRAW_TYPE.ARROW;
      this.data.path = undefined;
    }
    // select main color for illustration in draw list
    if (this.data.general?.filled && this.data.general.color) {
      this.data.general.color = this.data.general.color;
    } else if (firstItem) {
      this.data.general.color = firstItem.strokeStyle ?? "gray";
    }
    return { ...this.data };
  }

  /**
   * Get the last parameters of the path
   * @returns the last parameters of the path
   */
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

  /**
   * Fill the path on the canvas
   * @param ctx - canvas context
   * @param minWidth - minimum line width
   * @returns true if the path is filled, false otherwise
   */
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

    ctx.globalAlpha = this.data.path?.opacity ?? 1;
    ctx.fillStyle = this.data.path?.color ?? this.data.general.color;
    ctx.fill();
    return true;
  }

  /**
   * Draw the path on the canvas
   * @param ctx - canvas context
   * @returns true if the path is drawn, false otherwise
   */
  drawLines(ctx: CanvasRenderingContext2D | null): boolean {
    if (!ctx || this.data.items.length <= 1) {
      return false;
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
            this.arrowArea = drawArrow({
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
          }
          break;
      }
      if (line.end) {
        start = line.end;
      }
    });
    ctx.stroke();

    if (this.data.path && this.data.general.filled) {
      this.fillPath(ctx, minWidth);
    }
    return true;
  }

  /**
   * Draw the adding infos on the canvas, cross lines at end points and curve points
   * @param ctx - canvas context
   * @returns true if the infos are drawn, false otherwise
   */
  drawAddingInfos(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) {
      return false;
    }

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    // Draw crosses at each point corresponding to the coordinate argument of PathLine elements

    const area = this.getArea();

    this.data.items.forEach((item) => {
      if ("end" in item) {
        const line = item as LinePath;
        if (line.end) {
          const coord = {
            x: (line.end.x + area.x) * this.scale,
            y: (line.end.y + area.y) * this.scale,
          };
          crossLine(ctx, coord, 10, "blue"); // Utilisation d'une largeur de 10 pour la croix
        }
        if (line.coordinates && line.type === LineType.CURVE) {
          const coord = {
            x: (line.coordinates.x + area.x) * this.scale,
            y: (line.coordinates.y + area.y) * this.scale,
          };
          crossLine(ctx, coord, 10, "red", "X");
        }
      }
    });
  }

  setParamsPath(ctx: CanvasRenderingContext2D | null, params: ParamsPath) {
    const hasChanged =
      !this.data.path ||
      this.data.path.color !== params.color ||
      this.data.path.opacity !== params.opacity;
    if (hasChanged) {
      this.data.path = { ...params };
      this.setHasChanged("draw", true);
    }
    return hasChanged;
  }

  changeParams(params: ParamsGeneral, paramsArrow: ParamsArrow) {
    // Apply color, line width and opacity to the first path item
    if (this.data.items.length > 1) {
      if (this.data.general.filled !== params.filled) {
        this.setHasChanged("draw", true);
        this.data.general.filled = params.filled;
      }
      // first item is start point
      const secondItem = this.data.items[1] as LinePath;
      if (secondItem.strokeStyle !== params.color) {
        this.setHasChanged("draw", true);
        secondItem.strokeStyle = params.color;
      }
      if (secondItem.lineWidth !== params.lineWidth) {
        this.setHasChanged("draw", true);
        this.setHasChanged("position", true);
        secondItem.lineWidth = params.lineWidth;
      }
      if (secondItem.globalAlpha !== params.opacity) {
        this.setHasChanged("draw", true);
        secondItem.globalAlpha = params.opacity;
      }
      if (secondItem.type === LineType.ARROW) {
        if (secondItem.headSize !== paramsArrow.headSize) {
          this.setHasChanged("position", true);
          secondItem.headSize = paramsArrow.headSize;
        }
        if (secondItem.curvature !== paramsArrow.curvature) {
          this.setHasChanged("position", true);
          secondItem.curvature = paramsArrow.curvature;
        }

        secondItem.padding = paramsArrow.padding;
        this.setHasChanged("draw", true);
      }
    }
  }

  addLine(line: LinePath) {
    const { lineWidth, strokeStyle, globalAlpha } = this.getLastParams();

    const newLine: LinePath = {
      type: line.type,
      end: roundCoordinates(line.end),
    };
    if (line.type === LineType.CURVE && line.coordinates) {
      newLine.coordinates = roundCoordinates(line.coordinates);
    }
    if (line.type === LineType.ARROW) {
      newLine.headSize = line.headSize;
      newLine.padding = line.padding;
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

    this.isClosed = true;

    // if the last item is not close to the start point, we add a line to the start point to close the path
    if (!this.isPathClosed()) {
      // console.log("point not close from first item");
      const first = this.getFirstItem();
      if (!first) {
        return;
      }
      const area = this.getArea();
      const newLine: LinePath = {
        type: LineType.LINE,
        end: { x: first.x + area.x, y: first.y + area.y },
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
