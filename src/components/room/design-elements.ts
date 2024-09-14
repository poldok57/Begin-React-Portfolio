import { RectPosition as Position } from "@/lib/canvas/types";
import { DesignElement, DesignType } from "./types";

const drawDesignElement = (
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  offset: Position,
  scale: number
) => {
  ctx.globalAlpha = element.opacity || 1;
  switch (element.type) {
    case DesignType.background:
      if (
        !element.rect.left ||
        !element.rect.top ||
        !element.rect.width ||
        !element.rect.height
      ) {
        break;
      }
      ctx.fillStyle = element.color;
      ctx.fillRect(
        (element.rect.left - offset.left) * scale,
        (element.rect.top - offset.top) * scale,
        element.rect.width * scale,
        element.rect.height * scale
      );
      // Ajouter un bord noir
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (element.rect.left - offset.left) * scale,
        (element.rect.top - offset.top) * scale,
        element.rect.width * scale,
        element.rect.height * scale
      );
      break;
    case DesignType.line:
      if (!element.point1 || !element.point2) {
        return;
      }
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.rect.width;
      ctx.beginPath();
      ctx.moveTo(element.point1.x * scale, element.point1.y * scale);
      ctx.lineTo(element.point2.x * scale, element.point2.y * scale);
      ctx.stroke();
      break;
    case DesignType.arc:
      if (!element.point1 || !element.point2 || !element.point3) {
        return;
      }
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.rect.width;
      ctx.beginPath();
      ctx.moveTo(element.point1.x * scale, element.point1.y * scale);
      ctx.quadraticCurveTo(
        element.point2.x * scale,
        element.point2.y * scale,
        element.point3.x * scale,
        element.point3.y * scale
      );
      ctx.stroke();
      break;
  }
};

const hightLightSelectedElement = (
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  offset: Position,
  scale: number
) => {
  const margin = 5;
  // Dessiner un trait pointillé avec une marge extérieure
  switch (element.type) {
    case DesignType.background:
      ctx.globalAlpha = 1;

      if (
        !element.rect.left ||
        !element.rect.top ||
        !element.rect.width ||
        !element.rect.height
      ) {
        break;
      }
      // Dessiner un trait pointillé avec une marge extérieure
      ctx.setLineDash([10, 5]); // Définir le motif du trait pointillé
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (element.rect.left - offset.left) * scale - margin,
        (element.rect.top - offset.top) * scale - margin,
        (element.rect.width + 2 * margin) * scale,
        (element.rect.height + 2 * margin) * scale
      );
      ctx.setLineDash([]); // Réinitialiser le style de ligne
      break;
    case DesignType.line:
      if (!element.point1 || !element.point2) {
        return;
      }
      ctx.strokeStyle = "red";
      ctx.globalAlpha = 0.33;
      ctx.lineCap = "round";

      ctx.lineWidth = element.lineWidth
        ? element.lineWidth + 2 * margin
        : 1 + 2 * margin;
      ctx.beginPath();
      ctx.moveTo(element.point1.x * scale, element.point1.y * scale);
      ctx.lineTo(element.point2.x * scale, element.point2.y * scale);
      ctx.stroke();
      break;
    case DesignType.arc:
      if (!element.point1 || !element.point2 || !element.point3) {
        return;
      }
      ctx.strokeStyle = "red";
      ctx.globalAlpha = 0.33;
      ctx.lineCap = "round";
      ctx.lineWidth = element.lineWidth
        ? element.lineWidth + 2 * margin
        : 1 + 2 * margin;
      ctx.beginPath();
      ctx.moveTo(element.point1.x, element.point1.y);
      ctx.quadraticCurveTo(
        element.point2.x * scale,
        element.point2.y * scale,
        element.point3.x * scale,
        element.point3.y * scale
      );
      ctx.stroke();
      break;
  }
};
interface DrawAllDesignElementsProps {
  ctx: CanvasRenderingContext2D;
  temporaryCtx: CanvasRenderingContext2D | null;

  elements: DesignElement[];
  offset: Position;
  selectedElementId: string | null;
  scale?: number;
}

export const drawAllDesignElements = ({
  ctx,
  elements,
  offset,
  selectedElementId,
  temporaryCtx,
  scale = 1,
}: DrawAllDesignElementsProps) => {
  // clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (temporaryCtx) {
    // clear the temporary canvas
    temporaryCtx.clearRect(
      0,
      0,
      temporaryCtx.canvas.width,
      temporaryCtx.canvas.height
    );
  }

  elements.forEach((element) => {
    drawDesignElement(ctx, element, offset, scale);
    if (element.id === selectedElementId) {
      hightLightSelectedElement(temporaryCtx ?? ctx, element, offset, scale);
    }
  });
};
