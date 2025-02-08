import { useRef, useCallback } from "react";
import { Rectangle } from "@/lib/canvas/types";
import { coordinateIsInsideRect } from "@/lib/mouse-position";
import { ChangeCoordinatesParams } from "../../RoomCreat";
import { useRoomContext } from "../../RoomProvider";
import { Mode } from "../../types";
import { Coordinate } from "@/lib/canvas/types";
import { debounceThrottle, debounce } from "@/lib/utils/debounce";

interface Position {
  left: number;
  top: number;
}

export const useGroundSelectionLogic = (
  groundRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  onSelectionStart: () => void,
  changeCoordinates: (params: ChangeCoordinatesParams) => void,
  setSelectedRect: (rect: Rectangle | null) => void,
  setShowAlignmentLines: (show: boolean) => void,
  clearTemporaryCanvas: (reason?: string) => void,
  drawAxe: () => void,
  selectZone: (rect: DOMRect | null) => void
) => {
  const isSelectingRef = useRef(false);
  const startPos = useRef<Position | null>(null);
  const areaOffsetRef = useRef<Position | null>(null);
  const itemSelectedRef = useRef(false);
  const previousPosition = useRef<Position | null>(null);

  const { getScale, getRotation } = useRoomContext();

  const getOffset: () => Coordinate = useCallback(() => {
    if (!groundRef.current) return { x: 0, y: 0 };

    const rect = groundRef.current.getBoundingClientRect();
    const { left, top } = rect;

    return {
      x: groundRef.current.scrollLeft - left,
      y: groundRef.current.scrollTop - top,
    };
  }, []);

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!groundRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      previousPosition.current = {
        left: clientX,
        top: clientY,
      };

      if (coordinateIsInsideRect({ x: clientX, y: clientY }, containerRect)) {
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
      const offset = getOffset();
      startPos.current = {
        left: clientX + offset.x,
        top: clientY + offset.y,
      };

      setSelectedRect(null);

      containerRef.current.style.display = "block";
      containerRef.current.style.left = `${clientX}px`;
      containerRef.current.style.top = `${clientY}px`;
      containerRef.current.style.width = "0px";
      containerRef.current.style.height = "0px";

      setShowAlignmentLines(false);
      return false;
    },
    [onSelectionStart, getOffset, setSelectedRect]
  );

  const debouncedSetSelectedRect = debounceThrottle(
    (rect: { left: number; top: number; width: number; height: number }) => {
      setSelectedRect(rect);
    },
    50,
    100
  );

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
    if (areaOffsetRef.current && containerRef.current) {
      const newLeft = Math.round(clientX + areaOffsetRef.current.left);
      const newTop = Math.round(clientY + areaOffsetRef.current.top);

      moveItems(clientX, clientY);

      containerRef.current.style.left = `${newLeft}px`;
      containerRef.current.style.top = `${newTop}px`;

      setSelectedRect({
        left: newLeft,
        top: newTop,
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }
  };

  const debouncedMoveItems = debounceThrottle(debounceMoveItems, 50, 100);

  const handleMove = useCallback(
    (clientX: number, clientY: number, mode: string | null = Mode.create) => {
      if (!groundRef.current || !containerRef.current || mode === Mode.draw)
        return false;

      if (areaOffsetRef.current) {
        // move container
        if (mode !== Mode.create && mode !== Mode.settings) {
          return false;
        }

        debouncedMoveItems(clientX, clientY);

        clearTemporaryCanvas("moveItems");
        if (getRotation() === 0) {
          debounceDrawAxe();
        }

        return true;
      }

      // select first corner of the container
      if (isSelectingRef.current && startPos.current) {
        const offset = getOffset();
        const endLeft = clientX + offset.x;
        const endTop = clientY + offset.y;

        const width = Math.abs(Math.round(endLeft - startPos.current.left));
        const height = Math.abs(Math.round(endTop - startPos.current.top));
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.height = `${height}px`;
        containerRef.current.style.left = `${Math.round(
          Math.min(startPos.current.left, endLeft)
        )}px`;
        containerRef.current.style.top = `${Math.round(
          Math.min(startPos.current.top, endTop)
        )}px`;

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
    [getOffset]
  );

  const handleEnd = useCallback(() => {
    isSelectingRef.current = false;
    areaOffsetRef.current = null;

    if (!containerRef.current) {
      selectZone(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) {
      // too small act like a end of selection
      containerRef.current.style.display = "none";
      selectZone(null);
      return;
    }

    if (itemSelectedRef.current) {
      return;
    }

    selectZone(rect);

    itemSelectedRef.current = true;
  }, [containerRef, selectZone]);

  return {
    handleStart,
    handleMove,
    handleEnd,
    isSelectingRef,
    startPos,
    areaOffsetRef,
    itemSelectedRef,
    previousPosition,
    getOffset,
    debouncedSetSelectedRect,
  };
};
