import React, { useRef, useEffect, useState } from "react";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { coordinateIsInsideRect } from "@/lib/mouse-position";
import { useTableDataStore } from "./stores/tables";
import { drawAllDesignElements } from "./design-elements";
import { useScale } from "./RoomProvider";

interface GroundSelectionProps {
  onSelectionStart: () => void;
  onSelectionMove: (clientX: number, clientY: number) => void;
  onSelectionEnd: (rect: Rectangle | null) => void;
  onHorizontalMove: (left: number, listId: string[]) => void;
  onVerticalMove: (top: number, listId: string[]) => void;
  id: string;
  preSelection: Rectangle | null;
  children: React.ReactNode;
  idContainer?: string;
}

const LINE_OVERLAP = 30;

export const GroundSelection: React.FC<GroundSelectionProps> = ({
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  onHorizontalMove,
  onVerticalMove,
  id,
  preSelection,
  children,
  idContainer = "container",
}) => {
  const { scale } = useScale();
  const isSelectingRef = useRef(false);
  const startPos = useRef<Position | null>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const areaOffsetRef = useRef<Position | null>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const temporaryCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = useRef<{ width: number; height: number }>({
    width: 1000,
    height: 600,
  });
  const { designElements, selectedDesignElement } = useTableDataStore(
    (state) => state
  );
  const itemSelectedRef = useRef(false);
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

  // container with overlap of LINE_OVERLAP
  const isInOverlapContainer = (x: number, y: number) => {
    if (!containerRef.current) return false;

    const containerRect = containerRef.current.getBoundingClientRect();
    return (
      x >= containerRect.left - LINE_OVERLAP &&
      x <= containerRect.right + LINE_OVERLAP &&
      y >= containerRect.top - LINE_OVERLAP &&
      y <= containerRect.bottom + LINE_OVERLAP
    );
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (!groundRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    if (coordinateIsInsideRect({ x: clientX, y: clientY }, containerRect)) {
      console.log("clic inside the container");

      // Clic inside the container start moving the container
      areaOffsetRef.current = {
        left: containerRef.current.offsetLeft - clientX,
        top: containerRef.current.offsetTop - clientY,
      };
      onSelectionStart();
      return;
    }
    const scrollX = groundRef.current?.scrollLeft || 0;
    const scrollY = groundRef.current?.scrollTop || 0;

    // clic outside the container start selecting new position of the container
    const { left, top } = groundRef.current.getBoundingClientRect();
    isSelectingRef.current = true;
    itemSelectedRef.current = false;
    startPos.current = {
      left: clientX + scrollX - left,
      top: clientY + scrollY - top,
    };

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

    const tolerance = 5; // tolerance for alignment

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Alignement vertical
      const foundVerticalGroup = alignmentGroups.current.vertical.find(
        (group) =>
          rect.left + tolerance < group.position &&
          rect.right - tolerance > group.position
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
        (group) =>
          rect.top + tolerance < group.position &&
          rect.bottom - tolerance > group.position
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
    if (!temporaryCanvasRef.current || !groundRef.current) return;

    const { left, top } = groundRef.current?.getBoundingClientRect();
    const { scrollLeft, scrollTop } = groundRef.current;
    const offsetLeft = scrollLeft - left;
    const offsetTop = scrollTop - top;

    // get container rect

    const container = containerRef.current?.getBoundingClientRect();

    const ctx = temporaryCanvasRef.current.getContext("2d");
    if (!ctx || !container) return;

    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([10, 5, 3, 5]);

    // Lignes verticales
    alignments.vertical.forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x + offsetLeft, container.top - LINE_OVERLAP + offsetTop);
      ctx.lineTo(x + offsetLeft, container.bottom + LINE_OVERLAP + offsetTop);
      ctx.stroke();
    });

    // Lignes horizontales
    alignments.horizontal.forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(container.left - LINE_OVERLAP + offsetLeft, y + offsetTop);
      ctx.lineTo(container.right + LINE_OVERLAP + offsetLeft, y + offsetTop);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!groundRef.current || !containerRef.current) return;

    if (areaOffsetRef.current) {
      // move container
      const newLeft = clientX + areaOffsetRef.current.left;
      const newTop = clientY + areaOffsetRef.current.top;
      const deltaX = newLeft - parseInt(containerRef.current.style.left);
      const deltaY = newTop - parseInt(containerRef.current.style.top);

      containerRef.current.style.left = `${newLeft}px`;
      containerRef.current.style.top = `${newTop}px`;
      onSelectionMove(newLeft, newTop);

      // Move alignment lines
      verticalAxis.current = verticalAxis.current.map((x) => x + deltaX);
      horizontalAxis.current = horizontalAxis.current.map((y) => y + deltaY);

      // Redraw alignment lines
      drawAlignmentLines({
        vertical: verticalAxis.current,
        horizontal: horizontalAxis.current,
      });

      return;
    }

    // select first corner of the container
    if (isSelectingRef.current && startPos.current) {
      const { left, top } = groundRef.current.getBoundingClientRect();
      const scrollX = groundRef.current.scrollLeft;
      const scrollY = groundRef.current.scrollTop;

      clientX += scrollX;
      clientY += scrollY;

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
      // too small act like a end of selection
      onSelectionEnd(null);
      containerRef.current.style.display = "none";
      clearTemporaryCanvas();
      setShowAlignmentLines(false);
      return;
    }

    if (itemSelectedRef.current) {
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

    itemSelectedRef.current = true;
  };

  const resizeCanvas = (scale: number) => {
    if (
      backgroundCanvasRef.current &&
      temporaryCanvasRef.current &&
      groundRef.current
    ) {
      // const { width, height } = groundRef.current.getBoundingClientRect();

      const offsetWidth = groundRef.current.offsetWidth;
      const offsetHeight = groundRef.current.offsetHeight;
      canvasSize.current = {
        width: scale > 1 ? Math.round(scale * offsetWidth) : offsetWidth,
        height: scale > 1 ? Math.round(scale * offsetHeight) : offsetHeight,
      };

      // console.log("canvasSize", canvasSize.current);

      [backgroundCanvasRef.current, temporaryCanvasRef.current].forEach(
        (canvas) => {
          canvas.width = canvasSize.current.width;
          canvas.height = canvasSize.current.height;
        }
      );
      drawElementsOnCanvas(scale);
    }
  };

  const drawElementsOnCanvas = (scale: number) => {
    if (!backgroundCanvasRef.current) {
      return;
    }

    const ctx = backgroundCanvasRef.current.getContext("2d");
    if (!ctx) {
      return;
    }

    const temporaryCtx = temporaryCanvasRef.current?.getContext("2d") || null;

    const { left, top } = backgroundCanvasRef.current.getBoundingClientRect();
    const { scrollLeft, scrollTop } = groundRef.current || {
      scrollLeft: 0,
      scrollTop: 0,
    };
    const offset = { left: left + scrollLeft, top: top + scrollTop };

    drawAllDesignElements({
      ctx,
      temporaryCtx,
      elements: designElements,
      offset,
      selectedElementId: selectedDesignElement,
      scale,
    });
  };

  const clicOnLine = (mouseX: number, mouseY: number) => {
    if (!isInOverlapContainer(mouseX, mouseY)) {
      return false;
    }

    // clic on a vertical line
    const clickedVerticalLine = verticalAxis.current.find(
      (x) => Math.abs(x - mouseX) <= 5
    );
    // clic on a vertical line
    if (clickedVerticalLine !== undefined) {
      selectedAlignmentLine.current = {
        type: "vertical",
        position: clickedVerticalLine,
      };
      moveLine(mouseX, mouseY);
      return true;
    }

    // clic on a horizontal line
    const clickedHorizontalLine = horizontalAxis.current.find(
      (y) => Math.abs(y - mouseY) <= 5
    );

    if (clickedHorizontalLine !== undefined) {
      // clic on a horizontal line
      selectedAlignmentLine.current = {
        type: "horizontal",
        position: clickedHorizontalLine,
      };
      moveLine(mouseX, mouseY);
      return true;
    }
    return false;
  };

  const handleMouseDown = (e: MouseEvent) => {
    // e.preventDefault();

    // Tenir compte du scroll de la fenêtre pour calculer la position de la souris
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Verify if the click is on a line
    if (clicOnLine(clientX, clientY)) {
      return;
    }

    // clic outside the container start selecting new position of the container
    handleStart(clientX, clientY);
  };

  const getOffset = (axe: "x" | "y") => {
    if (!groundRef.current) {
      return 0;
    }
    if (axe === "x") {
      return (
        groundRef.current.scrollLeft -
        groundRef.current.getBoundingClientRect().left
      );
    }
    return (
      groundRef.current.scrollTop -
      groundRef.current.getBoundingClientRect().top
    );
  };

  const moveLine = (mouseX: number, mouseY: number) => {
    if (selectedAlignmentLine.current === null) {
      return false;
    }

    if (selectedAlignmentLine.current.type === "vertical") {
      const index = verticalAxis.current.findIndex(
        (x) => x === selectedAlignmentLine.current?.position
      );
      if (index !== -1) {
        verticalAxis.current[index] = mouseX;
        const group = alignmentGroups.current.vertical[index];
        if (group) {
          group.position = mouseX; // Update position in group
          const elementIds = group.elements.map((el) => el.id);
          onHorizontalMove(mouseX + getOffset("x"), elementIds);
        }
        // update selectedAlignmentLine position
        selectedAlignmentLine.current.position = mouseX;
      }
    } else {
      const index = horizontalAxis.current.findIndex(
        (y) => y === selectedAlignmentLine.current?.position
      );
      if (index !== -1) {
        horizontalAxis.current[index] = mouseY;
        const group = alignmentGroups.current.horizontal[index];
        if (group) {
          group.position = mouseY; // Mettre à jour la position dans le groupe
          const elementIds = group.elements.map((el) => el.id);
          onVerticalMove(mouseY + getOffset("y"), elementIds);
        }
        // update selectedAlignmentLine position
        selectedAlignmentLine.current.position = mouseY;
      }
    }

    // redraw alignment lines
    drawAlignmentLines({
      vertical: verticalAxis.current,
      horizontal: horizontalAxis.current,
    });

    return true;
  };

  const cursorStyle = (mouseX: number, mouseY: number) => {
    if (
      !temporaryCanvasRef.current ||
      !groundRef.current ||
      !containerRef.current
    )
      return;

    const isNearVerticalLine = verticalAxis.current.some(
      (x) => Math.abs(x - mouseX) <= 5
    );
    const isNearHorizontalLine = horizontalAxis.current.some(
      (y) => Math.abs(y - mouseY) <= 5
    );

    let cursorStyle = "default";
    if (isInOverlapContainer(mouseX, mouseY)) {
      if (isNearVerticalLine) {
        cursorStyle = "ew-resize";
      } else if (isNearHorizontalLine) {
        cursorStyle = "ns-resize";
      }
    }

    if (cursorStyle !== temporaryCanvasRef.current.style.cursor) {
      temporaryCanvasRef.current.style.cursor = cursorStyle;
      if (containerRef.current) {
        containerRef.current.style.cursor =
          cursorStyle === "default" ? "move" : cursorStyle;
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!temporaryCanvasRef.current || !groundRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (moveLine(clientX, clientY)) {
      return;
    }

    cursorStyle(clientX, clientY);
    handleMove(clientX, clientY);
  };

  const handleMouseUp = () => {
    if (selectedAlignmentLine.current !== null) {
      selectedAlignmentLine.current = null;
    }
    handleEnd();
  };

  const equalizeSpaces = (type: "vertical" | "horizontal") => {
    const axes =
      type === "vertical" ? verticalAxis.current : horizontalAxis.current;
    if (axes.length <= 2) return;

    const firstAxis = Math.min(...axes);
    const lastAxis = Math.max(...axes);
    const totalSpace = lastAxis - firstAxis;
    const equalSpace = totalSpace / (axes.length - 1);

    const newAxes = axes.map((_, index) => firstAxis + index * equalSpace);

    const groups =
      type === "vertical"
        ? alignmentGroups.current.vertical
        : alignmentGroups.current.horizontal;

    // Get the coordinates left and top of the ground element
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

    // update axes and redraw alignment lines
    if (type === "vertical") {
      verticalAxis.current = newAxes;
    } else {
      horizontalAxis.current = newAxes;
    }
    drawAlignmentLines({
      vertical: verticalAxis.current,
      horizontal: horizontalAxis.current,
    });

    // ensure showAlignmentLines is true
    setShowAlignmentLines(true);
  };

  const clearTemporaryCanvas = () => {
    if (!temporaryCanvasRef.current) return;
    const ctx = temporaryCanvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  };

  useEffect(() => {
    resizeCanvas(scale);
    window.addEventListener("resize", () => resizeCanvas(scale));
    // hide the selection zone when the scale changes
    if (containerRef.current) {
      containerRef.current.style.display = "none";
    }
    // on resize clear the temporary canvas
    clearTemporaryCanvas();
    setShowAlignmentLines(false);
    itemSelectedRef.current = false;

    return () =>
      window.removeEventListener("resize", () => resizeCanvas(scale));
  }, [scale]);

  useEffect(() => {
    if (!backgroundCanvasRef.current) {
      return;
    }

    drawElementsOnCanvas(scale);
  }, [designElements, selectedDesignElement, scale]);

  useEffect(() => {
    if (!preSelection || !containerRef.current) {
      return; // no preSelection
    }
    const { left, top, width, height } = preSelection;

    containerRef.current.style.left = `${left}px`;
    containerRef.current.style.top = `${top}px`;
    containerRef.current.style.width = `${width}px`;
    containerRef.current.style.height = `${height}px`;
    containerRef.current.style.display = "block";
  }, [preSelection]);

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
      // e.preventDefault();
      if (clicOnLine(touch.clientX, touch.clientY)) {
        return;
      }
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      // e.preventDefault();
      if (moveLine(touch.clientX, touch.clientY)) {
        return;
      }
      handleMove(touch.clientX, touch.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleEnd();
        if (containerRef.current) {
          containerRef.current.style.display = "none";
        }
        selectedAlignmentLine.current = null;
        setShowAlignmentLines(false);
        clearTemporaryCanvas();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    ground.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      ground.removeEventListener("mousedown", handleMouseDown);
      ground.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const { left, top, width, height } =
    containerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
  const ground = groundRef.current?.getBoundingClientRect() || {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

  return (
    <div
      ref={groundRef}
      id={id}
      className="overflow-auto relative w-full h-full"
    >
      <canvas
        ref={backgroundCanvasRef}
        id="background-canvas"
        className="overflow-visible absolute top-0 left-0"
      />
      <canvas
        ref={temporaryCanvasRef}
        id="temporary-canvas"
        className="overflow-visible absolute top-0 left-0"
      />
      <div
        ref={containerRef}
        id={idContainer}
        className="absolute bg-gray-200 bg-opacity-20 border border-gray-500 border-dashed cursor-move"
        style={{ display: "none" }}
      />
      {showAlignmentLines && (
        <>
          {verticalAxis.current.length > 2 && (
            <button
              className="absolute px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1/2 translate-y-1"
              onClick={() => equalizeSpaces("vertical")}
              style={{
                left: left - 15 + width / 2 - ground.left,
                top: top + 2 - ground.top,
              }}
            >
              =
            </button>
          )}
          {horizontalAxis.current.length > 2 && (
            <button
              className="absolute px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1 -translate-y-1/2"
              onClick={() => equalizeSpaces("horizontal")}
              style={{
                left: left + 5 - ground.left,
                top: top - 15 + height / 2 - ground.top,
              }}
            >
              =
            </button>
          )}
        </>
      )}
      {children}
    </div>
  );
};
