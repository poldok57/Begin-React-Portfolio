import { DesignElement, DesignType } from "../types";

const drawDesignElement = (
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  scale: number
) => {
  ctx.globalAlpha = element.opacity || 1;
  switch (element.type) {
    case DesignType.square:
      if (!element.rect) {
        return;
      }
      if (
        !element.rect.left ||
        !element.rect.top ||
        !element.rect.width ||
        !element.rect.height
      ) {
        break;
      }
      ctx.fillStyle = element.color;

      // Save the current context state
      ctx.save();

      // Translate to the center of the rectangle
      ctx.translate(
        (element.rect.left + element.rect.width / 2) * scale,
        (element.rect.top + element.rect.height / 2) * scale
      );

      // Rotate if rotation is defined
      if (element.rotation) {
        ctx.rotate((element.rotation * Math.PI) / 180);
      }

      // Draw the rectangle
      ctx.fillRect(
        (-element.rect.width * scale) / 2,
        (-element.rect.height * scale) / 2,
        element.rect.width * scale,
        element.rect.height * scale
      );

      // Add a black border
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (-element.rect.width * scale) / 2,
        (-element.rect.height * scale) / 2,
        element.rect.width * scale,
        element.rect.height * scale
      );

      // Restore the context state
      ctx.restore();
      break;
    case DesignType.line:
      if (!element.point1 || !element.point2) {
        return;
      }
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth ?? 1;
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
      ctx.lineWidth = element.lineWidth ?? 1;
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

export const hightLightSelectedElement = (
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  scale: number
) => {
  const margin = 5;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  switch (element.type) {
    case DesignType.square:
      ctx.globalAlpha = 1;
      if (!element.rect) {
        return;
      }
      if (
        !element.rect.left ||
        !element.rect.top ||
        !element.rect.width ||
        !element.rect.height
      ) {
        break;
      }

      // Save the current context state
      ctx.save();

      // Translate to the center of the rectangle
      ctx.translate(
        (element.rect.left + element.rect.width / 2) * scale,
        (element.rect.top + element.rect.height / 2) * scale
      );

      // Rotate if rotation is defined
      if (element.rotation) {
        ctx.rotate((element.rotation * Math.PI) / 180);
      }

      // Draw a dashed line with an outer margin
      ctx.setLineDash([10, 5]); // Set the dashed line pattern
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (-element.rect.width / 2 - margin) * scale,
        (-element.rect.height / 2 - margin) * scale,
        (element.rect.width + 2 * margin) * scale,
        (element.rect.height + 2 * margin) * scale
      );
      ctx.setLineDash([]); // Reset the line style

      // Restore the context state
      ctx.restore();
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
  ground: HTMLDivElement | null;
  elements: DesignElement[];
  scale?: number;
}

export const drawAllDesignElements = ({
  ctx,
  ground,
  elements,
  scale = 1,
}: DrawAllDesignElementsProps) => {
  // clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  elements.forEach((element) => {
    if (element.type === DesignType.background) {
      if (ground) {
        ground.style.background = element.color;
      }
    } else {
      drawDesignElement(ctx, element, scale);
    }
  });
};
