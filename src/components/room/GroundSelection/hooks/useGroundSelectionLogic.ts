import { useRef, useCallback } from "react";
import { Rectangle } from "@/lib/canvas/types";
import { coordinateIsInsideRect } from "@/lib/mouse-position";
import { ChangeCoordinatesParams } from "../../RoomCreat";
import { useRoomContext } from "../../RoomProvider";
import { Mode } from "../../types";
import { Coordinate } from "@/lib/canvas/types";
import { debounceThrottle, debounce } from "@/lib/utils/debounce";
import { throttle } from "@/lib/utils/throttle";

interface Position {
  left: number;
  top: number;
}

const LINE_OVERLAP = 30;

export const useGroundSelectionLogic = (
  groundRef: React.RefObject<HTMLDivElement>,
  onSelectionStart: () => void,
  changeCoordinates: (params: ChangeCoordinatesParams) => void,
  setSelectedRect: (rect: Rectangle | null) => void,
  setShowAlignmentLines: (show: boolean) => void,
  drawAxe: () => void,
  selectZone: (rect: Rectangle | null) => void,
  uniqueIdRef: React.MutableRefObject<string | null>
) => {
  const startPos = useRef<Position | null>(null);

  const areaOffsetRef = useRef<Position | null>(null);
  const itemSelectedRef = useRef(false);
  const previousPosition = useRef<Position | null>(null);
  const showContainerRef = useRef(false);
  const containerRectRef = useRef<Rectangle | null>(null);

  const { getScale, getRotation, getCtxTemporary, clearTemporaryCanvas } =
    useRoomContext();

  const getGroundOffset: () => Coordinate = useCallback(() => {
    if (!groundRef.current) return { x: 0, y: 0 };

    const rect = groundRef.current.getBoundingClientRect();
    const { left, top } = rect;

    return {
      x: groundRef.current.scrollLeft - left,
      y: groundRef.current.scrollTop - top,
    };
  }, []);

  const refreshContainer = (ctx?: CanvasRenderingContext2D | null) => {
    if (!ctx) {
      ctx = getCtxTemporary();
      if (!ctx) {
        return;
      }
    }
    if (containerRectRef.current) {
      const rotation = getRotation();

      const rect = containerRectRef.current;
      // Draw a frame around the container (+2px)

      // Save context state
      ctx.save();

      // Translate to center of rectangle
      ctx.translate(rect.left + rect.width / 2, rect.top + rect.height / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.strokeStyle = "#0000aa";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      // Draw rotated rectangle
      ctx.strokeRect(
        -rect.width / 2,
        -rect.height / 2,
        rect.width,
        rect.height
      );
      ctx.setLineDash([]);
      ctx.fillStyle = "#e5e7eb33";
      ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);

      // Restore context state
      ctx.restore();
    }
  };

  const moveContainer = (
    rect: { top: number; left: number; width?: number; height?: number } | null
  ) => {
    if (!rect) {
      showContainerRef.current = false;
      containerRectRef.current = null;
      return;
    }

    showContainerRef.current = true;

    if (rect) {
      if (!containerRectRef.current) {
        containerRectRef.current = {
          left: rect.left,
          top: rect.top,
          width: rect.width ?? 0,
          height: rect.height ?? 0,
        };
      } else {
        containerRectRef.current = {
          ...containerRectRef.current,
          ...rect,
        };
      }
      clearTemporaryCanvas("moveContainer");
      refreshContainer();
    }
  };

  const getContainerRect: () => Rectangle | null = () => {
    let rect = null;

    const offset = getGroundOffset();
    if (containerRectRef.current) {
      rect = {
        ...containerRectRef.current,
        left: containerRectRef.current.left - offset.x,
        top: containerRectRef.current.top - offset.y,
      };
    }

    if (!rect) {
      return null;
    }

    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
    };
  };

  // container with overlap of LINE_OVERLAP return true if the point is in the container or in the overlap
  const isInOverlapContainer = (x: number, y: number) => {
    let showContainer = false;
    let inOverlap = false;
    let inContainer = false;

    if (showContainerRef.current) {
      const containerRect = getContainerRect();

      if (containerRect) {
        const right =
          containerRect.right ?? containerRect.left + containerRect.width;
        const bottom =
          containerRect.bottom ?? containerRect.top + containerRect.height;

        inOverlap =
          x >= containerRect.left - LINE_OVERLAP &&
          x <= right + LINE_OVERLAP &&
          y >= containerRect.top - LINE_OVERLAP &&
          y <= bottom + LINE_OVERLAP;

        if (inOverlap) {
          inContainer =
            x >= containerRect.left &&
            x <= right &&
            y >= containerRect.top &&
            y <= bottom;
        }
        showContainer = true;
      }
    }
    return { inOverlap, inContainer, showContainer };
  };

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      const containerRect = getContainerRect();

      previousPosition.current = {
        left: clientX,
        top: clientY,
      };

      if (
        containerRect &&
        coordinateIsInsideRect({ x: clientX, y: clientY }, containerRect)
      ) {
        //  console.log("clic inside the container");

        if (containerRectRef.current && groundRef.current) {
          // clic outside the container start moving the ground
          // const offset = getGroundOffset();
          areaOffsetRef.current = {
            left: containerRectRef.current.left - clientX,
            top: containerRectRef.current.top - clientY,
          };
        }

        onSelectionStart();
        return true;
      }

      itemSelectedRef.current = false;
      const offset = getGroundOffset();
      startPos.current = {
        left: Math.round(clientX + offset.x),
        top: Math.round(clientY + offset.y),
      };

      setSelectedRect(null);

      moveContainer({ left: clientX, top: clientY, width: 0, height: 0 });

      setShowAlignmentLines(false);
      return false;
    },
    [onSelectionStart, getGroundOffset, setSelectedRect]
  );

  const debouncedSetSelectedRect = debounceThrottle(
    (rect: { left: number; top: number; width: number; height: number }) => {
      setSelectedRect(rect);
    },
    50,
    100
  );

  const throttledClearTemporaryCanvas = throttle(clearTemporaryCanvas, 1000);
  const debounceDrawAxe = debounce(drawAxe, 500);

  const moveItems = useCallback(
    (clientX: number, clientY: number) => {
      const scale = getScale();
      const offset = previousPosition.current
        ? {
            left: (clientX - previousPosition.current.left) / scale,
            top: (clientY - previousPosition.current.top) / scale,
          }
        : {
            left: 0,
            top: 0,
          };
      previousPosition.current = {
        left: clientX,
        top: clientY,
      };

      changeCoordinates({ offset, uniqueId: uniqueIdRef.current });
    },
    [getScale]
  );

  const debounceMoveItems = (clientX: number, clientY: number) => {
    if (areaOffsetRef.current) {
      const newLeft = Math.round(clientX + areaOffsetRef.current.left);
      const newTop = Math.round(clientY + areaOffsetRef.current.top);

      moveItems(clientX, clientY);

      moveContainer({
        left: newLeft,
        top: newTop,
      });

      const rect = getContainerRect();
      if (rect) {
        const { width, height } = rect;

        setSelectedRect({
          left: newLeft,
          top: newTop,
          width: width,
          height: height,
        });
      }
    }
  };

  const debouncedMoveItems = debounceThrottle(debounceMoveItems, 50, 100);

  const handleMove = useCallback(
    (clientX: number, clientY: number, mode: string | null = Mode.create) => {
      if (!groundRef.current || mode === Mode.draw) return false;

      if (areaOffsetRef.current) {
        // container is defined so we can move it
        if (mode !== Mode.create && mode !== Mode.settings) {
          return false;
        }

        debouncedMoveItems(clientX, clientY);

        if (getRotation() === 0) {
          throttledClearTemporaryCanvas("moveItems");
          debounceDrawAxe();
        }

        return true;
      }

      // First corner is defined so we can define the opposite corner
      if (startPos.current) {
        const offset = getGroundOffset();
        const endLeft = Math.round(clientX + offset.x);
        const endTop = Math.round(clientY + offset.y);

        const width = Math.abs(Math.round(endLeft - startPos.current.left));
        const height = Math.abs(Math.round(endTop - startPos.current.top));

        moveContainer({
          left: Math.min(startPos.current.left, endLeft),
          top: Math.min(startPos.current.top, endTop),
          width: width,
          height: height,
        });

        debouncedSetSelectedRect({
          left: Math.min(startPos.current.left, endLeft),
          top: Math.min(startPos.current.top, endTop),
          width: width,
          height: height,
        });
        return true;
      }
      return false;
    },
    [getGroundOffset]
  );

  const handleEnd = useCallback(() => {
    startPos.current = null;
    areaOffsetRef.current = null;

    let rect: Rectangle | null = null;
    rect = getContainerRect();

    if (!rect) {
      selectZone(null);
      return;
    }

    if (rect.width < 10 || rect.height < 10) {
      // too small act like a end of selection
      moveContainer(null);
      selectZone(null);
      return;
    }

    if (!itemSelectedRef.current) {
      selectZone(rect);
      itemSelectedRef.current = true;
    }
  }, [selectZone]);

  return {
    isInOverlapContainer,
    moveContainer,
    refreshContainer,
    getContainerRect,
    getGroundOffset,
    handleStart,
    handleMove,
    handleEnd,
  };
};
