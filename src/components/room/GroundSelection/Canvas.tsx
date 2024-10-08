import React, { useCallback, useEffect, useRef } from "react";
import { Mode } from "../types";
import {
  drawAllDesignElements,
  hightLightSelectedElement,
} from "../scripts/design-elements";
import { getCanvasSize } from "../scripts/canvas-size";
import { useRoomContext } from "../RoomProvider";
import { useTableDataStore } from "../stores/tables";
import clsx from "clsx";

interface CanvasProps {
  backgroundCanvasRef: React.RefObject<HTMLCanvasElement>;
  temporaryCanvasRef: React.RefObject<HTMLCanvasElement>;
  mode: Mode | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  backgroundCanvasRef,
  temporaryCanvasRef,
  mode = Mode.create,
}) => {
  const canvasSize = useRef<{ width: number; height: number }>({
    width: 1000,
    height: 600,
  });
  const { designElements, selectedDesignElement } = useTableDataStore();
  const { setCtxTemporary, scale, getScale } = useRoomContext();
  const ground: HTMLDivElement | null | undefined = backgroundCanvasRef.current
    ?.parentElement as HTMLDivElement;

  const resizeCanvas = useCallback(
    (scale: number) => {
      if (backgroundCanvasRef.current && temporaryCanvasRef.current && ground) {
        const { width, height } = getCanvasSize(ground);

        const offsetWidth = ground.offsetWidth;
        const offsetHeight = ground.offsetHeight;

        const canvasWidth = Math.max(width, offsetWidth, ground.scrollWidth);
        const canvasHeight = Math.max(
          height,
          offsetHeight,
          ground.scrollHeight
        );

        canvasSize.current = {
          width: Math.round(canvasWidth),
          height: Math.round(canvasHeight),
        };

        // console.log("canvasSize", canvasSize.current);

        [backgroundCanvasRef.current, temporaryCanvasRef.current].forEach(
          (canvas) => {
            canvas.width = canvasSize.current.width;
            canvas.height = canvasSize.current.height;
          }
        );
        drawElementsOnCanvas(scale);
        setCtxTemporary(temporaryCanvasRef.current.getContext("2d"));
      }
    },
    [backgroundCanvasRef, temporaryCanvasRef, scale, ground]
  );

  const drawElementsOnCanvas = useCallback(
    (scale: number) => {
      if (backgroundCanvasRef.current) {
        const ground: HTMLDivElement | null | undefined = backgroundCanvasRef
          .current?.parentElement as HTMLDivElement;
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
      backgroundCanvasRef,
      temporaryCanvasRef,
      scale,
      ground,
      designElements,
      selectedDesignElement,
    ]
  );

  useEffect(() => {
    const handleResize = () => {
      const scale = getScale();
      resizeCanvas(scale); // Utilisez 1 comme échelle par défaut
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
    if (
      ground &&
      (!backgroundCanvasRef.current ||
        backgroundCanvasRef.current.offsetWidth < ground.offsetWidth ||
        backgroundCanvasRef.current.offsetHeight < ground.offsetHeight)
    ) {
      // Force re-render after 1 second
      const timer = setTimeout(() => {
        // Use a state update to trigger a re-render
        resizeCanvas(scale);
      }, 500);

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [backgroundCanvasRef.current, ground, scale]);

  return (
    <>
      <canvas
        ref={backgroundCanvasRef}
        id="background-canvas"
        className="overflow-visible absolute top-0 left-0 min-w-full min-h-full border-r border-b border-gray-500 border-dashed"
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
