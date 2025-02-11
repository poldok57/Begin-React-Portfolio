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
  containerRef: React.RefObject<HTMLDivElement>,
  onSelectionStart: () => void,
  changeCoordinates: (params: ChangeCoordinatesParams) => void,
  setSelectedRect: (rect: Rectangle | null) => void,
  setShowAlignmentLines: (show: boolean) => void,
  drawAxe: () => void,
  selectZone: (rect: Rectangle | null) => void
) => {
  const isSelectingRef = useRef(false);
  const startPos = useRef<Position | null>(null);

  const areaOffsetRef = useRef<Position | null>(null);
  const itemSelectedRef = useRef(false);
  const previousPosition = useRef<Position | null>(null);

  const { getScale, getRotation, clearTemporaryCanvas } = useRoomContext();

  const getGroundOffset: () => Coordinate = useCallback(() => {
    if (!groundRef.current) return { x: 0, y: 0 };

    const rect = groundRef.current.getBoundingClientRect();
    const { left, top } = rect;

    return {
      x: groundRef.current.scrollLeft - left,
      y: groundRef.current.scrollTop - top,
    };
  }, []);

  const moveContainer = (
    rect: { top: number; left: number; width?: number; height?: number } | null
  ) => {
    if (!containerRef.current) return;

    if (!rect) {
      containerRef.current.style.display = "none";
      return;
    }

    const style = containerRef.current.style;

    style.left = `${rect.left}px`;
    style.top = `${rect.top}px`;
    if (rect.width !== undefined) {
      style.width = `${rect.width}px`;
    }

    if (rect.height !== undefined) {
      style.height = `${rect.height}px`;
    }
    style.display = "block";
  };

  const getContainerRect: () => Rectangle = () => {
    if (!containerRef.current)
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };
    const rect = containerRef.current.getBoundingClientRect();
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
    if (!containerRef.current) return { inOverlap: false, inContainer: false };

    const containerRect = getContainerRect();
    const right =
      containerRect.right ?? containerRect.left + containerRect.width;
    const bottom =
      containerRect.bottom ?? containerRect.top + containerRect.height;

    const inOverlap =
      x >= containerRect.left - LINE_OVERLAP &&
      x <= right + LINE_OVERLAP &&
      y >= containerRect.top - LINE_OVERLAP &&
      y <= bottom + LINE_OVERLAP;

    if (!inOverlap) {
      return { inOverlap: false, inContainer: false };
    }
    const inContainer =
      x >= containerRect.left &&
      x <= right &&
      y >= containerRect.top &&
      y <= bottom;
    return { inOverlap, inContainer };
  };

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      const containerRect = getContainerRect();

      if (!containerRect) return false;
      previousPosition.current = {
        left: clientX,
        top: clientY,
      };

      if (
        containerRef.current &&
        coordinateIsInsideRect({ x: clientX, y: clientY }, containerRect)
      ) {
        //  console.log("clic inside the container");

        // Clic inside the container start moving the container
        areaOffsetRef.current = {
          left: containerRef.current.offsetLeft - clientX,
          top: containerRef.current.offsetTop - clientY,
        };

        onSelectionStart();
        return true;
      }

      isSelectingRef.current = true;
      itemSelectedRef.current = false;
      const offset = getGroundOffset();
      startPos.current = {
        left: clientX + offset.x,
        top: clientY + offset.y,
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

      changeCoordinates({ offset });
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
      const { width, height } = getContainerRect();

      setSelectedRect({
        left: newLeft,
        top: newTop,
        width: width,
        height: height,
      });
    }
  };

  const debouncedMoveItems = debounceThrottle(debounceMoveItems, 50, 100);

  const handleMove = useCallback(
    (clientX: number, clientY: number, mode: string | null = Mode.create) => {
      if (!groundRef.current || mode === Mode.draw) return false;

      if (areaOffsetRef.current) {
        // move container
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

      // select first corner of the container
      if (isSelectingRef.current && startPos.current) {
        const offset = getGroundOffset();
        const endLeft = clientX + offset.x;
        const endTop = clientY + offset.y;

        const width = Math.abs(Math.round(endLeft - startPos.current.left));
        const height = Math.abs(Math.round(endTop - startPos.current.top));
        moveContainer({
          left: Math.round(Math.min(startPos.current.left, endLeft)),
          top: Math.round(Math.min(startPos.current.top, endTop)),
          width: width,
          height: height,
        });

        debouncedSetSelectedRect({
          left: Math.round(Math.min(startPos.current.left, endLeft)),
          top: Math.round(Math.min(startPos.current.top, endTop)),
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
    isSelectingRef.current = false;
    areaOffsetRef.current = null;
    const rect = getContainerRect();

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

    if (itemSelectedRef.current) {
      return;
    }

    selectZone(rect);

    itemSelectedRef.current = true;
  }, [selectZone]);

  return {
    isInOverlapContainer,
    moveContainer,
    getContainerRect,
    handleStart,
    handleMove,
    handleEnd,
    isSelectingRef,
    startPos,
    areaOffsetRef,
    itemSelectedRef,
    previousPosition,
    getGroundOffset,
    debouncedSetSelectedRect,
  };
};
