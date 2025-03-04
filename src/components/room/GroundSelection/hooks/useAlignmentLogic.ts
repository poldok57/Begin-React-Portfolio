import { useRef, useCallback } from "react";
import { ChangeCoordinatesParams } from "../../RoomCreat";
import { MARGIN } from "../../scripts/table-numbers";
import { useRoomStore } from "@/lib/stores/room";
import { Mode } from "../../types";
import { Coordinate, Rectangle } from "@/lib/canvas/types";
import { debounceThrottle } from "@/lib/utils/debounce";
import { generateUniqueId } from "@/lib/utils/unique-id";

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

const traceAlignment = false;

interface AlignmentLogic {
  alignmentGroups: React.MutableRefObject<{
    vertical: AxisGroup[];
    horizontal: AxisGroup[];
  }>;
  findElementsInContainer: () => void;
  findAlignments: (mode: string | null) => {
    vertical: number;
    horizontal: number;
  };

  drawAlignmentLines: (containerRect: DOMRect | Rectangle | null) => void;
  clicOnLine: (mouseX: number, mouseY: number) => boolean;
  moveLine: (mouseX: number, mouseY: number) => boolean;
  stopMoveLine: () => void;
  cursorStyle: (
    mouseX: number,
    mouseY: number,
    isInOverlapContainer: boolean,
    isInContainer: boolean
  ) => string | null;
  equalizeSpaces: (type: "vertical" | "horizontal") => void;
}

export const useAlignmentLogic = (
  groundRef: React.RefObject<HTMLDivElement>,
  temporaryCanvasRef: React.RefObject<HTMLCanvasElement>,
  changeCoordinates: (params: ChangeCoordinatesParams) => void,
  getGroundOffset: () => Coordinate,
  getContainerRect: () => DOMRect | Rectangle | null,
  refreshContainer: (ctx?: CanvasRenderingContext2D) => void,
  uniqueIdRef: React.MutableRefObject<string | null>
): AlignmentLogic => {
  const selectedAlignmentLine = useRef<AxisLine | null>(null);
  const alignmentGroups = useRef<{
    vertical: AxisGroup[];
    horizontal: AxisGroup[];
  }>({ vertical: [], horizontal: [] });

  const { getRotation, getScale } = useRoomStore();

  const elementsInContainer = useRef<HTMLDivElement[]>([]);

  const localUniqueId = useRef<string | null>(null);

  const findElementsInContainer = useCallback(() => {
    if (!groundRef.current) return;
    // const containerRect = container.getBoundingClientRect();
    const containerRect = getContainerRect();
    if (!containerRect) return null;

    // console.log("containerRect", containerRect);

    const children = Array.from(groundRef.current.children);

    const isInContainer = (rect: DOMRect) => {
      const right =
        containerRect.right ?? containerRect.left + containerRect.width;
      const bottom =
        containerRect.bottom ?? containerRect.top + containerRect.height;
      const limitWidth = rect.width / 2 - MARGIN;
      const limitHeight = rect.height / 2 - MARGIN;

      // console.log("limits", limitWidth, limitHeight);

      return (
        rect.left + limitWidth >= containerRect.left &&
        rect.right - limitWidth <= right &&
        rect.top + limitHeight >= containerRect.top &&
        rect.bottom - limitHeight <= bottom
      );
    };

    elementsInContainer.current = children.filter(
      (child): child is HTMLDivElement => {
        return (
          child instanceof HTMLDivElement &&
          isInContainer(child.getBoundingClientRect())
        );
      }
    );
  }, [getContainerRect]);

  const findAlignments = (
    mode: string | null = Mode.create
  ): { vertical: number; horizontal: number } => {
    alignmentGroups.current = { vertical: [], horizontal: [] };
    if (mode !== Mode.create && mode !== Mode.settings) {
      return { vertical: 0, horizontal: 0 };
    }
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
            return Math.round(sum + (groupRect.left + groupRect.width / 2));
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
            return Math.round(sum + (groupRect.top + groupRect.height / 2));
          }, 0) / foundHorizontalGroup.elements.length;
      } else {
        alignmentGroups.current.horizontal.push({
          position: centerY,
          elements: [el],
        });
      }
    });
    if (traceAlignment) {
      console.log("vertical Group", alignmentGroups.current.vertical);
      console.log("horizontal Group", alignmentGroups.current.horizontal);
    }

    return {
      vertical: alignmentGroups.current.vertical.length,
      horizontal: alignmentGroups.current.horizontal.length,
    };
  };

  const drawAlignmentLines = useCallback(
    (
      containerRect: DOMRect | Rectangle | null,
      withClearTemporaryCanvas: boolean = false
    ) => {
      if (!temporaryCanvasRef.current || !groundRef.current) return;
      if (getRotation() !== 0) {
        return;
      }

      // get container rect

      const ctx = temporaryCanvasRef.current.getContext("2d");
      if (!ctx || !containerRect) return;

      ctx.globalAlpha = 1;
      if (withClearTemporaryCanvas) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        refreshContainer(ctx);
      }

      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([10, 5, 3, 5]);

      const bottom =
        containerRect.bottom ?? containerRect.top + containerRect.height;
      const right =
        containerRect.right ?? containerRect.left + containerRect.width;

      const offset = getGroundOffset();

      // Lignes verticales
      alignmentGroups.current.vertical.forEach((element) => {
        // alignments.vertical.forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(
          element.position + offset.x,
          containerRect.top - LINE_OVERLAP + offset.y
        );
        ctx.lineTo(
          element.position + offset.x,
          bottom + LINE_OVERLAP + offset.y
        );
        ctx.stroke();
      });

      // Lignes horizontales
      alignmentGroups.current.horizontal.forEach((element) => {
        // alignments.horizontal.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(
          containerRect.left - LINE_OVERLAP + offset.x,
          element.position + offset.y
        );
        ctx.lineTo(
          right + LINE_OVERLAP + offset.x,
          element.position + offset.y
        );
        ctx.stroke();
      });

      ctx.setLineDash([]);
    },
    [getRotation, getGroundOffset, getScale]
  );

  const drawAlignmentLinesDebounced = debounceThrottle(
    drawAlignmentLines,
    50,
    100
  );

  const moveVerticalLine = (index: number, mouseX: number) => {
    if (index < 0) return;
    // console.log("moveVerticalLine", index, mouseX);
    const group = alignmentGroups.current.vertical[index];
    if (group) {
      const offset = getGroundOffset();
      group.position = mouseX;
      const elementIds = group.elements.map((el) => el.id);
      changeCoordinates({
        position: { left: (mouseX + offset.x) / getScale() },
        tableIds: elementIds,
        uniqueId: uniqueIdRef.current ?? localUniqueId.current,
      });
      if (selectedAlignmentLine.current) {
        selectedAlignmentLine.current.position = mouseX;
      }
    }
  };

  const moveHorizontalLine = (index: number, mouseY: number) => {
    if (index < 0) return;
    const group = alignmentGroups.current.horizontal[index];
    if (group) {
      const offset = getGroundOffset();
      group.position = mouseY;

      const elementIds = group.elements.map((el) => el.id);
      changeCoordinates({
        position: { top: (mouseY + offset.y) / getScale() },
        tableIds: elementIds,
        uniqueId: uniqueIdRef.current ?? localUniqueId.current,
      });

      if (selectedAlignmentLine.current) {
        selectedAlignmentLine.current.position = mouseY;
      }
    }
  };

  const clicOnLine = useCallback(
    (mouseX: number, mouseY: number) => {
      if (
        getRotation() !== 0 ||
        (alignmentGroups.current.vertical.length === 0 &&
          alignmentGroups.current.horizontal.length === 0)
      ) {
        return false;
      }

      const indexV = alignmentGroups.current.vertical.findIndex(
        (x) => Math.abs(x.position - mouseX) < TOLERANCE
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
      const indexH = alignmentGroups.current.horizontal.findIndex(
        (y) => Math.abs(y.position - mouseY) < TOLERANCE
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
        const index = alignmentGroups.current.vertical.findIndex(
          (element) =>
            element.position === selectedAlignmentLine.current?.position
        );
        if (index !== -1) {
          moveVerticalLine(index, Math.round(mouseX));
        }
      } else {
        const index = alignmentGroups.current.horizontal.findIndex(
          (element) =>
            element.position === selectedAlignmentLine.current?.position
        );
        if (index !== -1) {
          moveHorizontalLine(index, Math.round(mouseY));
        }
      }

      // redraw alignment lines
      drawAlignmentLinesDebounced(getContainerRect(), true);

      return true;
    },
    [getRotation]
  );

  const stopMoveLine = () => {
    // Check minimum spacing between axes before stopping line movement
    if (selectedAlignmentLine.current) {
      const direction = selectedAlignmentLine.current.type;
      const axes =
        direction === "vertical"
          ? alignmentGroups.current.vertical
          : alignmentGroups.current.horizontal;

      // Sort axes by position
      const sortedAxes = [...axes].sort((a, b) => a.position - b.position);

      // Find current axis index in sorted array
      const currentAxisIndex = sortedAxes.findIndex(
        (axis) => axis.position === selectedAlignmentLine.current?.position
      );

      // Select direction
      const elements =
        direction === "vertical"
          ? alignmentGroups.current.vertical[currentAxisIndex].elements
          : alignmentGroups.current.horizontal[currentAxisIndex].elements;
      // Calculate minimum space based on average object size on the axis
      const minSpace =
        elements.reduce(
          (sum, el) => sum + el.getBoundingClientRect().width,
          0
        ) /
        (elements.length * 2);

      let newPosition = selectedAlignmentLine.current.position;

      // Check spacing with previous axis
      if (currentAxisIndex > 0) {
        const prevAxis = sortedAxes[currentAxisIndex - 1];
        if (newPosition - prevAxis.position < minSpace) {
          newPosition = prevAxis.position + minSpace;
        }
      }

      // Check spacing with next axis
      if (currentAxisIndex < sortedAxes.length - 1) {
        const nextAxis = sortedAxes[currentAxisIndex + 1];
        if (nextAxis.position - newPosition < minSpace) {
          newPosition = nextAxis.position - minSpace;
        }
      }

      // Apply position adjustment if needed
      if (newPosition !== selectedAlignmentLine.current.position) {
        const originalIndex = axes.findIndex(
          (axis) => axis.position === selectedAlignmentLine.current?.position
        );

        if (direction === "vertical") {
          moveVerticalLine(originalIndex, newPosition);
        } else {
          moveHorizontalLine(originalIndex, newPosition);
        }

        drawAlignmentLinesDebounced(getContainerRect(), true);
      }
    }

    selectedAlignmentLine.current = null;
  };

  const equalizeSpaces = useCallback(
    (type: "vertical" | "horizontal") => {
      // console.log("equalizeSpaces", type);
      const axes =
        type === "vertical"
          ? alignmentGroups.current.vertical
          : alignmentGroups.current.horizontal;
      if (axes.length <= 2) return;

      // Trier les axes dans l'ordre croissant
      const sortedAxes = [...axes].sort((a, b) => a.position - b.position);

      const firstAxis = sortedAxes[0];
      const lastAxis = sortedAxes[sortedAxes.length - 1];
      const totalSpace = lastAxis.position - firstAxis.position;
      const equalSpace = totalSpace / (sortedAxes.length - 1);

      sortedAxes.forEach((currentAxis, index) => {
        const newPos = firstAxis.position + index * equalSpace;
        const roundedNewPos = Math.round(newPos);

        localUniqueId.current = generateUniqueId("btn");
        if (type === "vertical") {
          const originalIndex =
            alignmentGroups.current.vertical.indexOf(currentAxis);
          moveVerticalLine(originalIndex, roundedNewPos);
        } else {
          const originalIndex =
            alignmentGroups.current.horizontal.indexOf(currentAxis);
          moveHorizontalLine(originalIndex, roundedNewPos);
        }
      });

      drawAlignmentLinesDebounced(getContainerRect(), true);
    },
    [getRotation]
  );

  const cursorStyle = (
    mouseX: number,
    mouseY: number,
    isInOverlapContainer: boolean,
    isInContainer: boolean
  ): string | null => {
    if (!temporaryCanvasRef.current || !groundRef.current) return null;
    let cursorStyle = "default";

    if (
      isInOverlapContainer &&
      (alignmentGroups.current.vertical.length > 0 ||
        alignmentGroups.current.horizontal.length > 0) &&
      getRotation() === 0
    ) {
      const isNearVerticalLine = alignmentGroups.current.vertical.some(
        (x) => Math.abs(x.position - mouseX) < TOLERANCE
      );
      const isNearHorizontalLine = alignmentGroups.current.horizontal.some(
        (y) => Math.abs(y.position - mouseY) < TOLERANCE
      );

      if (isInOverlapContainer) {
        if (isNearVerticalLine) {
          cursorStyle = "ew-resize";
        } else if (isNearHorizontalLine) {
          cursorStyle = "ns-resize";
        } else if (isInContainer) {
          cursorStyle = "move";
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
