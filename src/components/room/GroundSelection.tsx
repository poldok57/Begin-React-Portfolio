import React, { useRef, useEffect, useState } from "react";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { mouseIsInsideComponent } from "@/lib/mouse-position";
import { useTableDataStore } from "./stores/tables";
import { drawAllDesignElements } from "./design-elements";

interface GroundSelectionProps {
  onSelectionStart: (clientX: number, clientY: number) => void;
  onSelectionMove: (clientX: number, clientY: number) => void;
  onSelectionEnd: (rect: Rectangle | null) => void;
  onHorizontalMove: (left: number, listId: string[]) => void;
  onVerticalMove: (top: number, listId: string[]) => void;
  id: string;
  children: React.ReactNode;
}

export const GroundSelection: React.FC<GroundSelectionProps> = ({
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  onHorizontalMove,
  onVerticalMove,
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
  const { designElements, selectedDesignElement } = useTableDataStore(
    (state) => state
  );
  const verticalAxis = useRef<number[]>([]);
  const horizontalAxis = useRef<number[]>([]);
  const selectedAlignmentLine = useRef<{
    type: "vertical" | "horizontal";
    position: number;
  } | null>(null);
  const alignmentGroups = useRef<{
    vertical: { position: number; elements: HTMLDivElement[] }[];
    horizontal: { position: number; elements: HTMLDivElement[] }[];
  }>({ vertical: [], horizontal: [] });
  const [showAlignmentLines, setShowAlignmentLines] = useState(false);

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

  const findAlignments = () => {
    if (!groundRef.current) return { vertical: [], horizontal: [] };

    const children = Array.from(groundRef.current.children);
    const containerRect = containerRef.current?.getBoundingClientRect();
    alignmentGroups.current = { vertical: [], horizontal: [] };

    const isInContainer = (rect: DOMRect) => {
      if (!containerRect) return true;
      return (
        rect.left >= containerRect.left &&
        rect.right <= containerRect.right &&
        rect.top >= containerRect.top &&
        rect.bottom <= containerRect.bottom
      );
    };

    const elements = children.filter((child): child is HTMLDivElement => {
      return (
        child instanceof HTMLDivElement &&
        child !== containerRef.current &&
        isInContainer(child.getBoundingClientRect())
      );
    });

    const tolerance = 15; // Tolérance en pixels pour l'alignement

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Alignement vertical
      const foundVerticalGroup = alignmentGroups.current.vertical.find(
        (group) => Math.abs(group.position - centerX) <= tolerance
      );

      if (foundVerticalGroup) {
        foundVerticalGroup.elements.push(el);
        foundVerticalGroup.position =
          foundVerticalGroup.elements.reduce((sum, groupEl) => {
            const groupRect = groupEl.getBoundingClientRect();
            return sum + (groupRect.left + groupRect.width / 2);
          }, 0) / foundVerticalGroup.elements.length;
      } else {
        alignmentGroups.current.vertical.push({
          position: centerX,
          elements: [el],
        });
      }

      // Alignement horizontal
      const foundHorizontalGroup = alignmentGroups.current.horizontal.find(
        (group) => Math.abs(group.position - centerY) <= tolerance
      );

      if (foundHorizontalGroup) {
        foundHorizontalGroup.elements.push(el);
        foundHorizontalGroup.position =
          foundHorizontalGroup.elements.reduce((sum, groupEl) => {
            const groupRect = groupEl.getBoundingClientRect();
            return sum + (groupRect.top + groupRect.height / 2);
          }, 0) / foundHorizontalGroup.elements.length;
      } else {
        alignmentGroups.current.horizontal.push({
          position: centerY,
          elements: [el],
        });
      }
    });

    return {
      vertical: alignmentGroups.current.vertical
        .filter((group) => group.elements.length > 1)
        .map((group) => group.position),
      horizontal: alignmentGroups.current.horizontal
        .filter((group) => group.elements.length > 1)
        .map((group) => group.position),
    };
  };

  const drawAlignmentLines = (alignments: {
    vertical: number[];
    horizontal: number[];
  }) => {
    if (!temporaryCanvasRef.current) return;

    const { left, top } = groundRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

    const ctx = temporaryCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([10, 5, 3, 5]);

    // Lignes verticales
    alignments.vertical.forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x - left, 0);
      ctx.lineTo(x - left, ctx.canvas.height);
      ctx.stroke();
    });

    // Lignes horizontales
    alignments.horizontal.forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y - top);
      ctx.lineTo(ctx.canvas.width, y - top);
      ctx.stroke();
    });

    ctx.setLineDash([]);
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
      // too small
      onSelectionEnd(null);
      containerRef.current.style.display = "none";
      clearTemporaryCanvas();
      setShowAlignmentLines(false);
      return;
    }

    onSelectionEnd(rect);
    const alignments = findAlignments();
    verticalAxis.current = alignments.vertical;
    horizontalAxis.current = alignments.horizontal;
    drawAlignmentLines(alignments);
    setShowAlignmentLines(
      alignments.vertical.length > 0 || alignments.horizontal.length > 0
    );
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
      drawElementsOnCanvas();
    }
  };

  const drawElementsOnCanvas = () => {
    if (!backgroundCanvasRef.current) {
      return;
    }

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
    const temporaryCtx = temporaryCanvasRef.current?.getContext("2d") || null;

    if (temporaryCtx) {
      temporaryCtx.clearRect(
        0,
        0,
        temporaryCtx.canvas.width,
        temporaryCtx.canvas.height
      );
    }

    const { left, top } = backgroundCanvasRef.current.getBoundingClientRect();
    const offset = { left, top };

    // console.log("designElements: length", designElements.length);

    drawAllDesignElements({
      ctx,
      temporaryCtx,
      elements: designElements,
      offset,
      selectedElementId: selectedDesignElement,
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const clickedVerticalLine = verticalAxis.current.find(
      (x) => Math.abs(x - mouseX) <= 5
    );

    const clickedHorizontalLine = horizontalAxis.current.find(
      (y) => Math.abs(y - mouseY) <= 5
    );

    if (clickedVerticalLine !== undefined) {
      selectedAlignmentLine.current = {
        type: "vertical",
        position: clickedVerticalLine,
      };
      const selectedGroup = alignmentGroups.current.vertical.find(
        (group) => group.position === clickedVerticalLine
      );
      if (selectedGroup) {
        const { left } = groundRef.current?.getBoundingClientRect() || {
          left: 0,
        };
        const elementIds = selectedGroup.elements.map((el) => el.id);
        onHorizontalMove(e.clientX - left, elementIds);
      }
    } else if (clickedHorizontalLine !== undefined) {
      selectedAlignmentLine.current = {
        type: "horizontal",
        position: clickedHorizontalLine,
      };
      const selectedGroup = alignmentGroups.current.horizontal.find(
        (group) => group.position === clickedHorizontalLine
      );
      if (selectedGroup) {
        const { top } = groundRef.current?.getBoundingClientRect() || {
          top: 0,
        };
        const elementIds = selectedGroup.elements.map((el) => el.id);
        onVerticalMove(e.clientY - top, elementIds);
      }
    } else {
      handleStart(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!temporaryCanvasRef.current || !groundRef.current) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (selectedAlignmentLine.current !== null) {
      // Gérer le déplacement de la ligne d'alignement
      const selectedGroup =
        selectedAlignmentLine.current.type === "vertical"
          ? alignmentGroups.current.vertical.find(
              (group) =>
                group.position === selectedAlignmentLine.current?.position
            )
          : alignmentGroups.current.horizontal.find(
              (group) =>
                group.position === selectedAlignmentLine.current?.position
            );

      if (selectedGroup) {
        const { left, top } = groundRef.current?.getBoundingClientRect() || {
          left: 0,
          top: 0,
        };
        const elementIds = selectedGroup.elements.map((el) => el.id);
        if (selectedAlignmentLine.current.type === "vertical") {
          onHorizontalMove(e.clientX - left, elementIds);
        } else {
          onVerticalMove(e.clientY - top, elementIds);
        }
      }
    } else {
      const isNearVerticalLine = verticalAxis.current.some(
        (x) => Math.abs(x - mouseX) <= 5
      );
      const isNearHorizontalLine = horizontalAxis.current.some(
        (y) => Math.abs(y - mouseY) <= 5
      );

      let cursorStyle = "default";
      if (isNearVerticalLine) {
        cursorStyle = "ew-resize";
      } else if (isNearHorizontalLine) {
        cursorStyle = "ns-resize";
      }

      if (cursorStyle !== temporaryCanvasRef.current.style.cursor) {
        temporaryCanvasRef.current.style.cursor = cursorStyle;
        if (containerRef.current) {
          containerRef.current.style.cursor =
            cursorStyle === "default" ? "move" : cursorStyle;
        }
      }

      handleMove(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (selectedAlignmentLine.current !== null) {
      selectedAlignmentLine.current = null;
    } else {
      handleEnd();
    }
  };

  const equalizeSpaces = (type: "vertical" | "horizontal") => {
    const axes =
      type === "vertical" ? verticalAxis.current : horizontalAxis.current;
    if (axes.length < 2) return;

    const firstAxis = Math.min(...axes);
    const lastAxis = Math.max(...axes);
    const totalSpace = lastAxis - firstAxis;
    const equalSpace = totalSpace / (axes.length - 1);

    const newAxes = axes.map((_, index) => firstAxis + index * equalSpace);

    const groups =
      type === "vertical"
        ? alignmentGroups.current.vertical
        : alignmentGroups.current.horizontal;

    // Récupérer les coordonnées left et top de l'élément ground
    const groundRect = groundRef.current?.getBoundingClientRect();
    const groundLeft = groundRect?.left || 0;
    const groundTop = groundRect?.top || 0;

    newAxes.forEach((newPosition, index) => {
      const group = groups[index];
      if (group) {
        const elementIds = group.elements.map((el) => el.id);
        if (type === "vertical") {
          onHorizontalMove(newPosition - groundLeft, elementIds);
        } else {
          onVerticalMove(newPosition - groundTop, elementIds);
        }
      }
    });

    // Mettre à jour les axes et redessiner les lignes
    if (type === "vertical") {
      verticalAxis.current = newAxes;
    } else {
      horizontalAxis.current = newAxes;
    }
    drawAlignmentLines({
      vertical: verticalAxis.current,
      horizontal: horizontalAxis.current,
    });

    // Assurez-vous que showAlignmentLines reste true
    setShowAlignmentLines(true);
  };

  const clearTemporaryCanvas = () => {
    if (!temporaryCanvasRef.current) return;
    const ctx = temporaryCanvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    // Supprimez cette ligne : setShowAlignmentLines(false);
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

    drawElementsOnCanvas();
  }, [designElements, selectedDesignElement]);

  useEffect(() => {
    const ground = groundRef.current;
    if (!ground) {
      console.log("ground not found");
      return;
    }

    ground.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      e.preventDefault();
      handleStart(touch.clientX, touch.clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      e.preventDefault();
      handleMove(touch.clientX, touch.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleEnd();
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
        clearTemporaryCanvas();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    ground.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      ground.removeEventListener("mousedown", handleMouseDown);
      ground.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={groundRef} id={id} className="relative w-full h-full">
      <canvas
        ref={backgroundCanvasRef}
        id="background-canvas"
        className="absolute top-0 left-0 w-full h-full border-gray-500 border-1"
        // style={{ zIndex: 1 }}
      />
      <canvas
        ref={temporaryCanvasRef}
        id="temporary-canvas"
        className="absolute top-0 left-0 w-full h-full"
        // style={{ zIndex: 2 }}
      />
      <div
        ref={containerRef}
        className="absolute bg-gray-200 bg-opacity-20 border border-gray-500 border-dashed cursor-move"
        style={{ display: "none" }}
      />
      {showAlignmentLines && (
        <>
          <button
            className="absolute top-0 left-1/2 px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1/2 translate-y-1"
            onClick={() => equalizeSpaces("vertical")}
          >
            =
          </button>
          <button
            className="absolute right-0 top-1/2 px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1 -translate-y-1/2"
            onClick={() => equalizeSpaces("horizontal")}
          >
            =
          </button>
        </>
      )}
      {children}
    </div>
  );
};