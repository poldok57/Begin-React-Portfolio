import React, { useRef, useEffect, useState } from "react";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { changeToucheMessage } from "../scripts/canvas-size";
import { useRoomContext } from "../RoomProvider";
import { isTouchDevice } from "@/lib/utils/device";
import { Canvas } from "./Canvas";
import { SelectionContainer } from "./SelectionContainer";
import { AlignmentButtons } from "./AlignmentButtons";
import { useAlignmentLogic } from "./hooks/useAlignmentLogic";
import { useGroundSelectionLogic } from "./hooks/useGroundSelectionLogic";

const TOUCH_MESSAGE_ID = "touch-message";

interface GroundSelectionProps {
  onSelectionStart: () => void;
  onSelectionEnd: (rect: Rectangle | null) => void;
  id: string;
  preSelection: Rectangle | null;
  children: React.ReactNode;
  containerId?: string;
  typeListMode?: "plan" | "list";
  changeCoordinates: ({
    position,
    offset,
    rotation,
    tableIds,
  }: {
    position?: { left?: number; top?: number };
    offset?: { left?: number; top?: number };
    rotation?: number;
    tableIds?: string[] | null;
  }) => void;
}

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
      containerId = "container",
      typeListMode,
    },
    ref
  ) => {
    const { mode, scale, rotation, setSelectedRect, setRotation, getRotation } =
      useRoomContext();
    const groundRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const temporaryCanvasRef = useRef<HTMLCanvasElement>(null);

    const numberOfAlignmentsRef = useRef({ vertical: 0, horizontal: 0 });
    const [showAlignmentLines, setShowAlignmentLines] = useState(false);
    const previousPosition = useRef<Position | null>(null);

    React.useImperativeHandle(ref, () => groundRef.current as HTMLDivElement);

    const clearTemporaryCanvas = () => {
      if (!temporaryCanvasRef.current) return;
      const ctx = temporaryCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    };

    const alignmentLinesRef = useRef(false);

    const drawAxe = () => {
      numberOfAlignmentsRef.current = findAlignments();
      if (numberOfAlignmentsRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setShowAlignmentLines(true);

        clearTemporaryCanvas();
        if (getRotation() === 0) {
          drawAlignmentLines(rect);
          alignmentLinesRef.current = true;
        }
      }
    };

    const selectZone = (rect: DOMRect | null) => {
      onSelectionEnd(rect);

      if (rect === null) {
        numberOfAlignmentsRef.current = { vertical: 0, horizontal: 0 };
        setRotation(0);
        clearTemporaryCanvas();
        setShowAlignmentLines(false);
        return;
      }

      findElementsInContainer(containerRef.current);
      numberOfAlignmentsRef.current = findAlignments();
      if (!numberOfAlignmentsRef.current) {
        setShowAlignmentLines(false);
        return;
      }

      clearTemporaryCanvas();
      if (getRotation() === 0) {
        drawAlignmentLines(rect);
      }
      setShowAlignmentLines(
        numberOfAlignmentsRef.current.vertical > 0 ||
          numberOfAlignmentsRef.current.horizontal > 0
      );
    };

    const {
      moveLine,
      clicOnLine,
      stopMoveLine,
      findAlignments,
      findElementsInContainer,
      cursorStyle,
      drawAlignmentLines,
      equalizeSpaces,
    } = useAlignmentLogic(groundRef, temporaryCanvasRef, changeCoordinates);

    const { getOffsetX, getOffsetY, handleStart, handleMove, handleEnd } =
      useGroundSelectionLogic(
        groundRef,
        containerRef,
        onSelectionStart,
        changeCoordinates,
        setSelectedRect,
        setShowAlignmentLines,
        clearTemporaryCanvas,
        drawAxe,
        selectZone
      );

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

    const handleMouseDown = (e: MouseEvent) => {
      // Tenir compte du scroll de la fenêtre pour calculer la position de la souris
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Verify if the click is on a line

      if (
        isInOverlapContainer(clientX, clientY) &&
        clicOnLine(clientX, clientY)
      ) {
        e.preventDefault();
        return;
      }

      // clic outside the container start selecting new position of the container
      if (handleStart(clientX, clientY)) {
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!temporaryCanvasRef.current || !groundRef.current) return;

      const clientX = e.clientX;
      const clientY = e.clientY;

      if (moveLine(clientX, clientY)) {
        return;
      }

      const cursor = cursorStyle(
        clientX,
        clientY,
        isInOverlapContainer(clientX, clientY)
      );
      if (cursor) {
        temporaryCanvasRef.current.style.cursor = cursor;
        // if (groundRef.current) {
        //   groundRef.current.style.cursor = cursor;
        // }
        if (containerRef.current) {
          containerRef.current.style.cursor = cursor;
        }
        groundRef.current.style.cursor = cursor;
      }
      handleMove(clientX, clientY);
    };

    const handleMouseUp = () => {
      stopMoveLine();
      previousPosition.current = null;
      handleEnd();
    };

    useEffect(() => {
      if (rotation !== 0) {
        setShowAlignmentLines(false);
        clearTemporaryCanvas();
      }
    }, [rotation]);

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

    useEffect(() => {
      const ground = groundRef.current;
      if (!ground) {
        console.log("ground not found");
        return;
      }

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!groundRef.current) {
          return;
        }
        if (e.touches.length > 1) {
          groundRef.current.style.touchAction = "auto";
          return;
        }
        groundRef.current.style.touchAction = "none";

        if (
          isInOverlapContainer(touch.clientX, touch.clientY) &&
          clicOnLine(touch.clientX, touch.clientY)
        ) {
          e.preventDefault();
          return;
        }
        if (!handleStart(touch.clientX, touch.clientY)) {
          changeToucheMessage(groundRef.current, TOUCH_MESSAGE_ID);
        }
        // event.preventDefault(); should not be used because it prevent click on buttons
      };

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (e.touches.length > 1) {
          return;
        }
        if (moveLine(touch.clientX, touch.clientY)) {
          e.preventDefault();
          return;
        }
        if (handleMove(touch.clientX, touch.clientY)) {
          e.preventDefault();
          return;
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleEnd();
          if (containerRef.current) {
            containerRef.current.style.display = "none";
          }
          stopMoveLine();
          setShowAlignmentLines(false);
          clearTemporaryCanvas();
          setSelectedRect(null);
          setRotation(0);
        }
      };

      const handleTouchEnd = () => {
        handleMouseUp();
      };

      ground.addEventListener("mousedown", handleMouseDown);
      ground.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      document.addEventListener("keydown", handleKeyDown);
      ground.addEventListener("touchstart", handleTouchStart);
      ground.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        ground.removeEventListener("mousedown", handleMouseDown);
        ground.removeEventListener("touchstart", handleTouchStart);
        ground.removeEventListener("mousemove", handleMouseMove);
        ground.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

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
        {typeListMode === "plan" && (
          <>
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
            <Canvas
              backgroundCanvasRef={backgroundCanvasRef}
              temporaryCanvasRef={temporaryCanvasRef}
              mode={mode}
            />

            <SelectionContainer
              containerRef={containerRef}
              containerId={containerId}
              rotation={rotation}
            />
            {showAlignmentLines && rotation === 0 && (
              <AlignmentButtons
                offsetX={getOffsetX()}
                offsetY={getOffsetY()}
                showVerticalBtn={numberOfAlignmentsRef.current.vertical > 2}
                showHorizontalBtn={numberOfAlignmentsRef.current.horizontal > 2}
                equalizeSpaces={equalizeSpaces}
                container={containerRef.current}
              />
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
