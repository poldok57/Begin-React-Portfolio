import { Rectangle, RectPosition } from "@/lib/canvas/types";
import { TableData } from "../types";
export interface TableWithRect extends TableData {
  domRectangle: Rectangle;
}

export const MARGIN = 10;

export const getElementById = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return null;
  const rect: Rectangle = {
    left: element.offsetLeft,
    top: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
  return rect;
};

export const getAngle = (
  firstTable: RectPosition | Rectangle,
  secondTable: RectPosition | Rectangle
) => {
  const dx = secondTable.left - firstTable.left;
  const dy = secondTable.top - firstTable.top;
  return Math.atan2(dy, dx) * (180 / Math.PI); // Convertir en degrés
};

const getAngleVertex = (
  center: RectPosition | Rectangle,
  firstTable: RectPosition | Rectangle,
  secondTable: RectPosition | Rectangle
) => {
  const angle1 = getAngle(center, firstTable);
  const angle2 = getAngle(center, secondTable);
  return angle2 - angle1;
};

const showAngleVertex = (
  point: RectPosition | Rectangle,
  ctx?: CanvasRenderingContext2D | null
) => {
  if (!ctx) {
    return;
  }
  // Draw a cross at the right angle vertex
  ctx.beginPath();
  ctx.strokeStyle = "rgba(250, 90, 90, 0.8)";
  ctx.lineWidth = 3;

  const crossSize = 12;
  const x = point.left;
  const y = point.top;

  ctx.moveTo(x - crossSize, y - crossSize);
  ctx.lineTo(x + crossSize, y + crossSize);

  ctx.moveTo(x - crossSize, y + crossSize);
  ctx.lineTo(x + crossSize, y - crossSize);

  ctx.stroke();
};
/**
 * Function to check if a triangle is a right triangle and return the right angle vertex
 * @param {RectPosition | Rectangle} pointA - First vertex of the triangle
 * @param {RectPosition | Rectangle} pointB - Second vertex of the triangle
 * @param {RectPosition | Rectangle} pointC - Third vertex of the triangle
 * @returns {RectPosition | Rectangle | null} - The vertex corresponding to the right angle or null if not a right triangle
 */
export const getRightAngleVertex = (
  pointA: RectPosition | Rectangle,
  pointB: RectPosition | Rectangle,
  pointC: RectPosition | Rectangle,
  ctx?: CanvasRenderingContext2D | null
): RectPosition | Rectangle | null => {
  const angleAB = getAngleVertex(pointA, pointB, pointC);

  // Check if any of the angles is approximately 90 degrees (with a margin of error of 5 degrees)
  if (Math.abs(Math.abs(angleAB % 180) - 90) <= 5) {
    showAngleVertex(pointA, ctx);
    return pointA;
  }
  const angleBC = getAngleVertex(pointB, pointC, pointA);

  if (Math.abs(Math.abs(angleBC % 180) - 90) <= 5) {
    showAngleVertex(pointB, ctx);
    return pointB;
  }
  const angleCA = getAngleVertex(pointC, pointA, pointB);

  if (Math.abs(Math.abs(angleCA % 180) - 90) <= 5) {
    showAngleVertex(pointC, ctx);
    return pointC;
  }

  console.log("No right angle vertex found", angleAB, angleBC, angleCA);

  return null;
};

export const calculateFourthAngle = (
  pointA: RectPosition | Rectangle,
  pointB: RectPosition | Rectangle,
  pointC: RectPosition | Rectangle,
  ctx?: CanvasRenderingContext2D | null
): Rectangle | null => {
  const rightAngleVertex = getRightAngleVertex(pointA, pointB, pointC, ctx);

  if (!rightAngleVertex) {
    return null; // It's not a right triangle
  }

  // Find the other two vertices
  const otherVertices = [pointA, pointB, pointC].filter(
    (point) => point !== rightAngleVertex
  );
  const [vertex1, vertex2] = otherVertices;

  // Calculer la largeur et la hauteur pour le 4ème angle
  let width = 90;
  let height = 60;

  [pointA, pointB, pointC].forEach((point) => {
    if ("width" in point && "height" in point) {
      width = Math.max(width, point.width as number);
      height = Math.max(height, point.height as number);
    }
  });

  // Calculate the coordinates of the fourth angle
  const fourthAngle: Rectangle = {
    left: vertex2.left + (vertex1.left - rightAngleVertex.left),
    top: vertex2.top + (vertex1.top - rightAngleVertex.top),
    width,
    height,
  };

  if (ctx) {
    // Dessiner un rectangle au niveau du 4ème angle
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 120, 60, 0.8)";
    ctx.fillStyle = "rgba(180, 90, 60, 0.4)";
    ctx.lineWidth = 3;

    const x = fourthAngle.left;
    const y = fourthAngle.top;

    ctx.rect(x, y, fourthAngle.width, fourthAngle.height);
    ctx.stroke();
    ctx.fill();
  }

  return fourthAngle;
};

export const getPerimeter = (
  firstTable: Rectangle,
  secondTable: Rectangle,
  thirdTable: Rectangle,
  fourthTable: Rectangle | null,
  ctx?: CanvasRenderingContext2D | null
) => {
  if (fourthTable === null) {
    fourthTable = { ...firstTable };
  }

  const left = Math.min(
    firstTable.left,
    secondTable.left,
    thirdTable.left,
    fourthTable.left
  );
  const top = Math.min(
    firstTable.top,
    secondTable.top,
    thirdTable.top,
    fourthTable.top
  );

  const right = Math.max(
    firstTable.left + firstTable.width,
    secondTable.left + secondTable.width,
    thirdTable.left + thirdTable.width,
    fourthTable.left +
      Math.max(
        firstTable.width,
        secondTable.width,
        thirdTable.width,
        fourthTable.width
      )
  );
  const bottom = Math.max(
    firstTable.top + firstTable.height,
    secondTable.top + secondTable.height,
    thirdTable.top + thirdTable.height,
    fourthTable.top +
      Math.max(
        firstTable.height,
        secondTable.height,
        thirdTable.height,
        fourthTable.height
      )
  );
  const width = right - left;
  const height = bottom - top;
  if (ctx) {
    // Afficher le périmètre sur le canvas
    ctx.beginPath();
    ctx.strokeStyle = "rgba(90, 90, 250, 0.5)";
    ctx.setLineDash([5, 5]); // Ajoute un style de ligne pointillée
    ctx.lineWidth = 2;
    ctx.rect(
      left - MARGIN,
      top - MARGIN,
      width + MARGIN * 2,
      height + MARGIN * 2
    );
    ctx.stroke();
  }

  return { left, top, right, bottom, width, height };
};

export const selectTablesInRect = (
  rect: Rectangle,
  tables: TableData[]
): TableWithRect[] => {
  const rectRight = rect.right ?? rect.left + rect.width;
  const rectBottom = rect.bottom ?? rect.top + rect.height;

  const selectedTablesWithRect: TableWithRect[] = tables
    .map((table) => {
      const tableDiv = getElementById(table.id);
      if (!tableDiv) return null;

      const tableCenterX = tableDiv.left + tableDiv.width / 2;
      const tableCenterY = tableDiv.top + tableDiv.height / 2;

      const tableWithDomRect: TableWithRect = {
        ...table,
        domRectangle: tableDiv,
      };

      // check if the table is in the rectangle
      const isInRect =
        tableCenterX >= rect.left &&
        tableCenterX <= rectRight &&
        tableCenterY >= rect.top &&
        tableCenterY <= rectBottom;

      return isInRect ? tableWithDomRect : null;
    })
    .filter((table): table is TableWithRect => table !== null);

  return selectedTablesWithRect;
};

export const virtualTurningTables = ({
  tables,
  rect,
  angle,
  ctx,
}: {
  tables: TableWithRect[];
  rect: Rectangle;
  angle: number;
  ctx?: CanvasRenderingContext2D | null;
}) => {
  if (Math.abs(angle) > 45 && Math.abs(angle) < 90) {
    console.log("Turn angle original :", angle);
    angle = angle < 0 ? 90 + angle : -90 + angle;
  }

  console.log("Turn angle :", angle);

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const cos = Math.cos((angle * Math.PI) / 180);
  const sin = Math.sin((angle * Math.PI) / 180);

  const selectedTables = tables;

  selectedTables.forEach((table) => {
    const tableDiv = table.domRectangle ?? getElementById(table.id);
    if (!tableDiv) return;
    const halfWidth = tableDiv.width / 2;
    const halfHeight = tableDiv.height / 2;
    const tableCenterX = tableDiv.left + halfWidth;
    const tableCenterY = tableDiv.top + halfHeight;
    const dx = tableCenterX - centerX;
    const dy = tableCenterY - centerY;

    const newPosition = {
      left: Math.round(centerX + (dx * cos - dy * sin) - halfWidth),
      top: Math.round(centerY + (dx * sin + dy * cos) - halfHeight),
      width: tableDiv.width,
      height: tableDiv.height,
    };
    table.domRectangle = newPosition;
    // Draw the virtual position of the table on the temporary canvas (ctxTemporary)
    if (ctx) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
      ctx.fillStyle = "rgba(125, 125, 255, 0.2)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.rect(
        newPosition.left,
        newPosition.top,
        newPosition.width,
        newPosition.height
      );
      ctx.stroke();
      ctx.fill();
      ctx.setLineDash([]);
    }
  });
};

export const clearCanvas = (ctx: CanvasRenderingContext2D | null) => {
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
};
