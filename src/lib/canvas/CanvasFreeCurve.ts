import { Coordinate, LinePath } from "./types";
import { basicLine } from "./canvas-basic";
import { throttle } from "@/lib/utils/throttle";
import { CanvasPoints } from "./CanvasPoints";
import { DRAW_TYPE, ParamsGeneral } from "./canvas-defines";

const MARGIN = 5;
const DELAY = 50;

export class CanvasFreeCurve extends CanvasPoints {
  constructor() {
    super();
    this.setDataType(DRAW_TYPE.DRAW);
  }

  clearPoints() {
    this.data.items = [];
  }

  startCurve({
    firstPoint,
    general,
  }: {
    firstPoint: Coordinate;
    general: ParamsGeneral;
  }) {
    this.data.items = [];
    this.data.items.push(firstPoint as Coordinate & LinePath);

    this.setParamsGeneral({
      opacity: general.opacity || 0,
      color: general.color || "#fff",
      lineWidth: general.lineWidth || 1,
    });
    this.startArea(firstPoint);
  }

  delayAddPoint(point: Coordinate) {
    // Utilisation de throttle pour limiter la fréquence d'ajout de points
    const throttledAddPoint = throttle((point: Coordinate) => {
      this.addItem(point);
    }, DELAY); // 50ms de délai

    throttledAddPoint(point);
  }

  draw(ctx: CanvasRenderingContext2D, withDashedRectangle: boolean = false) {
    const items = this.data.items;

    if (items.length < 2) return;

    ctx.globalAlpha = this.data.general.opacity;
    ctx.strokeStyle = this.data.general.color;
    ctx.lineWidth = this.data.general.lineWidth;

    if (items.length === 2) {
      basicLine(ctx, items[0] as Coordinate, items[1] as Coordinate);
      return;
    }

    // calculate list of curves
    ctx.beginPath();
    ctx.moveTo((items[0] as Coordinate).x, (items[0] as Coordinate).y);

    for (let i = 1; i < items.length - 2; i += 2) {
      const xc =
        ((items[i] as Coordinate).x + (items[i + 1] as Coordinate).x) / 2;
      const yc =
        ((items[i] as Coordinate).y + (items[i + 1] as Coordinate).y) / 2;

      // Vérification de la marge
      const distanceToLine = (
        point: Coordinate,
        start: Coordinate,
        end: Coordinate
      ) => {
        const A = point.x - start.x;
        const B = point.y - start.y;
        const C = end.x - start.x;
        const D = end.y - start.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        const param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
          xx = start.x;
          yy = start.y;
        } else if (param > 1) {
          xx = end.x;
          yy = end.y;
        } else {
          xx = start.x + param * C;
          yy = start.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;

        return Math.sqrt(dx * dx + dy * dy);
      };

      if (
        distanceToLine(items[i] as Coordinate, items[i - 1] as Coordinate, {
          x: xc,
          y: yc,
        }) <= MARGIN
      ) {
        ctx.quadraticCurveTo(
          (items[i] as Coordinate).x,
          (items[i] as Coordinate).y,
          xc,
          yc
        );
      } else {
        ctx.lineTo((items[i] as Coordinate).x, (items[i] as Coordinate).y);
        ctx.lineTo(xc, yc);
      }
    }

    // Gestion des derniers points
    if (items.length % 2 === 0) {
      ctx.quadraticCurveTo(
        (items[items.length - 2] as Coordinate).x,
        (items[items.length - 2] as Coordinate).y,
        (items[items.length - 1] as Coordinate).x,
        (items[items.length - 1] as Coordinate).y
      );
    } else {
      ctx.lineTo(
        (items[items.length - 1] as Coordinate).x,
        (items[items.length - 1] as Coordinate).y
      );
    }

    ctx.stroke();

    if (withDashedRectangle && items.length > 1 && this.data.size) {
      this.drawDashedRectangle(ctx);
    }
  }
}
