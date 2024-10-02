import React, { useCallback, useEffect, useRef } from "react";
import { Mode } from "../types";
import {
  drawAllDesignElements,
  hightLightSelectedElement,
} from "../design-elements";
import { getCanvasSize } from "../canvas-size";
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
  const { setCtxTemporary, scale } = useRoomContext();
  const ground: HTMLDivElement | null | undefined = backgroundCanvasRef.current
    ?.parentElement as HTMLDivElement;

  const resizeCanvas = useCallback(
    (scale: number) => {
      if (backgroundCanvasRef.current && temporaryCanvasRef.current && ground) {
        const { width, height } = getCanvasSize(ground);

        const offsetWidth = ground.offsetWidth;
        const offsetHeight = ground.offsetHeight;

        const canvasWidth = Math.max(width, offsetWidth, scale * offsetWidth);
        const canvasHeight = Math.max(
          height,
          offsetHeight,
          scale * offsetHeight
        );

        canvasSize.current = {
          width: Math.round(canvasWidth),
          height: Math.round(canvasHeight),
        };

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
    [backgroundCanvasRef, temporaryCanvasRef, ground, setCtxTemporary]
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
      ground,
      designElements,
      selectedDesignElement,
    ]
  );

  useEffect(() => {
    const handleResize = () => resizeCanvas(1); // Utilisez 1 comme échelle par défaut
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvas]);

  useEffect(() => {
    drawElementsOnCanvas(1); // Utilisez 1 comme échelle par défaut
  }, [drawElementsOnCanvas]);

  useEffect(() => {
    // Check if the background canvas is not defined or has no width
    if (
      ground &&
      (!backgroundCanvasRef.current ||
        backgroundCanvasRef.current.offsetWidth < ground.offsetWidth)
    ) {
      // Force re-render after 1 second
      const timer = setTimeout(() => {
        // Use a state update to trigger a re-render
        console.log("force update canvas size");
        resizeCanvas(scale);
      }, 500);

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [backgroundCanvasRef.current, backgroundCanvasRef.current]);

  return (
    <>
      <canvas
        ref={backgroundCanvasRef}
        id="background-canvas"
        className="overflow-visible absolute top-0 left-0 border-r border-b border-gray-500 border-dashed"
      />
      <canvas
        ref={temporaryCanvasRef}
        id="temporary-canvas"
        className={clsx(
          "overflow-visible absolute top-0 left-0",
          mode === Mode.numbering ? "z-20" : "z-0"
        )}
        style={{ pointerEvents: "none" }}
      />
    </>
  );
};
