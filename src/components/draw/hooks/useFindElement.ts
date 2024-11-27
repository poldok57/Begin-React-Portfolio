import { useState, useEffect, useCallback, useRef } from "react";
import { ThingsToDraw } from "@/lib/canvas/canvas-defines";
import { showAllDashedRectangles } from "@/lib/canvas/showDrawElement";
import { isInsideSquare } from "@/lib/square-position";
interface UseFindElementProps {
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement> | null;
  designElements: ThingsToDraw[];
  onElementFound: (elementId: string) => void;
}

export const useFindElement = ({
  canvasRef,
  canvasTemporyRef,
  designElements,
  onElementFound,
}: UseFindElementProps) => {
  const [findMode, setFindMode] = useState(false);
  const nbFound = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!findMode || !canvasTemporyRef?.current) return;

      const ctx = canvasTemporyRef.current.getContext("2d");
      if (!ctx) return;

      const rect = canvasTemporyRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const nb = showAllDashedRectangles(ctx, designElements, {
        x,
        y,
      });

      if (nb !== nbFound.current) {
        nbFound.current = nb;
        if (nb > 0) {
          canvasTemporyRef.current.style.cursor = "pointer";
        } else {
          canvasTemporyRef.current.style.cursor = "default";
        }
      }
    },
    [findMode, canvasTemporyRef, designElements]
  );

  const handleCanvasClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!findMode || !canvasRef?.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      let x: number, y: number;

      if (e instanceof MouseEvent) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else {
        const touch = e.touches[0];
        x = touch.clientX - rect.left;
        y = touch.clientY - rect.top;
      }

      for (let i = designElements.length - 1; i >= 0; i--) {
        const element = designElements[i];
        if (isInsideSquare({ x, y }, element.size, element.rotation)) {
          onElementFound(element.id);
          setFindMode(false);
          return;
        }
      }

      setFindMode(false);
    },
    [findMode, canvasRef, designElements, onElementFound]
  );

  useEffect(() => {
    if (findMode && canvasTemporyRef?.current) {
      const canvas = canvasTemporyRef.current;

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        handleCanvasClick(e);
      };

      canvas.addEventListener("click", handleCanvasClick);
      canvas.addEventListener("touchstart", handleTouchStart);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.style.cursor = "default";

      return () => {
        canvas.removeEventListener("click", handleCanvasClick);
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.style.cursor = "default";

        // Nettoyer le canvas temporaire lors de la désactivation du mode find
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };
    }
  }, [findMode, canvasTemporyRef, handleCanvasClick, handleMouseMove]);

  return {
    findMode,
    setFindMode,
  };
};
