import React, { useRef, useEffect, useState } from "react";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { coordinateIsInsideRect } from "@/lib/mouse-position";
import { useTableDataStore } from "./stores/tables";
import { drawAllDesignElements } from "./design-elements";
import { getCanvasSize, changeToucheMessage } from "./canvas-size";
import { useScale } from "./RoomProvider";
import { useDebounce } from "@/hooks/useDebounce";
import { isTouchDevice } from "@/lib/utils/device";

const TOUCH_MESSAGE_ID = "touch-message";

interface GroundSelectionProps {
  onSelectionStart: () => void;
  onSelectionEnd: (rect: Rectangle | null) => void;
  id: string;
  preSelection: Rectangle | null;
  children: React.ReactNode;
  idContainer?: string;
  changeCoordinates: ({
    position,
    offset,
    tableIds,
  }: {
    position?: { left?: number; top?: number };
    offset?: { left?: number; top?: number };
    tableIds?: string[] | null;
  }) => void;
}
type AxisLineType = "vertical" | "horizontal";

type AxisLine = {
  type: AxisLineType;
  position: number;
};
type AxisGroup = {
  position: number;
  elements: HTMLDivElement[];
};

const LINE_OVERLAP = 30;

export const GroundSelection = React.forwardRef<
  HTMLDivElement,
  GroundSelectionProps
>(
  (
    {
      onSelectionStart,
      onSelectionEnd,
      changeCoordinates,
      id,
      preSelection,
      children,
      idContainer = "container",
    },
    ref
  ) => {
    const { scale, setSelectedRect, setScale, getScale } = useScale();
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
    const selectedAlignmentLine = useRef<AxisLine | null>(null);
    const alignmentGroups = useRef<{
      vertical: AxisGroup[];
      horizontal: AxisGroup[];
    }>({ vertical: [], horizontal: [] });
    const [showAlignmentLines, setShowAlignmentLines] = useState(false);

    React.useImperativeHandle(ref, () => groundRef.current as HTMLDivElement);

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

    const scaleRef = useRef(scale);
    const previousPosition = useRef<Position | null>(null);

    const getOffsetX = () => {
      if (!groundRef.current || !containerRef.current) return 0;
      return (
        groundRef.current.scrollLeft -
        groundRef.current.getBoundingClientRect().left
      );
    };
    const getOffsetY = () => {
      if (!groundRef.current || !containerRef.current) return 0;
      return (
        groundRef.current.scrollTop -
        groundRef.current.getBoundingClientRect().top
      );
    };

    const handleStart = (clientX: number, clientY: number) => {
      if (!groundRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      previousPosition.current = {
        left: clientX,
        top: clientY,
      };

      if (coordinateIsInsideRect({ x: clientX, y: clientY }, containerRect)) {
        //  console.log("clic inside the container");

        // Clic inside the container start moving the container
        areaOffsetRef.current = {
          left: containerRef.current.offsetLeft - clientX,
          top: containerRef.current.offsetTop - clientY,
        };

        onSelectionStart();
        return true;
      }

      isSelectingRef.current = true;
      itemSelectedRef.current = false;
      startPos.current = {
        left: clientX + getOffsetX(),
        top: clientY + getOffsetY(),
      };

      setSelectedRect(null);

      containerRef.current.style.display = "block";
      containerRef.current.style.left = `${clientX}px`;
      containerRef.current.style.top = `${clientY}px`;
      containerRef.current.style.width = "0px";
      containerRef.current.style.height = "0px";

      setShowAlignmentLines(false);
      return false;
    };

    const elementsInContainer = useRef<HTMLDivElement[]>([]);

    const findElementsInContainer = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect || !groundRef.current) return null;

      const children = Array.from(groundRef.current.children);

      const isInContainer = (rect: DOMRect) => {
        return (
          rect.left >= containerRect.left &&
          rect.right <= containerRect.right &&
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom
        );
      };

      elementsInContainer.current = children.filter(
        (child): child is HTMLDivElement => {
          return (
            child instanceof HTMLDivElement &&
            child !== containerRef.current &&
            isInContainer(child.getBoundingClientRect())
          );
        }
      );
    };

    const findAlignments = () => {
      const tolerance = 6; // tolerance for alignment
      alignmentGroups.current = { vertical: [], horizontal: [] };
      elementsInContainer.current.forEach((el) => {
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

    const alignmentLinesRef = useRef(false);

    const drawAlignmentLines = (alignments: {
      vertical: number[];
      horizontal: number[];
    }) => {
      if (!temporaryCanvasRef.current || !groundRef.current) return;

      const offsetLeft = getOffsetX();
      const offsetTop = getOffsetY();

      // get container rect

      const container = containerRef.current?.getBoundingClientRect();

      const ctx = temporaryCanvasRef.current.getContext("2d");
      if (!ctx || !container) return;

      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
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
      alignmentLinesRef.current = true;
    };

    const drawAxe = () => {
      const alignments = findAlignments();
      if (alignments) {
        verticalAxis.current = alignments.vertical;
        horizontalAxis.current = alignments.horizontal;
        setShowAlignmentLines(true);
        drawAlignmentLines(alignments);
      }
    };
    const debounceDrawAxe = useDebounce(drawAxe, 500);

    const moveItems = (clientX: number, clientY: number) => {
      const offset = previousPosition.current
        ? {
            left: (clientX - previousPosition.current.left) / scaleRef.current,
            top: (clientY - previousPosition.current.top) / scaleRef.current,
          }
        : {
            left: 0,
            top: 0,
          };
      previousPosition.current = {
        left: clientX,
        top: clientY,
      };

      changeCoordinates({ offset });
    };

    const debouncedSetSelectedRect = useDebounce(
      (rect: { left: number; top: number; width: number; height: number }) => {
        setSelectedRect(rect);
      },
      300
    );
    const handleMove = (clientX: number, clientY: number) => {
      if (!groundRef.current || !containerRef.current) return;

      if (areaOffsetRef.current) {
        // move container
        const newLeft = Math.round(clientX + areaOffsetRef.current.left);
        const newTop = Math.round(clientY + areaOffsetRef.current.top);

        moveItems(clientX, clientY);

        containerRef.current.style.left = `${newLeft}px`;
        containerRef.current.style.top = `${newTop}px`;

        debouncedSetSelectedRect({
          left: newLeft,
          top: newTop,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });

        if (alignmentLinesRef.current) {
          alignmentLinesRef.current = false;
          clearTemporaryCanvas();
        }
        debounceDrawAxe();

        return;
      }

      // select first corner of the container
      if (isSelectingRef.current && startPos.current) {
        const endLeft = clientX + getOffsetX();
        const endTop = clientY + getOffsetY();

        const width = Math.abs(Math.round(endLeft - startPos.current.left));
        const height = Math.abs(Math.round(endTop - startPos.current.top));
        containerRef.current.style.width = `${width}px`;
        containerRef.current.style.height = `${height}px`;
        containerRef.current.style.left = `${Math.round(
          Math.min(startPos.current.left, endLeft)
        )}px`;
        containerRef.current.style.top = `${Math.round(
          Math.min(startPos.current.top, endTop)
        )}px`;

        debouncedSetSelectedRect({
          left: Math.round(Math.min(startPos.current.left, endLeft)),
          top: Math.round(Math.min(startPos.current.top, endTop)),
          width: width,
          height: height,
        });
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

      findElementsInContainer();
      const alignments = findAlignments();
      if (!alignments) {
        setShowAlignmentLines(false);
        verticalAxis.current = [];
        horizontalAxis.current = [];
        return;
      }
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

        const { width, height } = getCanvasSize(groundRef.current);

        // Ajustement des dimensions du canvas
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

      drawAllDesignElements({
        ctx,
        temporaryCtx,
        elements: designElements,
        selectedElementId: selectedDesignElement,
        ground: groundRef.current,
        scale,
      });
    };

    const moveVerticalLine = (index: number, mouseX: number) => {
      if (index < 0) return;
      verticalAxis.current[index] = mouseX;
      const group = alignmentGroups.current.vertical[index];
      if (group) {
        group.position = mouseX;
        const elementIds = group.elements.map((el) => el.id);
        changeCoordinates({
          position: { left: (mouseX + getOffsetX()) / scaleRef.current },
          tableIds: elementIds,
        });
        if (selectedAlignmentLine.current) {
          selectedAlignmentLine.current.position = mouseX;
        }
      }
    };

    const moveHorizontalLine = (index: number, mouseY: number) => {
      if (index < 0) return;
      horizontalAxis.current[index] = mouseY;
      const group = alignmentGroups.current.horizontal[index];
      if (group) {
        group.position = mouseY;

        const elementIds = group.elements.map((el) => el.id);
        changeCoordinates({
          position: { top: (mouseY + getOffsetY()) / scaleRef.current },
          tableIds: elementIds,
        });

        if (selectedAlignmentLine.current) {
          selectedAlignmentLine.current.position = mouseY;
        }
      }
    };

    const clicOnLine = (mouseX: number, mouseY: number) => {
      if (!isInOverlapContainer(mouseX, mouseY)) {
        return false;
      }

      const indexV = verticalAxis.current.findIndex(
        (x) => Math.abs(x - mouseX) <= 5
      );
      // clic on a vertical line
      if (indexV !== -1) {
        const clickedVerticalLine = alignmentGroups.current.vertical[indexV];
        selectedAlignmentLine.current = {
          type: "vertical",
          position: clickedVerticalLine.position,
        };
        moveVerticalLine(indexV, mouseX);
        return true;
      }

      // clic on a horizontal line
      const indexH = horizontalAxis.current.findIndex(
        (y) => Math.abs(y - mouseY) <= 5
      );

      if (indexH !== -1) {
        const clickedHorizontalLine =
          alignmentGroups.current.horizontal[indexH];
        selectedAlignmentLine.current = {
          type: "horizontal",
          position: clickedHorizontalLine.position,
        };
        moveHorizontalLine(indexH, mouseY);
        return true;
      }
      return false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Tenir compte du scroll de la fenêtre pour calculer la position de la souris
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Verify if the click is on a line
      if (clicOnLine(clientX, clientY)) {
        e.preventDefault();
        return;
      }

      // clic outside the container start selecting new position of the container
      if (handleStart(clientX, clientY)) {
        e.preventDefault();
      }
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
          moveVerticalLine(index, mouseX);
        }
      } else {
        const index = horizontalAxis.current.findIndex(
          (y) => y === selectedAlignmentLine.current?.position
        );
        if (index !== -1) {
          moveHorizontalLine(index, mouseY);
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
      previousPosition.current = null;
      handleEnd();
    };

    const equalizeSpaces = (type: "vertical" | "horizontal") => {
      const axes =
        type === "vertical" ? verticalAxis.current : horizontalAxis.current;
      if (axes.length <= 2) return;

      const firstAxis = Math.round(Math.min(...axes));
      const lastAxis = Math.round(Math.max(...axes));
      const totalSpace = lastAxis - firstAxis;
      const equalSpace = Math.round(totalSpace / (axes.length - 1));

      axes.forEach((_, index) => {
        const newPos = firstAxis + index * equalSpace;
        if (type === "vertical") {
          moveVerticalLine(index, Math.round(newPos));
        } else {
          moveHorizontalLine(index, Math.round(newPos));
        }
      });

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
      scaleRef.current = scale;
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

      containerRef.current.style.left = `${left * scale}px`;
      containerRef.current.style.top = `${top * scale}px`;
      containerRef.current.style.width = `${width * scale}px`;
      containerRef.current.style.height = `${height * scale}px`;
      containerRef.current.style.display = "block";
    }, [preSelection]);

    const intervalPoints = useRef(0);

    const calculateScale = (e: TouchEvent) => {
      // Calculate the distance between the two touch points
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      if (intervalPoints.current === 0) {
        intervalPoints.current = distance;
        return;
      }
      const scale = getScale();
      const ratio = distance / intervalPoints.current;
      intervalPoints.current = distance;
      setScale(scale * ratio);
    };

    const debouncedCalculateScale = useDebounce(calculateScale, 250);

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
        if (!groundRef.current) {
          return;
        }
        if (e.touches.length > 1) {
          groundRef.current.style.touchAction = "auto";
          // Calculate the distance between the two touch points
          calculateScale(e);
          return;
        }
        groundRef.current.style.touchAction = "none";

        if (clicOnLine(touch.clientX, touch.clientY)) {
          e.preventDefault();
          return;
        }
        if (!handleStart(touch.clientX, touch.clientY)) {
          changeToucheMessage(groundRef.current, TOUCH_MESSAGE_ID);
        }
        // e.preventDefault(); should not be used because it prevent click on buttons
      };

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (e.touches.length > 1) {
          // Calculate the distance between the two touch points
          debouncedCalculateScale(e);
          return;
        }
        // console.log("touch move", touch.clientX, touch.clientY);
        e.preventDefault();
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
          setSelectedRect(null);
        }
      };

      const handleTouchEnd = () => {
        intervalPoints.current = 0;
        handleMouseUp();
      };

      document.addEventListener("keydown", handleKeyDown);

      ground.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        ground.removeEventListener("mousedown", handleMouseDown);
        ground.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchend", handleTouchEnd);
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

    useEffect(() => {
      // Check if the background canvas is not defined or has no width
      if (
        groundRef.current &&
        (!backgroundCanvasRef.current ||
          backgroundCanvasRef.current.offsetWidth <
            groundRef.current?.offsetWidth)
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
    }, [backgroundCanvasRef.current, groundRef.current]);

    useEffect(() => {
      if (isTouchDevice()) {
        const handleResize = () => {
          changeToucheMessage(groundRef.current, TOUCH_MESSAGE_ID);
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      }
    }, []);

    return (
      <div
        ref={groundRef}
        id={id}
        style={{ touchAction: "none" }}
        className="overflow-auto relative inset-0 w-full h-full"
      >
        <div className="flex absolute top-2 right-2 flex-col px-2 py-1 bg-gray-200 rounded border border-gray-300 opacity-70">
          <span className="text-sm font-semibold">
            Scale : {scale.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-gray-500">
            Size : {backgroundCanvasRef.current?.offsetWidth} x{" "}
            {backgroundCanvasRef.current?.offsetHeight}
          </span>
        </div>
        <div
          id={TOUCH_MESSAGE_ID}
          className="fixed right-2 bottom-2 p-2 text-white bg-gray-800 rounded md:block"
          style={{
            display: "none",
            transition: "display 0.3s ease-in-out",
          }}
        >
          Use 2 fingers to move the screen
        </div>
        <canvas
          ref={backgroundCanvasRef}
          id="background-canvas"
          className="overflow-visible absolute top-0 left-0 border-r border-b border-gray-500 border-dashed"
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
                  left: left - 15 + width / 2 + getOffsetX(),
                  top: top + getOffsetY(),
                }}
              >
                =
              </button>
            )}
            {horizontalAxis.current.length > 2 && (
              <button
                className="sticky px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1 -translate-y-1/2"
                onClick={() => equalizeSpaces("horizontal")}
                style={{
                  left: left + getOffsetX(),
                  top: top - 15 + height / 2 + getOffsetY(),
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
  }
);

GroundSelection.displayName = "GroundSelection";
export default GroundSelection;
