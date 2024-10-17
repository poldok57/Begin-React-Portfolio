import { Coordinate, LinePath } from "./types";
import { basicLine } from "./canvas-basic";
import { throttle } from "@/lib/utils/throttle";
import { CanvasPoints } from "./CanvasPoints";
import { ParamsGeneral } from "./canvas-defines";

const MARGIN = 5;
const DELAY = 50;

export class CanvasFreeCurve extends CanvasPoints {
  constructor() {
    super();
  }

  clearPoints() {
    this.items = [];
  }

  startCurve({
    firstPoint,
    general,
  }: {
    firstPoint: Coordinate;
    general: ParamsGeneral;
  }) {
    this.items = [];
    this.items.push(firstPoint as Coordinate & LinePath);

    this.setParamsGeneral({
      opacity: general.opacity || 1,
      color: general.color || "#000",
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
    if (this.items.length < 2) return;

    ctx.globalAlpha = this.general.opacity;
    ctx.strokeStyle = this.general.color;
    ctx.lineWidth = this.general.lineWidth;

    if (this.items.length === 2) {
      basicLine(ctx, this.items[0] as Coordinate, this.items[1] as Coordinate);
      return;
    }

    // calculate list of curves
    ctx.beginPath();
    ctx.moveTo(
      (this.items[0] as Coordinate).x,
      (this.items[0] as Coordinate).y
    );

    for (let i = 1; i < this.items.length - 2; i += 2) {
      const xc =
        ((this.items[i] as Coordinate).x +
          (this.items[i + 1] as Coordinate).x) /
        2;
      const yc =
        ((this.items[i] as Coordinate).y +
          (this.items[i + 1] as Coordinate).y) /
        2;

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
        distanceToLine(
          this.items[i] as Coordinate,
          this.items[i - 1] as Coordinate,
          { x: xc, y: yc }
        ) <= MARGIN
      ) {
        ctx.quadraticCurveTo(
          (this.items[i] as Coordinate).x,
          (this.items[i] as Coordinate).y,
          xc,
          yc
        );
      } else {
        ctx.lineTo(
          (this.items[i] as Coordinate).x,
          (this.items[i] as Coordinate).y
        );
        ctx.lineTo(xc, yc);
      }
    }

    // Gestion des derniers points
    if (this.items.length % 2 === 0) {
      ctx.quadraticCurveTo(
        (this.items[this.items.length - 2] as Coordinate).x,
        (this.items[this.items.length - 2] as Coordinate).y,
        (this.items[this.items.length - 1] as Coordinate).x,
        (this.items[this.items.length - 1] as Coordinate).y
      );
    } else {
      ctx.lineTo(
        (this.items[this.items.length - 1] as Coordinate).x,
        (this.items[this.items.length - 1] as Coordinate).y
      );
    }

    ctx.stroke();

    if (withDashedRectangle && this.items.length > 1 && this.area) {
      this.drawDashedRectangle(ctx);
    }
  }
}
