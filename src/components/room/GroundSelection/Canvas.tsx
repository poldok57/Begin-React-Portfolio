import React, { useCallback, useEffect, useState } from "react";
import { Mode } from "../types";

import { getCanvasSize } from "../scripts/canvas-size";
import { useRoomContext } from "../RoomProvider";
import { useZustandDesignStore } from "@/lib/stores/design";
// import { cn } from "@/lib/utils/cn";
import { useCanvas } from "@/components/draw/hooks/useCanvas";
import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";

interface CanvasProps {
  backgroundCanvasRef: React.RefObject<HTMLCanvasElement>;
  temporaryCanvasRef: {
    current: HTMLCanvasElement | null;
  };
  mode: Mode | null;
}

// const WITH_CANVAS = false;

export const Canvas: React.FC<CanvasProps> = ({
  backgroundCanvasRef,
  temporaryCanvasRef,
  mode = Mode.create,
}) => {
  // const mouseCanvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 1000,
    height: 600,
  });
  const { setCtxTemporary, scale, getScale, storeName } = useRoomContext();

  /**
   * Zustand design local storage
   */
  // console.log("storeName", storeName);

  let setSelectedDesignElement = null;
  let designElements = null;
  let selectedDesignElement = null;

  const store = useZustandDesignStore(storeName);
  if (store) {
    ({ designElements, selectedDesignElement, setSelectedDesignElement } =
      store.getState());
  }

  const { simpleRefreshCanvas, tempCanvas } = useCanvas({
    canvasRef: backgroundCanvasRef,
    storeName,
    scale,
    defaultMode: DRAWING_MODES.PAUSE,
  });

  useEffect(() => {
    if (tempCanvas) {
      temporaryCanvasRef.current = tempCanvas;
      setCtxTemporary(temporaryCanvasRef.current.getContext("2d"));
      if (mode === Mode.numbering) {
        tempCanvas.style.zIndex = "15";
      } else {
        tempCanvas.style.zIndex = "0";
      }
    }
  }, [tempCanvas, mode]);

  useEffect(() => {
    simpleRefreshCanvas(false, scale);
  }, [designElements, selectedDesignElement]);
  /**
   * Resize canvas
   */
  const resizeCanvas = useCallback(
    (scale: number) => {
      const ground = backgroundCanvasRef.current
        ?.parentElement as HTMLDivElement;
      if (backgroundCanvasRef.current && temporaryCanvasRef.current && ground) {
        const { width, height } = getCanvasSize(ground);

        const canvasWidth = Math.max(
          width,
          ground.offsetWidth,
          ground.scrollWidth
        );
        const canvasHeight = Math.max(
          height,
          ground.offsetHeight,
          ground.scrollHeight
        );

        const newSize = {
          width: Math.round(canvasWidth),
          height: Math.round(canvasHeight),
        };
        setCanvasSize(newSize);

        // console.log("canvasSize", newSize);

        backgroundCanvasRef.current.width = newSize.width;
        backgroundCanvasRef.current.height = newSize.height;

        if (setSelectedDesignElement) {
          setSelectedDesignElement(null);
        }
        simpleRefreshCanvas(true, scale);
        setCtxTemporary(temporaryCanvasRef.current.getContext("2d"));
      }
    },
    [backgroundCanvasRef.current, scale]
  );

  useEffect(() => {
    const handleResize = () => {
      const scale = getScale();
      resizeCanvas(scale);
      simpleRefreshCanvas(true, scale);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    resizeCanvas(scale);
  }, [scale]);

  useEffect(() => {
    // Check if the background canvas is not defined or has no width
    const ground = backgroundCanvasRef.current?.parentElement as HTMLDivElement;
    if (
      !ground ||
      !backgroundCanvasRef.current ||
      !temporaryCanvasRef.current ||
      backgroundCanvasRef.current.offsetWidth < ground.offsetWidth ||
      backgroundCanvasRef.current.offsetHeight < ground.offsetHeight
    ) {
      // Force re-render after 1 second
      const timer = setTimeout(() => {
        // Use a state update to trigger a re-render
        // console.log("temporised resizeCanvas");
        resizeCanvas(scale);
      }, 300);

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [backgroundCanvasRef.current, scale]);

  return (
    <>
      <div className="flex sticky top-1 right-1 justify-end w-full">
        <div className="flex top-1 right-1 flex-col px-2 py-1 bg-gray-200 rounded border border-gray-300 opacity-65">
          <span className="text-sm font-semibold">
            Scale : {scale.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-gray-500">
            Size : {canvasSize.width} x {canvasSize.height}
          </span>
        </div>
      </div>
      <canvas
        ref={backgroundCanvasRef}
        id="background-canvas"
        className="overflow-visible absolute top-0 left-0 min-w-full min-h-full border-r border-b border-gray-500 border-dashed pointer-events-none"
      />
    </>
  );
};
