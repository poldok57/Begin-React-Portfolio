import { useRef, useCallback } from "react";
import { ChangeCoordinatesParams } from "../../RoomCreat";
import { MARGIN } from "../../scripts/table-numbers";
import { useRoomContext } from "../../RoomProvider";

interface AxisLine {
  type: "vertical" | "horizontal";
  position: number;
}

interface AxisGroup {
  position: number;
  elements: HTMLDivElement[];
}

const TOLERANCE = 6;
const LINE_OVERLAP = 30;

export const useAlignmentLogic = (
  groundRef: React.RefObject<HTMLDivElement>,
  temporaryCanvasRef: React.RefObject<HTMLCanvasElement>,
  changeCoordinates: (params: ChangeCoordinatesParams) => void
) => {
  const verticalAxis = useRef<number[]>([]);
  const horizontalAxis = useRef<number[]>([]);
  const selectedAlignmentLine = useRef<AxisLine | null>(null);
  const alignmentGroups = useRef<{
    vertical: AxisGroup[];
    horizontal: AxisGroup[];
  }>({ vertical: [], horizontal: [] });

  const { getRotation, getScale } = useRoomContext();

  const getOffsetX = () => {
    if (!groundRef.current) {
      return 0;
    }
    return (
      groundRef.current.scrollLeft -
      groundRef.current.getBoundingClientRect().left
    );
  };
  const getOffsetY = () => {
    if (!groundRef.current) return 0;
    return (
      groundRef.current.scrollTop -
      groundRef.current.getBoundingClientRect().top
    );
  };
  const lastContainerRect = useRef<DOMRect | null>(null);

  const elementsInContainer = useRef<HTMLDivElement[]>([]);

  const findElementsInContainer = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      lastContainerRect.current = containerRect;

      if (!containerRect || !groundRef.current) return null;

      const children = Array.from(groundRef.current.children);

      const isInContainer = (rect: DOMRect) => {
        return (
          rect.left >= containerRect.left - MARGIN &&
          rect.right <= containerRect.right + MARGIN &&
          rect.top >= containerRect.top - MARGIN &&
          rect.bottom <= containerRect.bottom + MARGIN
        );
      };

      elementsInContainer.current = children.filter(
        (child): child is HTMLDivElement => {
          return (
            child instanceof HTMLDivElement &&
            child !== container &&
            isInContainer(child.getBoundingClientRect())
          );
        }
      );
    },
    [lastContainerRect.current]
  );

  const findAlignments = () => {
    alignmentGroups.current = { vertical: [], horizontal: [] };
    elementsInContainer.current.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Alignement vertical
      const foundVerticalGroup = alignmentGroups.current.vertical.find(
        (group) =>
          rect.left + TOLERANCE < group.position &&
          rect.right - TOLERANCE > group.position
      );

      if (foundVerticalGroup) {
        foundVerticalGroup.elements.push(el);
        foundVerticalGroup.position =
          foundVerticalGroup.elements.reduce((sum, groupEl) => {
            const groupRect = groupEl.getBoundingClientRect();
            return sum + (groupRect.left + groupRect.width / 2);
          }, 0) / foundVerticalGroup.elements.length;
      } else {
        alignmentGroups.current.vertical.push({
          position: centerX,
          elements: [el],
        });
      }
      // Alignement horizontal
      const foundHorizontalGroup = alignmentGroups.current.horizontal.find(
        (group) =>
          rect.top + TOLERANCE < group.position &&
          rect.bottom - TOLERANCE > group.position
      );
      if (foundHorizontalGroup) {
        foundHorizontalGroup.elements.push(el);
        foundHorizontalGroup.position =
          foundHorizontalGroup.elements.reduce((sum, groupEl) => {
            const groupRect = groupEl.getBoundingClientRect();
            return sum + (groupRect.top + groupRect.height / 2);
          }, 0) / foundHorizontalGroup.elements.length;
      } else {
        alignmentGroups.current.horizontal.push({
          position: centerY,
          elements: [el],
        });
      }
    });

    verticalAxis.current = alignmentGroups.current.vertical
      .filter((group) => group.elements.length > 1)
      .map((group) => group.position);
    horizontalAxis.current = alignmentGroups.current.horizontal
      .filter((group) => group.elements.length > 1)
      .map((group) => group.position);

    return {
      vertical: verticalAxis.current.length,
      horizontal: horizontalAxis.current.length,
    };
  };

  const drawAlignmentLines = useCallback(
    (containerRect: DOMRect | null) => {
      if (!temporaryCanvasRef.current || !groundRef.current) return;
      if (getRotation() !== 0) {
        return;
      }
      const offsetLeft = getOffsetX();
      const offsetTop = getOffsetY();

      // get container rect

      const ctx = temporaryCanvasRef.current.getContext("2d");
      if (!ctx || !containerRect) return;

      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([10, 5, 3, 5]);

      // Lignes verticales
      verticalAxis.current.forEach((x) => {
        // alignments.vertical.forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(
          x + offsetLeft,
          containerRect.top - LINE_OVERLAP + offsetTop
        );
        ctx.lineTo(
          x + offsetLeft,
          containerRect.bottom + LINE_OVERLAP + offsetTop
        );
        ctx.stroke();
      });

      // Lignes horizontales
      horizontalAxis.current.forEach((y) => {
        // alignments.horizontal.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(
          containerRect.left - LINE_OVERLAP + offsetLeft,
          y + offsetTop
        );
        ctx.lineTo(
          containerRect.right + LINE_OVERLAP + offsetLeft,
          y + offsetTop
        );
        ctx.stroke();
      });

      ctx.setLineDash([]);
    },
    [getRotation, getOffsetX, getOffsetY, getScale]
  );

  const moveVerticalLine = (index: number, mouseX: number) => {
    if (index < 0) return;
    verticalAxis.current[index] = mouseX;
    const group = alignmentGroups.current.vertical[index];
    if (group) {
      group.position = mouseX;
      const elementIds = group.elements.map((el) => el.id);
      changeCoordinates({
        position: { left: (mouseX + getOffsetX()) / getScale() },
        tableIds: elementIds,
      });
      if (selectedAlignmentLine.current) {
        selectedAlignmentLine.current.position = mouseX;
      }
    }
  };

  const moveHorizontalLine = (index: number, mouseY: number) => {
    if (index < 0) return;
    horizontalAxis.current[index] = mouseY;
    const group = alignmentGroups.current.horizontal[index];
    if (group) {
      group.position = mouseY;

      const elementIds = group.elements.map((el) => el.id);
      changeCoordinates({
        position: { top: (mouseY + getOffsetY()) / getScale() },
        tableIds: elementIds,
      });

      if (selectedAlignmentLine.current) {
        selectedAlignmentLine.current.position = mouseY;
      }
    }
  };

  const clicOnLine = useCallback(
    (mouseX: number, mouseY: number) => {
      if (getRotation() !== 0) {
        return false;
      }

      const indexV = verticalAxis.current.findIndex(
        (x) => Math.abs(x - mouseX) <= 5
      );
      // clic on a vertical line
      if (indexV !== -1) {
        const clickedVerticalLine = alignmentGroups.current.vertical[indexV];
        selectedAlignmentLine.current = {
          type: "vertical",
          position: clickedVerticalLine.position,
        };
        moveVerticalLine(indexV, mouseX);
        return true;
      }

      // clic on a horizontal line
      const indexH = horizontalAxis.current.findIndex(
        (y) => Math.abs(y - mouseY) <= 5
      );

      if (indexH !== -1) {
        const clickedHorizontalLine =
          alignmentGroups.current.horizontal[indexH];
        selectedAlignmentLine.current = {
          type: "horizontal",
          position: clickedHorizontalLine.position,
        };
        moveHorizontalLine(indexH, mouseY);
        return true;
      }
      return false;
    },
    [getRotation]
  );

  const moveLine = useCallback(
    (mouseX: number, mouseY: number) => {
      if (selectedAlignmentLine.current === null || getRotation() !== 0) {
        return false;
      }

      if (selectedAlignmentLine.current.type === "vertical") {
        const index = verticalAxis.current.findIndex(
          (x) => x === selectedAlignmentLine.current?.position
        );
        if (index !== -1) {
          moveVerticalLine(index, mouseX);
        }
      } else {
        const index = horizontalAxis.current.findIndex(
          (y) => y === selectedAlignmentLine.current?.position
        );
        if (index !== -1) {
          moveHorizontalLine(index, mouseY);
        }
      }

      // redraw alignment lines
      drawAlignmentLines(lastContainerRect.current);

      return true;
    },
    [getRotation, drawAlignmentLines, moveVerticalLine, moveHorizontalLine]
  );

  const stopMoveLine = () => {
    selectedAlignmentLine.current = null;
  };

  const equalizeSpaces = useCallback(
    (type: "vertical" | "horizontal") => {
      const axes =
        type === "vertical" ? verticalAxis.current : horizontalAxis.current;
      if (axes.length <= 2) return;

      // Trier les axes dans l'ordre croissant
      const sortedAxes = [...axes].sort((a, b) => a - b);

      const firstAxis = sortedAxes[0];
      const lastAxis = sortedAxes[sortedAxes.length - 1];
      const totalSpace = lastAxis - firstAxis;
      const equalSpace = totalSpace / (sortedAxes.length - 1);

      sortedAxes.forEach((currentAxis, index) => {
        const newPos = firstAxis + index * equalSpace;
        const roundedNewPos = Math.round(newPos);

        if (type === "vertical") {
          const originalIndex = verticalAxis.current.indexOf(currentAxis);
          moveVerticalLine(originalIndex, roundedNewPos);
        } else {
          const originalIndex = horizontalAxis.current.indexOf(currentAxis);
          moveHorizontalLine(originalIndex, roundedNewPos);
        }
      });

      drawAlignmentLines(lastContainerRect.current);
    },
    [getRotation, moveVerticalLine, moveHorizontalLine, drawAlignmentLines]
  );

  const cursorStyle = (
    mouseX: number,
    mouseY: number,
    isInOverlapContainer: boolean
  ) => {
    if (!temporaryCanvasRef.current || !groundRef.current) return;
    let cursorStyle = "default";

    if (getRotation() === 0) {
      const isNearVerticalLine = verticalAxis.current.some(
        (x) => Math.abs(x - mouseX) <= 5
      );
      const isNearHorizontalLine = horizontalAxis.current.some(
        (y) => Math.abs(y - mouseY) <= 5
      );

      if (isInOverlapContainer) {
        if (isNearVerticalLine) {
          cursorStyle = "ew-resize";
        } else if (isNearHorizontalLine) {
          cursorStyle = "ns-resize";
        }
      }
    }

    if (cursorStyle !== temporaryCanvasRef.current.style.cursor) {
      return cursorStyle;
    }
    return null;
  };
  return {
    alignmentGroups,
    // selectedAlignmentLine,
    findElementsInContainer,
    findAlignments,
    drawAlignmentLines,
    clicOnLine,
    moveLine,
    stopMoveLine,
    cursorStyle,
    equalizeSpaces,
  };
};
