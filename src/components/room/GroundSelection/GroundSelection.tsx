import React, { useRef, useEffect, useState } from "react";
import { Rectangle } from "@/lib/canvas/types";
import { useRoomStore } from "@/lib/stores/room";
import { isTouchDevice } from "@/lib/utils/device";
import { generateUniqueId } from "@/lib/utils/unique-id";

import { Canvas } from "./Canvas";
// import { SelectionContainer } from "./SelectionContainer";
import { AlignmentButtons } from "./AlignmentButtons";
import { useAlignmentLogic } from "./hooks/useAlignmentLogic";
import { useGroundSelectionLogic } from "./hooks/useGroundSelectionLogic";
import { useZustandDesignStore } from "@/lib/stores/design";
import { Mode, TypeListTables } from "../types";
import { ScrollButtons } from "./ScrollButtons";
import { useTablePositioning } from "./hooks/useTablePositioning";

interface GroundSelectionProps {
  id: string;
  children: React.ReactNode;
  typeListMode?: TypeListTables;
}

export const GroundSelection = React.forwardRef<
  HTMLDivElement,
  GroundSelectionProps
>(({ id, children, typeListMode }, ref) => {
  const {
    getMode,
    scale,
    setScale,
    rotation,
    setSelectedRect,
    getSelectedRect,
    setRotation,
    getRotation,
    designStoreName,
    clearTemporaryCanvas,
    getPreSelection,
  } = useRoomStore();

  const groundRef = useRef<HTMLDivElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const temporaryCanvasRef = useRef<HTMLCanvasElement>(null);

  const numberOfAlignmentsRef = useRef({ vertical: 0, horizontal: 0 });
  const uniqueIdRef: React.MutableRefObject<string | null> = useRef(null);
  const [showAlignmentLines, setShowAlignmentLines] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const preSelection = getPreSelection();

  const { changeCoordinates, onSelectionStart, onSelectionEnd } =
    useTablePositioning();

  const [, setToRefresh] = useState(Number);

  const needRefreshCanvas = () => {
    setToRefresh((prev) => prev + 1);
  };

  const store = useZustandDesignStore(designStoreName);

  let backgroundColor = store.getState().backgroundColor;

  useEffect(() => {
    backgroundColor = store.getState().backgroundColor;
    setShowAlignmentLines(false);
    moveContainer(null);
    setSelectedRect(null);
  }, [designStoreName]);

  useEffect(() => {
    // if the selection is null, we need to hide the alignment lines
    if (getSelectedRect() === null) {
      setShowAlignmentLines(false);
    }
  }, [getSelectedRect]);

  React.useImperativeHandle(ref, () => groundRef.current as HTMLDivElement);

  const drawAxe = () => {
    numberOfAlignmentsRef.current = findAlignments(getMode());
    // console.log("drawAxe", numberOfAlignmentsRef.current);
    if (numberOfAlignmentsRef.current) {
      setShowAlignmentLines(true);

      clearTemporaryCanvas("drawAxe");
      if (getRotation() === 0) {
        const rect = getContainerRect();

        refreshContainer();
        drawAlignmentLines(rect);
      }
    }
  };

  /**
   * Select the zone
   * @param rect - The rectangle
   */
  const selectZone = (rect: Rectangle | null) => {
    onSelectionEnd(rect);

    if (rect === null) {
      // start a new selection
      numberOfAlignmentsRef.current = { vertical: 0, horizontal: 0 };
      setRotation(0);
      // clearTemporaryCanvas("select Zone 1");
      setShowAlignmentLines(false);
      return;
    }

    findElementsInContainer();
    numberOfAlignmentsRef.current = findAlignments(getMode());
    if (!numberOfAlignmentsRef.current) {
      setShowAlignmentLines(false);
      return;
    }

    if (getRotation() === 0) {
      drawAlignmentLines(rect);
    }
    setShowAlignmentLines(
      numberOfAlignmentsRef.current.vertical > 0 ||
        numberOfAlignmentsRef.current.horizontal > 0
    );
  };
  const {
    isInOverlapContainer,
    getContainerRect,
    getGroundOffset,
    handleStart,
    handleMove,
    handleEnd,
    moveContainer,
    refreshContainer,
  } = useGroundSelectionLogic(
    groundRef,
    onSelectionStart,
    changeCoordinates,
    setSelectedRect,
    setShowAlignmentLines,
    drawAxe,
    selectZone,
    uniqueIdRef
  );

  const {
    moveLine,
    clicOnLine,
    stopMoveLine,
    findAlignments,
    findElementsInContainer,
    cursorStyle,
    drawAlignmentLines,
    equalizeSpaces,
  } = useAlignmentLogic(
    groundRef,
    temporaryCanvasRef,
    changeCoordinates,
    getGroundOffset,
    getContainerRect,
    refreshContainer,
    uniqueIdRef
  );

  const disableAction = () => {
    if (getMode() === Mode.draw) {
      return true;
    }
    return false;
  };

  /**
   * Handle the start action for mouse and touch events
   * @param e - The event
   * @param clientX - The clientX
   * @param clientY - The clientY
   * @returns true if the action is handled, false otherwise
   */
  const handleStartAction = (
    e: MouseEvent | TouchEvent,
    clientX: number,
    clientY: number
  ) => {
    // Only set isWorking if the target is the canvas
    if (e.target === groundRef.current) {
      setIsWorking(true);
      uniqueIdRef.current = generateUniqueId("key");
      // console.log("uniqueId", uniqueIdRef.current);
    }

    // Verify if the click is on a line
    const { inOverlap } = isInOverlapContainer(clientX, clientY);

    if (inOverlap && clicOnLine(clientX, clientY)) {
      e.preventDefault();
      return true;
    }

    // clic outside the container start selecting new position of the container
    if (handleStart(clientX, clientY)) {
      e.preventDefault();
      return true;
    }
    return false;
  };

  /**
   * Handle the mouse down event
   * @param e - The event
   */
  const handleMouseDown = (e: MouseEvent) => {
    if (disableAction()) {
      return;
    }

    // Take into account window scroll to calculate mouse position
    if (handleStartAction(e, e.clientX, e.clientY)) {
      return;
    }
  };

  /**
   * Handle the touch start event
   * @param e - The event
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (disableAction() || !groundRef.current) {
      return;
    }

    // Multi-touch is now handled in ScrollButtons component
    if (e.touches.length > 1) {
      return;
    }

    const touch = e.touches[0];

    groundRef.current.style.touchAction = "none";

    if (handleStartAction(e, touch.clientX, touch.clientY)) {
      return;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (disableAction() || !temporaryCanvasRef.current || !groundRef.current)
      return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (moveLine(clientX, clientY)) {
      return;
    }

    const { inOverlap, inContainer, showContainer } = isInOverlapContainer(
      clientX,
      clientY
    );

    if (showContainer) {
      const cursor = cursorStyle(clientX, clientY, inOverlap, inContainer);

      if (cursor) {
        // console.log("cursor", cursor);
        temporaryCanvasRef.current.style.cursor = cursor;
        groundRef.current.style.cursor = cursor;
      }
      // Only call handleMove if a mouse button is pressed
      if (inOverlap || e.buttons > 0) {
        handleMove(clientX, clientY, getMode());
      }
      return;
    }

    // no container so we can move the ground
    temporaryCanvasRef.current.style.cursor = "default";
    // Only call handleMove if a mouse button is pressed
    if (e.buttons > 0) {
      handleMove(clientX, clientY, getMode());
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disableAction()) {
      return;
    }

    // Multi-touch is now handled in ScrollButtons component
    if (e.touches.length > 1) {
      return;
    }

    const touch = e.touches[0];
    if (moveLine(touch.clientX, touch.clientY)) {
      e.preventDefault();
      return;
    }
    if (handleMove(touch.clientX, touch.clientY, getMode())) {
      e.preventDefault();
      return;
    }
  };

  const handleMouseUp = () => {
    if (disableAction()) return;
    setIsWorking(false);
    stopMoveLine();
    handleEnd();
    uniqueIdRef.current = null;
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  useEffect(() => {
    if (rotation !== 0) {
      setShowAlignmentLines(false);
    }
    clearTemporaryCanvas();
    refreshContainer();
  }, [rotation]);

  /**
   * Set pre selection
   */
  useEffect(() => {
    if (!preSelection) {
      return; // no preSelection
    }
    const { left, top, width, height } = preSelection;

    moveContainer({
      left: left * scale,
      top: top * scale,
      width: width * scale,
      height: height * scale,
    });
  }, [preSelection]);

  /**
   * Touch events
   */
  useEffect(() => {
    const ground = groundRef.current;
    if (!ground) {
      console.log("ground not found");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (disableAction()) {
        return;
      }

      if (e.key === "Escape") {
        handleEnd();

        moveContainer(null);
        stopMoveLine();
        setShowAlignmentLines(false);
        clearTemporaryCanvas("escape");
        setSelectedRect(null);

        setRotation(0);
      }
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

  // console.log("render GroundSelection");
  return (
    <>
      <div
        ref={groundRef}
        id={id}
        style={{
          touchAction: "none",
          ...(backgroundColor && { background: backgroundColor }),
        }}
        className="overflow-auto relative inset-0 w-full h-full"
      >
        {typeListMode !== TypeListTables.list && (
          <>
            <Canvas
              backgroundCanvasRef={backgroundCanvasRef}
              temporaryCanvasRef={temporaryCanvasRef}
              mode={getMode()}
            />

            {getMode() === Mode.create && (
              <>
                {showAlignmentLines &&
                  rotation === 0 &&
                  getSelectedRect() !== null && (
                    <AlignmentButtons
                      offset={getGroundOffset()}
                      showVerticalBtn={
                        numberOfAlignmentsRef.current.vertical > 2
                      }
                      showHorizontalBtn={
                        numberOfAlignmentsRef.current.horizontal > 2
                      }
                      equalizeSpaces={equalizeSpaces}
                      getContainerRect={getContainerRect}
                    />
                  )}
              </>
            )}
            <ScrollButtons
              containerRef={groundRef}
              isWorking={isWorking}
              scale={scale}
              setScale={setScale}
              isTouchDevice={isTouchDevice()}
              needRefreshCanvas={needRefreshCanvas}
            />
          </>
        )}
        {children}
      </div>
    </>
  );
});

GroundSelection.displayName = "GroundSelection";
export default GroundSelection;
