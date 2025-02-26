import React, { useEffect, useState, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { roundToTwoDigits } from "@/lib/utils/number";

interface ScrollButtonsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isWorking: boolean;
  isTouchDevice: boolean;
  scale: number;
  setScale: (scale: number) => void;
}

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  containerRef,
  isWorking,
  isTouchDevice = true,
  scale,
  setScale,
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

  // Zoom gesture state
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);

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

    // Mettre à jour après le défilement
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
        className="fixed right-4 bottom-4 z-50 p-2 rounded-full bg-blue-500/50 hover:bg-blue-500"
        onTouchStart={(e) => handleZoom(e, true)}
        onClick={(e) => handleZoom(e, true)}
      >
        <ZoomIn className="text-white" />
      </button>
      <button
        className="fixed bottom-4 right-16 z-50 p-2 rounded-full bg-blue-500/50 hover:bg-blue-500"
        onTouchStart={(e) => handleZoom(e, false)}
        onClick={(e) => handleZoom(e, false)}
      >
        <ZoomOut className="text-white" />
      </button>
    </>
  );
};
