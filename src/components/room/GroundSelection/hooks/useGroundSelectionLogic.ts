import { useRef, useCallback } from "react";
import { Rectangle } from "@/lib/canvas/types";
import { coordinateIsInsideRect } from "@/lib/mouse-position";
import { useDebounce } from "@/hooks/useDebounce";
import { ChangeCoordinatesParams } from "../../RoomCreat";
import { useRoomContext } from "../../RoomProvider";
import { Mode } from "../../types";

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
  clearTemporaryCanvas: () => void,
  drawAxe: () => void,
  selectZone: (rect: DOMRect | null) => void
) => {
  const isSelectingRef = useRef(false);
  const startPos = useRef<Position | null>(null);
  const areaOffsetRef = useRef<Position | null>(null);
  const itemSelectedRef = useRef(false);
  const previousPosition = useRef<Position | null>(null);

  const { getScale, getRotation } = useRoomContext();

  const getOffsetX = useCallback(() => {
    if (!groundRef.current) return 0;
    return (
      groundRef.current.scrollLeft -
      groundRef.current.getBoundingClientRect().left
    );
  }, []);

  const getOffsetY = useCallback(() => {
    if (!groundRef.current) return 0;
    return (
      groundRef.current.scrollTop -
      groundRef.current.getBoundingClientRect().top
    );
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
      startPos.current = {
        left: clientX + getOffsetX(),
        top: clientY + getOffsetY(),
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
    [onSelectionStart, getOffsetX, getOffsetY, setSelectedRect]
  );

  const debounceDrawAxe = useDebounce(drawAxe, 500);

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
    [getScale, changeCoordinates]
  );

  const debouncedSetSelectedRect = useDebounce(
    (rect: { left: number; top: number; width: number; height: number }) => {
      setSelectedRect(rect);
    },
    300
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number, mode: string | null = Mode.create) => {
      if (!groundRef.current || !containerRef.current) return false;

      if (areaOffsetRef.current) {
        // move container
        if (
          mode !== Mode.create &&
          mode !== Mode.draw &&
          mode !== Mode.settings
        ) {
          return false;
        }
        const newLeft = Math.round(clientX + areaOffsetRef.current.left);
        const newTop = Math.round(clientY + areaOffsetRef.current.top);

        moveItems(clientX, clientY);

        containerRef.current.style.left = `${newLeft}px`;
        containerRef.current.style.top = `${newTop}px`;

        debouncedSetSelectedRect({
          left: newLeft,
          top: newTop,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });

        clearTemporaryCanvas();
        if (getRotation() === 0) {
          debounceDrawAxe();
        }

        return true;
      }

      // select first corner of the container
      if (isSelectingRef.current && startPos.current) {
        const endLeft = clientX + getOffsetX();
        const endTop = clientY + getOffsetY();

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
    [changeCoordinates, getOffsetX, getOffsetY]
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
    getOffsetX,
    getOffsetY,
    debouncedSetSelectedRect,
  };
};
