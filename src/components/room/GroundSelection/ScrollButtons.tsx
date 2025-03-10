import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCwSquare,
  RotateCcwSquare,
} from "lucide-react";

import { useRoomStore } from "@/lib/stores/room";
import { zustandDesignStore } from "@/lib/stores/design";
import { zustandTableStore } from "@/lib/stores/tables";

import { cn } from "@/lib/utils/cn";
import { roundToTwoDigits } from "@/lib/utils/number";
import { getProgressiveStep } from "@/lib/utils/progressive-step";

interface ScrollButtonsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isWorking: boolean;
  isTouchDevice: boolean;
  scale: number;
  setScale: (scale: number) => void;
  needRefreshCanvas: () => void;
}

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  containerRef,
  isWorking,
  isTouchDevice = true,
  scale,
  setScale,
  needRefreshCanvas,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [canScroll, setCanScroll] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const scrollAmount = 100;
  let hideTimeout: NodeJS.Timeout;

  // components stores
  const { designStoreName, tablesStoreName } = useRoomStore();
  const designStoreRef = useRef(zustandDesignStore(designStoreName));
  const tablesStoreRef = useRef(zustandTableStore(tablesStoreName));

  useEffect(() => {
    designStoreRef.current = zustandDesignStore(designStoreName);
    tablesStoreRef.current = zustandTableStore(tablesStoreName);
  }, [designStoreName, tablesStoreName]);

  // Zoom gesture state
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);

  // get the progressive step
  const progressiveStep = useMemo(() => getProgressiveStep(10, 150), []);

  // move all elements
  const moveAllElements = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      const designStore = designStoreRef.current.getState();
      const tablesStore = tablesStoreRef.current.getState();

      // use the calculated step
      const step = progressiveStep(direction);

      const offset = {
        x: 0,
        y: 0,
      };
      switch (direction) {
        case "left":
          offset.x = -step;
          break;
        case "right":
          offset.x = step;
          break;
        case "up":
          offset.y = -step;
          break;
        case "down":
          offset.y = step;
          break;
      }

      designStore.moveAllDesignElements(offset);
      tablesStore.moveAllTables(offset);
    },
    [progressiveStep]
  );

  const rotateAllElements = useCallback(
    (direction: "left" | "right") => {
      const designStore = designStoreRef.current.getState();
      const tablesStore = tablesStoreRef.current.getState();

      const tables = tablesStore.getAllTables();
      const designs = designStore.getAllDesignElements();

      // if no element, do nothing
      if (tables.length === 0 && designs.length === 0) {
        return;
      }

      // calculate the current limits of all elements (tables + designs)
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      // analyze the tables
      tables.forEach((table) => {
        const { center } = table;
        const size = table.size ?? 200;
        const halfSize = size / 2;

        // adjust the limits based on the center and the size
        minX = Math.min(minX, center.x - halfSize);
        maxX = Math.max(maxX, center.x + halfSize);
        minY = Math.min(minY, center.y - halfSize);
        maxY = Math.max(maxY, center.y + halfSize);
      });

      // analyze the designs
      designs.forEach((design) => {
        const { center, size, rotation = 0 } = design;
        const { width, height } = size;

        // determine the effective dimensions based on the rotation
        const isRotated = rotation % 180 !== 0;
        const halfWidth = (isRotated ? height : width) / 2;
        const halfHeight = (isRotated ? width : height) / 2;

        // adjust the limits based on the center and the dimensions
        minX = Math.min(minX, center.x - halfWidth);
        maxX = Math.max(maxX, center.x + halfWidth);
        minY = Math.min(minY, center.y - halfHeight);
        maxY = Math.max(maxY, center.y + halfHeight);
      });

      // calculate the current dimensions
      const currentWidth = maxX - minX;
      const currentHeight = maxY - minY;

      // calculate the center of the page
      const centerX = minX + currentWidth / 2;
      const centerY = minY + currentHeight / 2;

      // keep the margins of the elements, and calculate the new center of the page
      let newCenterX = minX + currentHeight / 2;
      let newCenterY = minY + currentWidth / 2;

      // if centerX is greater the window width, move the centerX in the center of the page
      if (centerX * scale > window.innerWidth || centerX < 0) {
        newCenterX = window.innerWidth / 2;
        console.log(
          " move the centerX in the center of the page: ",
          newCenterX
        );
      }

      // if centerY is greater the window height, move the centerY in the center of the page
      if (centerY * scale > window.innerHeight || centerY < 0) {
        newCenterY = window.innerHeight / 2;
        console.log(
          " move the centerY in the center of the page: ",
          newCenterY
        );
      }

      // rotation angle (90° or -90°)
      const rotationAngle = direction === "right" ? 90 : -90;
      const radians = (rotationAngle * Math.PI) / 180;
      const cosAngle = Math.cos(radians);
      const sinAngle = Math.sin(radians);

      // update the tables
      tables.forEach((table) => {
        const { center } = table;
        const currentRotation = table.rotation ?? 0;

        // calculate the coordinates relative to the center of the page
        const relX = center.x - centerX;
        const relY = center.y - centerY;

        // apply the rotation using the rotation matrix
        // [cos θ, -sin θ]
        // [sin θ,  cos θ]
        const newRelX = relX * cosAngle - relY * sinAngle;
        const newRelY = relX * sinAngle + relY * cosAngle;

        // update the table
        tablesStore.moveTable(
          table.id,
          {
            // calculate the new absolute coordinates
            x: Math.round(newCenterX + newRelX),
            y: Math.round(newCenterY + newRelY),
          },
          (currentRotation + rotationAngle + 360) % 360
        );
      });

      // update the designs
      designs.forEach((design) => {
        const { center } = design;
        const currentRotation = design.rotation ?? 0;

        // calculate the coordinates relative to the center of the page
        const relX = center.x - centerX;
        const relY = center.y - centerY;

        // apply the rotation using the rotation matrix
        const newRelX = relX * cosAngle - relY * sinAngle;
        const newRelY = relX * sinAngle + relY * cosAngle;

        // update the design
        designStore.moveDesignElement(
          design.id,
          {
            // calculate the new absolute coordinates
            x: Math.round(newCenterX + newRelX),
            y: Math.round(newCenterY + newRelY),
          },
          (currentRotation + rotationAngle + 360) % 360
        );
      });

      // force canvas refresh
      needRefreshCanvas();
    },
    [needRefreshCanvas]
  );

  const updateScrollability = () => {
    if (!containerRef.current) return;

    const newCanScroll = {
      up: containerRef.current.scrollTop > 0,
      down:
        containerRef.current.scrollTop <
        containerRef.current.scrollHeight - containerRef.current.clientHeight,
      left: containerRef.current.scrollLeft > 0,
      right:
        containerRef.current.scrollLeft <
        containerRef.current.scrollWidth - containerRef.current.clientWidth,
    };
    setCanScroll(newCanScroll);
  };

  useEffect(() => {
    if (isWorking) {
      setIsVisible(false);
    } else {
      hideTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
    }

    return () => clearTimeout(hideTimeout);
  }, [isWorking]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollability();
    container.addEventListener("scroll", updateScrollability);

    // Add touch event handlers for pinch zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      // Calculate initial distance between two fingers
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      initialDistanceRef.current = distance;
      initialScaleRef.current = scale;
      initialPositionRef.current = {
        x: e.touches[0].clientX + dx / 2,
        y: e.touches[0].clientY + dy / 2,
      };

      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || initialDistanceRef.current === null) return;

      // Calculate current distance
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);

      // Calculate new scale based on the change in distance
      const scaleFactor = currentDistance / initialDistanceRef.current;
      const newScale = roundToTwoDigits(initialScaleRef.current * scaleFactor);

      if (containerRef.current && initialPositionRef.current) {
        const newPosition = {
          x: e.touches[0].clientX + dx / 2,
          y: e.touches[0].clientY + dy / 2,
        };
        const scroll = {
          left: newPosition.x - initialPositionRef.current.x,
          top: newPosition.y - initialPositionRef.current.y,
        };
        containerRef.current.scrollBy(-scroll.left, -scroll.top);
        initialPositionRef.current = newPosition;
      }

      // Limit scale to reasonable values
      if (newScale >= 0.1 && newScale <= 5) {
        setScale(newScale);
      }

      e.preventDefault();
    };

    const handleTouchEnd = () => {
      initialDistanceRef.current = null;
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("scroll", updateScrollability);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [containerRef.current, scale, setScale]);

  const handleScroll = (direction: "up" | "down" | "left" | "right") => {
    if (!containerRef.current) return;

    switch (direction) {
      case "up":
        containerRef.current.scrollBy({
          top: -scrollAmount,
          behavior: "smooth",
        });
        break;
      case "down":
        containerRef.current.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
        break;
      case "left":
        containerRef.current.scrollBy({
          left: -scrollAmount,
          behavior: "smooth",
        });
        break;
      case "right":
        containerRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
        break;
    }

    // Update after scrolling
    setTimeout(updateScrollability, 100);
  };

  const handleTouch = (
    e: React.TouchEvent,
    direction: "up" | "down" | "left" | "right"
  ) => {
    e.stopPropagation();
    handleScroll(direction);
  };

  const handleZoom = (
    e: React.TouchEvent | React.MouseEvent,
    zoomIn: boolean
  ) => {
    e.stopPropagation();
    const newScale = roundToTwoDigits(scale * (zoomIn ? 1.1 : 0.9));
    if (newScale >= 0.1 && newScale <= 5) {
      setScale(newScale);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {isTouchDevice && (
        <>
          <button
            className={cn(
              "fixed top-4 left-1/2 z-50 p-2 rounded-full -translate-x-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.up }
            )}
            onTouchStart={(e) => handleTouch(e, "up")}
          >
            <ChevronUp className="text-white" />
          </button>
          <button
            className={cn(
              "fixed bottom-4 left-1/2 z-50 p-2 rounded-full -translate-x-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.down }
            )}
            onTouchStart={(e) => handleTouch(e, "down")}
          >
            <ChevronDown className="text-white" />
          </button>
          <button
            className={cn(
              "fixed left-4 top-1/2 z-50 p-2 rounded-full -translate-y-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.left }
            )}
            onTouchStart={(e) => handleTouch(e, "left")}
          >
            <ChevronLeft className="text-white" />
          </button>
          <button
            className={cn(
              "fixed right-4 top-1/2 z-50 p-2 rounded-full -translate-y-1/2 bg-blue-500/50 hover:bg-blue-500",
              { hidden: !canScroll.right }
            )}
            onTouchStart={(e) => handleTouch(e, "right")}
          >
            <ChevronRight className="text-white" />
          </button>
        </>
      )}

      {/* Zoom buttons */}
      <button
        className="fixed right-8 bottom-8 z-50 p-2 rounded-full bg-blue-500/50 hover:bg-blue-500"
        onTouchStart={(e) => handleZoom(e, true)}
        onClick={(e) => handleZoom(e, true)}
      >
        <ZoomIn className="text-white" />
      </button>
      <button
        className="fixed bottom-8 right-24 z-50 p-2 rounded-full bg-blue-500/50 hover:bg-blue-500"
        onTouchStart={(e) => handleZoom(e, false)}
        onClick={(e) => handleZoom(e, false)}
      >
        <ZoomOut className="text-white" />
      </button>

      {/* Buttons for moving all elements */}
      <div className="flex fixed right-8 bottom-24 z-50 flex-col items-center p-1 bg-cyan-300 bg-opacity-30 rounded-xl border-2 border-cyan-500">
        {/* Up button */}
        <button
          className="items-center p-1 mb-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
          onTouchStart={() => moveAllElements("up")}
          onClick={() => moveAllElements("up")}
        >
          <ArrowUp className="text-white" />
        </button>

        {/* Middle row with left and right buttons */}
        <div className="flex justify-between w-24">
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => moveAllElements("left")}
            onClick={() => moveAllElements("left")}
          >
            <ArrowLeft className="text-white" />
          </button>
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => moveAllElements("right")}
            onClick={() => moveAllElements("right")}
          >
            <ArrowRight className="text-white" />
          </button>
        </div>

        {/* Down button */}
        <button
          className="p-1 mt-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
          onTouchStart={() => moveAllElements("down")}
          onClick={() => moveAllElements("down")}
        >
          <ArrowDown className="text-white" />
        </button>
        {/* Rotate buttons */}
        <div className="flex justify-between w-24">
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => rotateAllElements("left")}
            onClick={() => rotateAllElements("left")}
          >
            <RotateCcwSquare className="text-white" />
          </button>
          <button
            className="p-1 btn-sm btn-circle bg-blue-500/50 hover:bg-blue-500"
            onTouchStart={() => rotateAllElements("right")}
            onClick={() => rotateAllElements("right")}
          >
            <RotateCwSquare className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};
