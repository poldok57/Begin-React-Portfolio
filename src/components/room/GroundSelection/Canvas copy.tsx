import React, { useCallback, useEffect, useState, useRef } from "react";
import { Mode } from "../types";
import {
  drawAllDesignElements,
  hightLightSelectedElement,
} from "../scripts/design-elements";
import { getCanvasSize } from "../scripts/canvas-size";
import { useRoomContext } from "../RoomProvider";
import { useTableDataStore } from "../stores/tables";
import { useZustandDesignStore } from "@/lib/stores/design";
import clsx from "clsx";

interface CanvasProps {
  backgroundCanvasRef: React.RefObject<HTMLCanvasElement>;
  temporaryCanvasRef: React.RefObject<HTMLCanvasElement>;
  mode: Mode | null;
  storeName: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  backgroundCanvasRef,
  temporaryCanvasRef,
  mode = Mode.create,
  storeName = null,
}) => {
  const mouseCanvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 1000,
    height: 600,
  });
  const { designElements, selectedDesignElement } = useTableDataStore();
  const { setCtxTemporary, scale, getScale } = useRoomContext();

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

        [backgroundCanvasRef.current, temporaryCanvasRef.current].forEach(
          (canvas) => {
            canvas.width = newSize.width;
            canvas.height = newSize.height;
          }
        );
        drawElementsOnCanvas(scale);
        setCtxTemporary(temporaryCanvasRef.current.getContext("2d"));
      }
    },
    [backgroundCanvasRef.current, temporaryCanvasRef.current, scale]
  );

  const drawElementsOnCanvas = useCallback(
    (scale: number) => {
      const ground: HTMLDivElement | null | undefined = backgroundCanvasRef
        .current?.parentElement as HTMLDivElement;

      if (backgroundCanvasRef.current) {
        const ctx = backgroundCanvasRef.current.getContext("2d");
        if (ctx) {
          drawAllDesignElements({
            ctx,
            elements: designElements,
            ground,
            scale,
          });
        }
      }

      const temporaryCtx = temporaryCanvasRef.current?.getContext("2d") || null;

      if (selectedDesignElement && temporaryCtx && ground) {
        const element = designElements.find(
          (el) => el.id === selectedDesignElement
        );
        if (element) {
          if (element.type === "background") {
            ground.style.border = "3px dashed red";
          } else {
            ground.style.border = "none";
            hightLightSelectedElement(temporaryCtx, element, scale);
          }
        }
      }
    },
    [
      backgroundCanvasRef.current,
      temporaryCanvasRef.current,
      scale,
      designElements,
      selectedDesignElement,
    ]
  );

  useEffect(() => {
    const handleResize = () => {
      const scale = getScale();
      resizeCanvas(scale);
      drawElementsOnCanvas(scale);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    drawElementsOnCanvas(scale);
  }, [designElements, selectedDesignElement]);

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
        console.log("temporised resizeCanvas");
        resizeCanvas(scale);
      }, 300);

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [backgroundCanvasRef.current, temporaryCanvasRef.current, scale]);

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
        className="overflow-visible absolute top-0 left-0 min-w-full min-h-full border-r border-b border-gray-500 border-dashed"
      />
      <canvas
        ref={mouseCanvasRef}
        id="mouse-canvas"
        className="overflow-visible absolute top-0 left-0 min-w-full min-h-full"
      />
      <canvas
        ref={temporaryCanvasRef}
        id="temporary-canvas"
        className={clsx(
          "overflow-visible min-w-full min-h-full absolute top-0 left-0",
          mode === Mode.numbering ? "z-20" : "z-0"
        )}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
};
