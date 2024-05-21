import { useEffect, useRef } from "react";
import {
  undoHistory,
  getCurrentHistory,
} from "../../lib/canvas/canvas-history";
import { clearCanvasByCtx } from "../../lib/canvas/canvas-tools";

import {
  DRAWING_MODES,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingMode,
  isDrawingShape,
  isDrawingSelect,
} from "../../lib/canvas/canvas-defines";

import { alertMessage } from "../../hooks/alertMessage";

import { DrawLine } from "./DrawLine";
import { DrawElement } from "./DrawElement";
import { DrawSelection } from "./DrawSelection";
import { DrawFreehand } from "./DrawFreehand";
import { DrawingHandler } from "../../lib/canvas/DrawingHandler";

const TEMPORTY_OPACITY = 0.6;
// Draw on Canvas
export const DrawCanvas = ({ canvas: canvasRef, getParams }) => {
  const drawingParams = useRef(null);
  const canvasMouseRef = useRef(null);
  const canvasTemporyRef = useRef(null);
  const mouseOnCtrlPanel = useRef(false);

  const [WIDTH, HEIGHT] = [560, 315]; // 16:9 aspact ratio

  let drawLine = null;
  let drawFreehand = null;
  let drawElement = null;
  let drawSelection = null;
  let drawing = null;

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

    if (!item || !item.image) {
      clearCanvasByCtx(ctx);
      if (drawLine !== null) drawLine.setStartCoordinates(null);
      return;
    }
    ctx.putImageData(item.image, 0, 0);
    if (drawLine !== null) drawLine.setStartCoordinates(item.coordinates);
  };

  /**
   * select the drawing handler according to the mode
   * @param {string} mode
   * @returns {DrawingHandler} the drawing handler
   */
  const selectDrawingHandler = (mode) => {
    let drawing;
    if (isDrawingLine(mode)) {
      if (drawLine === null) {
        drawLine = new DrawLine(canvasRef.current);
        drawLine.initData(drawingParams.current);
      }
      drawing = drawLine;
    } else if (isDrawingFreehand(mode)) {
      if (drawFreehand === null) {
        drawFreehand = new DrawFreehand(canvasRef.current);
        drawFreehand.initData(drawingParams.current);
      }
      drawing = drawFreehand;
    } else if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      if (drawElement === null) {
        drawElement = new DrawElement(canvasRef.current);
        drawElement.initData(drawingParams.current);
      }
      drawing = drawElement;
    } else if (isDrawingSelect(mode)) {
      if (drawSelection === null) {
        drawSelection = new DrawSelection(canvasRef.current);
        drawSelection.initData(drawingParams.current);
      }
      drawing = drawSelection;
    } else {
      throw new Error("Drawing mode not found : " + mode);
    }
    drawing.setType(mode);
    drawing.setCanvas(canvasRef.current);
    drawing.setMouseCanvas(canvasMouseRef.current);
    drawing.setTemporyCanvas(canvasTemporyRef.current);
    return drawing;
  };

  const generalInitialisation = () => {
    // Initialize canvas
    drawingParams.current = getParams();
    drawingParams.current.mode = DRAWING_MODES.DRAW;

    // initialise the mouse canvas
    setContext(canvasMouseRef.current);
    setContext(canvasTemporyRef.current, TEMPORTY_OPACITY);

    // default drawing handler
    drawing = selectDrawingHandler(drawingParams.current.mode);

    if (drawSelection !== null) drawSelection.eraseSelectedArea();

    canvasRef.current.getContext("2d").globalCompositeOperation = "source-over";
  };

  const handleMouseUpExtend = (event) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target)) {
      return;
    }
    drawing.actionMouseUp();
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

    const toContinue = drawing.actionMouseDown(
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
    drawing.actionMouseMove(event);
  };

  /**
   * Extend mouse event to the document
   */
  const extendMouseEvent = () => {
    if (drawing.isExtendedMouseArea()) return;
    drawing.setExtendedMouseArea(true);
    document.addEventListener("mousedown", handleMouseDownExtend);
    document.addEventListener("mousemove", handleMouseMoveExtend);
    document.addEventListener("mouseup", handleMouseUpExtend);
  };
  const stopExtendMouseEvent = () => {
    if (!drawing.isExtendedMouseArea()) return;
    drawing.setExtendedMouseArea(false);
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

    drawing.changeData(drawingParams.current);
    drawing.refreshDrawing(drawingParams.current.general.opacity);
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

    if (newMode === DRAWING_MODES.INIT) {
      generalInitialisation();
      return;
    }
    // end previous action then changing mode
    if (drawing) drawing.endAction();
    stopExtendMouseEvent();
    const context = canvasRef.current.getContext("2d");
    context.globalCompositeOperation =
      newMode === DRAWING_MODES.ERASE ? "destination-out" : "source-over";

    // set the new drawing mode
    drawing = selectDrawingHandler(newMode);
    drawing.setType(newMode);

    drawing.startAction();

    drawing.refreshDrawing();
  };

  const handleSpecialEvent = (event) => {
    const eventMode = event.detail.mode;
    const filename = event.detail.filename;
    switch (eventMode) {
      case DRAWING_MODES.CONTROL_PANEL.IN:
        mouseOnCtrlPanel.current = true;
        drawing.actionMouseLeave();
        break;
      case DRAWING_MODES.CONTROL_PANEL.OUT:
        mouseOnCtrlPanel.current = false;
        break;
      case DRAWING_MODES.SAVE:
        alertMessage("Save the canvas");
        if (drawSelection === null) {
          selectDrawingHandler(DRAWING_MODES.SELECT);
        }
        drawSelection.saveCanvas(filename);
        break;
      case DRAWING_MODES.COPY:
        if (drawSelection === null) {
          console.log("drawSelection is null");
          return;
        }
        alertMessage("Copy the selection");
        drawSelection.copySelection();
        break;
      case DRAWING_MODES.PASTE:
        if (drawSelection === null) {
          console.log("drawSelection is null");
          return;
        }
        alertMessage("Paste the selection");
        drawSelection.pasteSelection();
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

    const { toContinue, toReset, pointer } = drawing.actionMouseDown(
      drawingParams.current.mode,
      event
    );
    if (toContinue) {
      extendMouseEvent();
    } else {
      stopExtendMouseEvent();
    }
    if (toReset) {
      const chgtMode = DRAWING_MODES.DRAW;
      drawing.initData(drawingParams.current);
      drawingParams.current.mode = chgtMode;
      drawing = selectDrawingHandler(chgtMode);
      drawing.setType(chgtMode);
    }
    if (pointer !== null) {
      canvasMouseRef.current.style.cursor = pointer;
    }

    alertMessage(
      `Start ${drawingParams.current.mode} : + color:${drawingParams.current.general.color}`
    );
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const onMouseLeave = () => {
    drawing.actionMouseLeave();
  };

  useEffect(() => {
    const handleDocumentLoaded = () => {
      generalInitialisation();
    };
    const handleMouseUp = () => {
      drawing.actionMouseUp();
    };
    const handleMouseDown = (event) => {
      actionMouseDown(event);
    };
    const handleMouseMove = (event) => {
      if (!drawingParams.current) {
        console.log("drawingParams.current is null");
        return;
      }

      const pointer = drawing.actionMouseMove(
        event,
        drawingParams.current.general.opacity
      );

      if (pointer !== null) {
        canvasMouseRef.current.style.cursor = pointer;
      }
    };
    const handleKeyDown = (event) => {
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
          drawing.actionKeyDown(event);
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
            handleSpecialEvent(event);
          }
      }
    };

    const canvasMouse = canvasMouseRef.current;

    const mouseEffect = canvasMouse;

    mouseEffect.addEventListener("mousedown", handleMouseDown);
    mouseEffect.addEventListener("mousemove", handleMouseMove);
    mouseEffect.addEventListener("mouseup", handleMouseUp);
    canvasMouse.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("modeChanged", handleChangeMode);
    if (document.readyState === "complete") {
      handleDocumentLoaded();
    } else {
      window.addEventListener("load", handleDocumentLoaded);
    }

    return () => {
      // mouse controls can be applied to the document
      canvasMouse.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleMouseDown);
      canvasMouse.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleMouseMove);
      canvasMouse.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseup", handleMouseUp);
      canvasMouse.removeEventListener("mouseleave", onMouseLeave);

      document.removeEventListener("modeChanged", handleChangeMode);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("load", handleDocumentLoaded);

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
