import React, { useRef, useEffect } from "react";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { mouseIsInsideComponent } from "@/lib/mouse-position";
import { useTableDataStore } from "./stores/tables";
import { DesignElement, DesignType } from "./types";

interface GroundSelectionProps {
  onSelectionStart: (clientX: number, clientY: number) => void;
  onSelectionMove: (clientX: number, clientY: number) => void;
  onSelectionEnd: (rect: Rectangle | null) => void;
  id: string;
  children: React.ReactNode;
}

export const GroundSelection: React.FC<GroundSelectionProps> = ({
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  id,
  children,
}) => {
  const isSelectingRef = useRef(false);
  const startPos = useRef<Position | null>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const areaOffsetRef = useRef<Position | null>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const temporaryCanvasRef = useRef<HTMLCanvasElement>(null);
  const { designElements } = useTableDataStore((state) => state);

  const handleStart = (clientX: number, clientY: number) => {
    if (!groundRef.current || !containerRef.current) return;

    if (
      mouseIsInsideComponent(
        { clientX, clientY } as MouseEvent,
        containerRef.current
      )
    ) {
      areaOffsetRef.current = {
        left: containerRef.current.offsetLeft - clientX,
        top: containerRef.current.offsetTop - clientY,
      };
      onSelectionStart(clientX, clientY);
      return;
    }

    const { left, top } = groundRef.current.getBoundingClientRect();
    isSelectingRef.current = true;
    startPos.current = { left: clientX - left, top: clientY - top };

    containerRef.current.style.display = "block";
    containerRef.current.style.left = `${clientX}px`;
    containerRef.current.style.top = `${clientY}px`;
    containerRef.current.style.width = "0px";
    containerRef.current.style.height = "0px";
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!groundRef.current || !containerRef.current) return;

    if (areaOffsetRef.current) {
      const newLeft = clientX + areaOffsetRef.current.left;
      const newTop = clientY + areaOffsetRef.current.top;
      containerRef.current.style.left = `${newLeft}px`;
      containerRef.current.style.top = `${newTop}px`;
      onSelectionMove(newLeft, newTop);
      return;
    }

    if (isSelectingRef.current && startPos.current) {
      const { left, top } = groundRef.current.getBoundingClientRect();
      const width = clientX - left - startPos.current.left;
      const height = clientY - top - startPos.current.top;
      containerRef.current.style.width = `${Math.abs(width)}px`;
      containerRef.current.style.height = `${Math.abs(height)}px`;
      containerRef.current.style.left = `${
        width < 0 ? clientX - left : startPos.current.left
      }px`;
      containerRef.current.style.top = `${
        height < 0 ? clientY - top : startPos.current.top
      }px`;
    }
  };

  const handleEnd = () => {
    isSelectingRef.current = false;
    areaOffsetRef.current = null;

    if (!containerRef.current) {
      onSelectionEnd(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) {
      onSelectionEnd(null);
      containerRef.current.style.display = "none";
      return;
    }

    onSelectionEnd(rect);
  };

  const resizeCanvas = () => {
    if (
      backgroundCanvasRef.current &&
      temporaryCanvasRef.current &&
      groundRef.current
    ) {
      const { width, height } = groundRef.current.getBoundingClientRect();
      [backgroundCanvasRef.current, temporaryCanvasRef.current].forEach(
        (canvas) => {
          canvas.width = width;
          canvas.height = height;
        }
      );
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (!backgroundCanvasRef.current) {
      return;
    }
    const { left: offsetLeft, top: offsetTop } =
      backgroundCanvasRef.current.getBoundingClientRect();
    console.log("offsetLeft", offsetLeft);

    const ctx = backgroundCanvasRef.current.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(
      0,
      0,
      backgroundCanvasRef.current.width,
      backgroundCanvasRef.current.height
    );

    console.log("designElements: length", designElements.length);
    designElements.forEach((element: DesignElement) => {
      console.log("designElements: element", element);
      ctx.globalAlpha = element.opacity || 1;
      switch (element.type) {
        case DesignType.background:
          if (
            !element.rect.left ||
            !element.rect.top ||
            !element.rect.width ||
            !element.rect.height
          ) {
            break;
          }
          ctx.fillStyle = element.color;
          ctx.fillRect(
            element.rect.left - offsetLeft,
            element.rect.top - offsetTop,
            element.rect.width,
            element.rect.height
          );
          // Ajouter un bord noir
          ctx.strokeStyle = "#888888";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            element.rect.left - offsetLeft,
            element.rect.top - offsetTop,
            element.rect.width,
            element.rect.height
          );

          break;
        case DesignType.line:
          if (!element.point1 || !element.point2) {
            return;
          }
          ctx.strokeStyle = element.color;
          ctx.lineWidth = element.rect.width;
          ctx.beginPath();
          ctx.moveTo(element.point1.x, element.point1.y);
          ctx.lineTo(element.point2.x, element.point2.y);
          ctx.stroke();
          break;
        case DesignType.arc:
          if (!element.point1 || !element.point2 || !element.point3) {
            return;
          }
          ctx.strokeStyle = element.color;
          ctx.lineWidth = element.rect.width;
          ctx.beginPath();
          ctx.moveTo(element.point1.x, element.point1.y);
          ctx.quadraticCurveTo(
            element.point2.x,
            element.point2.y,
            element.point3.x,
            element.point3.y
          );
          ctx.stroke();
          break;
      }
    });
  }, [designElements]);

  useEffect(() => {
    const ground = groundRef.current;
    if (!ground) {
      console.log("ground not found");
      return;
    }
    const handleMouseDown = (e: MouseEvent) =>
      handleStart(e.clientX, e.clientY);
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleEnd();
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    ground.addEventListener("mousedown", handleMouseDown);
    ground.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchend", handleEnd);

    return () => {
      ground.removeEventListener("mousedown", handleMouseDown);
      ground.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={groundRef} id={id} className="relative w-full h-full">
      <canvas
        ref={backgroundCanvasRef}
        id="background-canvas"
        className="absolute top-0 left-0 w-full h-full border border-gray-500"
        // style={{ zIndex: 1 }}
      />
      <canvas
        ref={temporaryCanvasRef}
        id="temporary-canvas"
        className="absolute top-0 left-0 w-full h-full border border-blue-500"
        // style={{ zIndex: 2 }}
      />
      <div
        ref={containerRef}
        className="absolute bg-gray-200 bg-opacity-20 border border-gray-500 border-dashed cursor-move"
        style={{ display: "none" }}
      />
      {children}
    </div>
  );
};
