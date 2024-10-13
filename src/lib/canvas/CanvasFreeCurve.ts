import { Coordinate } from "./types";
import { basicLine } from "./canvas-basic";
import { throttle } from "@/lib/utils/throttle";
export class CanvasFreeCurve {
  private points: Coordinate[] = [];
  private globalAlpha: number = 1;
  private strokeStyle: string = "#000";
  private lineWidth: number = 1;

  constructor() {}

  clearPoints() {
    this.points = [];
  }

  startCurve({
    firstPoint,
    globalAlpha,
    strokeStyle,
    lineWidth,
  }: {
    firstPoint: Coordinate;
    globalAlpha?: number;
    strokeStyle?: string;
    lineWidth?: number;
  }) {
    this.points = [];
    this.points.push(firstPoint);
    this.globalAlpha = globalAlpha || 1;
    this.strokeStyle = strokeStyle || "#000";
    this.lineWidth = lineWidth || 1;
  }

  addPoint(point: Coordinate) {
    this.points.push(point);
  }

  delayAddPoint(point: Coordinate) {
    // Utilisation de throttle pour limiter la fréquence d'ajout de points
    const throttledAddPoint = throttle((point: Coordinate) => {
      this.points.push(point);
    }, 50); // 50ms de délai

    throttledAddPoint(point);
  }

  drawCurve(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;
    if (this.points.length === 2) {
      basicLine(ctx, this.points[0], this.points[1]);
      return;
    }
    const MARGIN = 5;
    // Calcul d'une suite de courbes passant près de tous les points avec une marge maximale
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length - 2; i += 2) {
      const xc = (this.points[i].x + this.points[i + 1].x) / 2;
      const yc = (this.points[i].y + this.points[i + 1].y) / 2;

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
        distanceToLine(this.points[i], this.points[i - 1], { x: xc, y: yc }) <=
        MARGIN
      ) {
        ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
      } else {
        ctx.lineTo(this.points[i].x, this.points[i].y);
        ctx.lineTo(xc, yc);
      }
    }

    // Gestion des derniers points
    if (this.points.length % 2 === 0) {
      ctx.quadraticCurveTo(
        this.points[this.points.length - 2].x,
        this.points[this.points.length - 2].y,
        this.points[this.points.length - 1].x,
        this.points[this.points.length - 1].y
      );
    } else {
      ctx.lineTo(
        this.points[this.points.length - 1].x,
        this.points[this.points.length - 1].y
      );
    }

    ctx.stroke();
  }
}
