import { useEffect, useRef } from "react";
import {
  undoHistory,
  getCurrentHistory,
} from "../../lib/canvas/canvas-history";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";

import {
  DRAWING_MODES,
  isDrawingAllLines,
  isDrawingMode,
  isDrawingShape,
} from "../../lib/canvas/canvas-defines";

import { alertMessage } from "../../hooks/alertMessage";
import { imageSize } from "../../lib/canvas/canvas-size";
import { DrawLine } from "./DrawLine";
import { DrawLine2 } from "./DrawLine2";
import { DrawElement } from "./DrawElement";

const TEMPORTY_OPACITY = 0.6;
// Draw on Canvas
export const DrawCanvas = ({ canvas: canvasRef, getParams }) => {
  const drawingParams = useRef(null);
  const canvasMouseRef = useRef(null);
  const canvasTemporyRef = useRef(null);
  const mouseOnCtrlPanel = useRef(false);

  const [WIDTH, HEIGHT] = [560, 315]; // 16:9 aspact ratio
  const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

  // const drawLine = new DrawLine(canvasRef.current);
  const drawLine = new DrawLine2(canvasRef.current);
  const drawElement = new DrawElement(canvasRef.current);

  const initShape = (type = DRAWING_MODES.SQUARE) => {
    const defaultValues = {
      type: type,
      x: WIDTH / 2,
      y: HEIGHT / 2,
      width: SQUARE_WIDTH,
      height: type == DRAWING_MODES.CIRCLE ? SQUARE_WIDTH : SQUARE_HEIGHT,
      rotation: 0,

      general: { ...drawingParams.current.general },
      shape: { ...drawingParams.current.shape },
      border: { ...drawingParams.current.border },
      text: { ...drawingParams.current.text },
      withMiddleButton: true,
    };

    drawElement.addData(defaultValues);

    drawElement.setFixed(false);
  };

  /**
   * Function to get the last picture in the history for undo action
   */
  const previousPicture = (canvas) => {
    if (canvasRef.current === null) {
      return;
    }
    undoHistory();
    const item = getCurrentHistory();
    const ctx = canvas.getContext("2d");

    if (!item || item.image === null || item.image === undefined) {
      clearCanvasByCtx(ctx);
      drawLine.eraseStartCoordinates();

      return;
    }
    ctx.putImageData(item.image, 0, 0);
    drawLine.setStartCoordinates(item.coordinate);
  };

  const generalInitialisation = () => {
    // Initialize canvas
    drawingParams.current = getParams();
    drawingParams.current.mode = DRAWING_MODES.DRAW;
    initShape();
    // initialise the mouse canvas
    setContext(canvasMouseRef.current);
    setContext(canvasTemporyRef.current, TEMPORTY_OPACITY);

    // set the canvas for the drawLine
    if (canvasRef.current === null) {
      console.log("canvasRef is null");
    } else {
      drawLine.setCanvas(canvasRef.current);
    }
    drawLine.setMouseCanvas(canvasMouseRef.current);
    drawLine.setTemporyCanvas(canvasTemporyRef.current);

    drawLine.setDataGeneral(drawingParams.current.general);

    drawElement.setCanvas(canvasRef.current);
    drawElement.setMouseCanvas(canvasMouseRef.current);
    drawElement.setTemporyCanvas(canvasTemporyRef.current);
  };

  const handleMouseUpExtend = (event) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target)) {
      return;
    }
    drawLine.actionMouseUp();
  };
  const handleMouseDownExtend = (event) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target)) {
      return;
    }
    // draw line can be extended outside the canvas
    // but not when the mouse is on the control panel
    if (mouseOnCtrlPanel.current) {
      return;
    }

    const toContinue = drawLine.actionMouseDown(
      drawingParams.current.mode,
      event
    );
    if (!toContinue) {
      stopExtendMouseEvent();
    }
  };
  const handleMouseMoveExtend = (event) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target)) {
      return;
    }
    drawLine.actionMouseMove(event);
  };
  /**
   * Extend mouse event to the document
   */
  const extendMouseEvent = () => {
    if (drawLine.isExtendedMouseArea()) return;
    drawLine.setExtendedMouseArea(true);
    document.addEventListener("mousedown", handleMouseDownExtend);
    document.addEventListener("mousemove", handleMouseMoveExtend);
    document.addEventListener("mouseup", handleMouseUpExtend);
  };
  const stopExtendMouseEvent = () => {
    if (!drawLine.isExtendedMouseArea()) return;
    drawLine.setExtendedMouseArea(false);
    document.removeEventListener("mousedown", handleMouseDownExtend);
    document.removeEventListener("mousemove", handleMouseMoveExtend);
    document.removeEventListener("mouseup", handleMouseUpExtend);
  };
  /**
   * Function to get the current parameters for drawing
   * call then user change something in the drawing panel
   */
  const drawingParamChanged = () => {
    drawingParams.current = getParams();
    const mode = drawingParams.current.mode;
    if (isDrawingShape(mode)) {
      drawElement.setDataGeneral(drawingParams.current.general);
      drawElement.setDataShape(drawingParams.current.shape);

      if (drawingParams.current.shape.withBorder) {
        drawElement.setDataBorder(drawingParams.current.border);
      }
      if (drawingParams.current.shape.withText) {
        drawElement.setDataText(drawingParams.current.text);
      }
      // clear the temporary canvas and show the element
      drawElement.refreshDrawing();
    } else if (mode === DRAWING_MODES.TEXT) {
      drawElement.setDataText(drawingParams.current.text);

      drawElement.refreshDrawing();
    } else if (isDrawingAllLines(mode)) {
      drawLine.setDataGeneral(drawingParams.current.general);

      drawLine.refreshDrawing(drawingParams.current.general.opacity);
    }
  };

  /**
   * Function to change the drawing mode
   * @param {string} newMode - new drawing mode
   */
  const actionChangeMode = (newMode) => {
    if (drawingParams.current === null) {
      drawingParams.current = getParams();
      // setContext(canvasTemporyRef.current, TEMPORTY_OPACITY);
    }
    if (drawingParams.current.mode !== newMode) {
      console.log("error changing mode: ", newMode);
    }

    if (newMode === DRAWING_MODES.SELECT) {
      // Zone selection
      const rect = imageSize(canvasRef.current);

      const area = drawElement.memorizeSelectedZone(rect);
      if (area) {
        drawingParams.current.selectedArea = area;
      }
      drawElement.refreshDrawing();
    }
    // end previous action then changing mode
    drawLine.endAction();
    drawLine.setType(newMode);

    // drawingParams.current.mode = newMode;
    if (isDrawingShape(newMode) || newMode === DRAWING_MODES.TEXT) {
      drawElement.setType(newMode);

      drawElement.refreshDrawing();
    }
    stopExtendMouseEvent();
    const context = canvasRef.current.getContext("2d");
    context.globalCompositeOperation =
      newMode === DRAWING_MODES.ERASE ? "destination-out" : "source-over";
  };

  const handleSpecialEvent = (eventMode) => {
    switch (eventMode) {
      case DRAWING_MODES.CONTROL_PANEL.IN:
        mouseOnCtrlPanel.current = true;
        drawLine.setDrawing(false);
        break;
      case DRAWING_MODES.CONTROL_PANEL.OUT:
        mouseOnCtrlPanel.current = false;
        break;
    }
  };
  /**
   * Function to set the context of the canvas
   * @param {HTMLCanvasElement} canvas
   * @param {number} opacity
   */
  const setContext = (canvas, opacity = null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    if (drawingParams.current) {
      ctx.strokeStyle = drawingParams.current.general.color;
      ctx.lineWidth = drawingParams.current.general.lineWidth;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity ?? drawingParams.current.general.opacity;
    return ctx;
  };

  /**
   * Function to clear the temporary canvas
   */
  const clearTemporyCanvas = () => {
    const context = canvasTemporyRef.current.getContext("2d");
    clearCanvasByCtx(context);
  };

  /**
   * Function to start drawing on the canvas
   * @param {Event} event
   */
  const actionMouseDown = (event) => {
    // color and width painting
    drawingParams.current = getParams();
    setContext(canvasRef.current);

    if (isDrawingAllLines(drawingParams.current.mode)) {
      const toContinue = drawLine.actionMouseDown(
        drawingParams.current.mode,
        event
      );
      if (toContinue) {
        extendMouseEvent();
      } else {
        stopExtendMouseEvent();
      }
    } else if (
      isDrawingShape(drawingParams.current.mode) ||
      drawingParams.current.mode === DRAWING_MODES.TEXT
    ) {
      const { toReset, pointer } = drawElement.actionMouseDown(
        drawingParams.current.mode
      );
      if (toReset) {
        initShape(drawingParams.current.mode);
        drawingParams.current.mode = DRAWING_MODES.DRAW;
      }
      if (pointer !== null) {
        canvasMouseRef.current.style.cursor = pointer;
      }
    }

    alertMessage(
      `Start ${drawingParams.current.mode} : + color:${drawingParams.current.general.color}`
    );
  };

  /**
   * Function to stop drawing on the canvas
   */
  const actionMouseUp = (mode) => {
    if (isDrawingAllLines(mode)) {
      drawLine.actionMouseUp(mode);
      return;
    }
    if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      drawElement.actionMouseUp();
    }
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const onMouseLeave = () => {
    const mode = drawingParams.current.mode;
    if (isDrawingAllLines(mode)) {
      drawLine.actionMouseLeave();
      return;
    }
    drawElement.actionMouseLeave();
  };

  useEffect(() => {
    const handleMouseUp = () => {
      actionMouseUp(drawingParams.current.mode);
    };
    const handleMouseDown = (event) => {
      actionMouseDown(event);
    };
    const handleMouseMove = (event) => {
      if (
        !drawingParams.current ||
        drawingParams.current.mode === DRAWING_MODES.INIT
      ) {
        generalInitialisation();
      }
      const mode = drawingParams.current.mode;
      let pointer = null;

      if (isDrawingAllLines(mode)) {
        pointer = drawLine.actionMouseMove(event);
      } else {
        pointer = drawElement.actionMouseMouve(
          mode,
          event,
          drawingParams.current.general.opacity
        );
      }
      if (pointer !== null) {
        canvasMouseRef.current.style.cursor = pointer;
      }
      if (mode === DRAWING_MODES.SELECT) {
        drawElement.memorizeSelectedZone(null);
      }
    };
    const hanldeKeyDown = (event) => {
      switch (event.key) {
        case "z":
        case "Z": // Ctrl Z
          if (event.ctrlKey) {
            // undo
            clearTemporyCanvas();
            previousPicture(canvasRef.current);
          }
          break;
        default:
          if (isDrawingAllLines(drawingParams.current.mode)) {
            drawLine.actionKeyDown(event);
          } else {
            drawElement.actionKeyDown(event);
          }
      }
    };

    const handleChangeMode = (event) => {
      const newMode = event.detail.mode;
      switch (newMode) {
        case DRAWING_MODES.DRAWING_CHANGE:
          drawingParamChanged();
          break;
        case DRAWING_MODES.UNDO:
          previousPicture(canvasRef.current);
          break;
        case DRAWING_MODES.INIT:
          generalInitialisation();
          clearCanvasByCtx(canvasRef.current.getContext("2d"));
          clearTemporyCanvas();
          break;
        default:
          if (isDrawingMode(newMode)) {
            // drawing modes --------------------------
            clearTemporyCanvas();
            actionChangeMode(newMode);
          } else {
            handleSpecialEvent(newMode);
          }
      }
    };

    const canvasMouse = canvasMouseRef.current;

    const mouseEffect = canvasMouse;

    mouseEffect.addEventListener("mousedown", handleMouseDown);
    mouseEffect.addEventListener("mousemove", handleMouseMove);
    mouseEffect.addEventListener("mouseup", handleMouseUp);
    canvasMouse.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("keydown", hanldeKeyDown);
    document.addEventListener("modeChanged", handleChangeMode);

    return () => {
      // mouse controls can be applied to the document
      canvasMouse.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleMouseDown);
      canvasMouse.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleMouseMove);
      canvasMouse.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseup", handleMouseUp);

      canvasMouse.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("keydown", hanldeKeyDown);
      document.removeEventListener("modeChanged", handleChangeMode);
      drawingParams.current.mode = DRAWING_MODES.INIT;
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: HEIGHT + 5,
        width: WIDTH + 5,
      }}
      className="border-spacing-2 border-2 border-blue-300"
    >
      <canvas
        left={0}
        top={0}
        width={WIDTH}
        height={HEIGHT}
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
        className="m-auto border-spacing-3 rounded-md bg-white shadow-md"
      />
      <canvas
        left={0}
        top={0}
        width={WIDTH}
        height={HEIGHT}
        ref={canvasTemporyRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
        className="transparent m-auto"
      />
      <canvas
        left={0}
        top={0}
        width={WIDTH}
        height={HEIGHT}
        ref={canvasMouseRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 100,
        }}
        className="transparent m-auto"
      />
    </div>
  );
};
