import React, { useEffect, useRef } from "react";
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
  AllParams,
  EventDetail,
} from "../../lib/canvas/canvas-defines";

import { alertMessage } from "../alert-messages/alertMessage";

import { DrawLine } from "./DrawLine";
import { DrawElement } from "./DrawElement";
import { DrawSelection } from "./DrawSelection";
import { DrawFreehand } from "./DrawFreehand";
import { DrawingHandler } from "../../lib/canvas/DrawingHandler";

const TEMPORTY_OPACITY = 0.6;

interface DrawCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  getParams: () => AllParams;
}
// Draw on Canvas
export const DrawCanvas: React.FC<DrawCanvasProps> = ({
  canvasRef,
  getParams,
}) => {
  const canvasMouseRef: React.RefObject<HTMLCanvasElement | undefined> =
    useRef(undefined);
  const canvasTemporyRef: React.RefObject<HTMLCanvasElement | undefined> =
    useRef(undefined);
  const mouseOnCtrlPanel = useRef(false);

  const [WIDTH, HEIGHT] = [768, 432]; // 16:9 aspact ratio

  let currentParams = getParams();

  let drawLine: DrawLine | null = null;
  let drawFreehand: DrawFreehand | null = null;
  let drawElement: DrawElement | null = null;
  let drawSelection: DrawSelection | null = null;
  let drawing: DrawingHandler | null = null;

  /**
   * Function to get the last picture in the history for undo action
   */
  const previousPicture = (canvas: HTMLCanvasElement) => {
    if (canvasRef.current === null) {
      return;
    }
    undoHistory();
    const item = getCurrentHistory();
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    if (!item || !item.image) {
      clearCanvasByCtx(ctx);
      if (drawLine !== null) drawLine.setStartCoordinates(null);
      return;
    }
    ctx.putImageData(item.image, 0, 0);
    if (drawLine !== null) drawLine.setStartCoordinates(item.coordinates);
  };

  /**
   * Function to set the context of the canvas
   * @param {HTMLCanvasElement} canvas
   * @param {number} opacity
   */
  const setContext = (
    canvas: HTMLCanvasElement | null,
    opacity: number | null = null
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = currentParams.general.color;
    ctx.lineWidth = currentParams.general.lineWidth;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity ?? currentParams.general.opacity;
    return ctx;
  };
  /**
   * select the drawing handler according to the mode
   * @param {string} mode
   * @returns {DrawingHandler} the drawing handler
   */
  const selectDrawingHandler: (mode: string) => DrawingHandler = (mode) => {
    if (canvasRef.current === null) {
      throw new Error("Canvas is null");
    }

    let drawing;
    if (isDrawingLine(mode)) {
      if (drawLine === null) {
        drawLine = new DrawLine(canvasRef.current);
        drawLine.initData(currentParams);
      }
      drawing = drawLine;
    } else if (isDrawingFreehand(mode)) {
      if (drawFreehand === null) {
        drawFreehand = new DrawFreehand(canvasRef.current);
        drawFreehand.initData(currentParams);
      }
      drawing = drawFreehand;
    } else if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      if (drawElement === null) {
        drawElement = new DrawElement(canvasRef.current);
        drawElement.initData(currentParams);
      }
      drawing = drawElement;
    } else if (isDrawingSelect(mode)) {
      if (drawSelection === null) {
        drawSelection = new DrawSelection(canvasRef.current);
        drawSelection.initData(currentParams);
      }
      drawing = drawSelection;
    } else {
      throw new Error("Drawing mode not found : " + mode);
    }
    drawing.setType(mode);
    drawing.setCanvas(canvasRef.current);
    drawing.setMouseCanvas(canvasMouseRef.current as HTMLCanvasElement);
    drawing.setTemporyCanvas(canvasTemporyRef.current as HTMLCanvasElement);
    return drawing;
  };

  const generalInitialisation = () => {
    // Initialize canvas
    currentParams = getParams();
    currentParams.mode = DRAWING_MODES.DRAW;

    // initialise mouse and tempory canvas
    setContext(canvasMouseRef.current as HTMLCanvasElement);
    setContext(canvasTemporyRef.current as HTMLCanvasElement, TEMPORTY_OPACITY);

    // default drawing handler
    drawing = selectDrawingHandler(currentParams.mode);

    if (drawSelection !== null) drawSelection.eraseSelectedArea();

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.globalCompositeOperation = "source-over";
    }
  };

  const handleMouseUpExtend = (event: MouseEvent) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (
      !canvasMouseRef.current ||
      canvasMouseRef.current.contains(event.target as Node)
    ) {
      return;
    }
    drawing && drawing.actionMouseUp();
  };

  const handleMouseDownExtend = (event: MouseEvent) => {
    if (!drawing || !canvasMouseRef.current) return;
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target as Node)) {
      return;
    }
    // draw line can be extended outside the canvas
    // but not when the mouse is on the control panel
    if (mouseOnCtrlPanel.current) {
      return;
    }

    const toContinue = drawing.actionMouseDown(currentParams.mode, event);
    if (!toContinue) {
      stopExtendMouseEvent();
    }
  };

  const handleMouseMoveExtend = (event: MouseEvent) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (
      !canvasMouseRef.current ||
      canvasMouseRef.current.contains(event.target as Node)
    ) {
      return;
    }
    drawing && drawing.actionMouseMove(event);
  };

  /**
   * Extend mouse event to the document
   */
  const extendMouseEvent = () => {
    if (!drawing || drawing.isExtendedMouseArea()) return;
    drawing.setExtendedMouseArea(true);
    document.addEventListener("mousedown", handleMouseDownExtend);
    document.addEventListener("mousemove", handleMouseMoveExtend);
    document.addEventListener("mouseup", handleMouseUpExtend);
  };
  const stopExtendMouseEvent = () => {
    if (!drawing || !drawing.isExtendedMouseArea()) return;
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
    currentParams = getParams();
    if (!drawing) return;

    drawing.changeData(currentParams);
    drawing.refreshDrawing(currentParams.general.opacity);
  };

  /**
   * Function to change the drawing mode
   * @param {string} newMode - new drawing mode
   */
  const actionChangeMode = (newMode: string) => {
    currentParams = getParams();

    if (newMode === DRAWING_MODES.INIT) {
      generalInitialisation();
      return;
    }
    // end previous action then changing mode
    if (drawing) drawing.endAction(newMode);
    stopExtendMouseEvent();
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      if (context)
        context.globalCompositeOperation =
          newMode === DRAWING_MODES.ERASE ? "destination-out" : "source-over";
    }

    // set the new drawing mode
    drawing = selectDrawingHandler(newMode);
    drawing.setType(newMode);
    drawing.changeData(currentParams);

    drawing.startAction();

    drawing.refreshDrawing();
  };

  const handleActionEvent = (event: EventDetail) => {
    const eventAction = event.detail.action;
    const filename = event.detail?.filename;
    const value = event.detail?.value;

    if (!canvasRef.current || !drawing) {
      return;
    }

    switch (eventAction) {
      case DRAWING_MODES.INIT:
        generalInitialisation();
        clearCanvasByCtx(canvasRef.current.getContext("2d"));
        clearTemporyCanvas();
        break;
      case DRAWING_MODES.CONTROL_PANEL.IN:
        mouseOnCtrlPanel.current = true;
        drawing.actionMouseLeave();
        break;

      case DRAWING_MODES.CONTROL_PANEL.OUT:
        mouseOnCtrlPanel.current = false;
        break;
      case DRAWING_MODES.UNDO:
        clearTemporyCanvas();
        previousPicture(canvasRef.current);
        break;
      case DRAWING_MODES.ABORT:
        drawing.actionAbort();
        break;
      case DRAWING_MODES.VALID:
        drawing.actionValid();
        break;
      case DRAWING_MODES.SAVE:
        if (drawSelection === null) {
          selectDrawingHandler(DRAWING_MODES.SELECT);
        }
        drawSelection &&
          drawSelection.saveCanvas(filename, event.detail?.format);
        break;
      case DRAWING_MODES.LOAD:
        {
          const name = event.detail.name || "your file";

          if (drawSelection === null) {
            selectDrawingHandler(DRAWING_MODES.IMAGE);
          }
          drawSelection && drawSelection.loadCanvas(filename, name);
          // correction of mouse position
          mouseOnCtrlPanel.current = false;
        }
        break;
      case DRAWING_MODES.COPY:
        if (drawSelection === null) {
          return;
        }
        alertMessage("Copy the selection");
        drawSelection.copySelection();
        break;
      case DRAWING_MODES.PASTE:
        if (drawSelection === null) {
          return;
        }
        alertMessage("Paste the selection");
        drawSelection.pasteSelection();
        break;
      case DRAWING_MODES.DELETE:
        if (drawSelection === null) {
          return;
        }
        alertMessage("Delete the selection");
        drawSelection.deleteSelection();
        break;
      case DRAWING_MODES.CUT:
        if (drawSelection === null) {
          console.log("drawSelection is null");
          return;
        }
        alertMessage("Cut the selection");
        drawSelection.cutSelection();
        break;
      case DRAWING_MODES.TRANSPARENCY:
        if (drawSelection !== null) {
          alertMessage("Transparency (" + value + ") on selection");
          drawSelection.transparencySelection(value as number);
        }
        break;
      case DRAWING_MODES.IMAGE_RADIUS:
        if (drawSelection !== null) {
          alertMessage("Radius (" + value + ") on selection");
          drawSelection.radiusSelection(value as number);
        }
        break;
      case DRAWING_MODES.BLACK_WHITE:
        if (drawSelection !== null) {
          alertMessage("Black and white on selection");
          drawSelection.blackWhiteSelection(value as boolean);
        }
        break;
      default:
        console.error("Action not found : ", eventAction);
    }
  };

  /**
   * Function to clear the temporary canvas
   */
  const clearTemporyCanvas = () => {
    if (!canvasTemporyRef.current) return;
    const context = canvasTemporyRef.current.getContext("2d");
    clearCanvasByCtx(context);
  };

  /**
   * Function to start drawing on the canvas
   * @param {Event} event
   */
  const actionMouseDown = (event: MouseEvent) => {
    if (!canvasRef.current) {
      console.error(
        canvasRef.current == null ? "canvas" : "drawingParams",
        "is null"
      );
      return;
    }
    // color and width painting
    currentParams = getParams();
    setContext(canvasRef.current);

    if (!drawing) return;
    const { toContinue, toReset, pointer } = drawing.actionMouseDown(
      currentParams.mode,
      event
    );
    if (toContinue) {
      extendMouseEvent();
    } else {
      stopExtendMouseEvent();
    }
    if (toReset && drawing) {
      drawing.endAction();
      // restart with basic drawing mode
      const chgtMode = DRAWING_MODES.DRAW;
      drawing.initData(currentParams);
      currentParams.mode = chgtMode;
      drawing = selectDrawingHandler(chgtMode);
    }
    if (pointer !== null && canvasMouseRef.current) {
      canvasMouseRef.current.style.cursor = pointer;
    }

    alertMessage(
      `Start ${currentParams.mode} : + color:${currentParams.general.color}`
    );
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const onMouseLeave = () => {
    drawing && drawing.actionMouseLeave();
  };

  useEffect(() => {
    const handleDocumentLoaded = () => {
      generalInitialisation();
    };
    const handleMouseUp = () => {
      drawing && drawing.actionMouseUp();
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel

      actionMouseDown(event);
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (!canvasMouseRef.current || !drawing) {
        return;
      }

      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel

      const pointer = drawing.actionMouseMove(event);

      if (pointer !== null) {
        canvasMouseRef.current.style.cursor = pointer;
      }
    };

    const handleChangeMode = (e: Event) => {
      const event = e as EventDetail;
      const newMode = event.detail.mode;

      switch (newMode) {
        case DRAWING_MODES.CHANGE:
          drawingParamChanged();
          break;
        case DRAWING_MODES.ACTION:
          handleActionEvent(event);
          break;

        default:
          if (isDrawingMode(newMode)) {
            // drawing modes --------------------------
            clearTemporyCanvas();
            actionChangeMode(newMode);
          } else {
            console.error("Mode not found : ", newMode);
          }
      }
    };

    if (!canvasMouseRef.current) {
      console.error("canvasMouseRef.current is null");
      return;
    }
    const canvasMouse = canvasMouseRef.current;
    canvasMouse.style.pointerEvents = "auto";

    canvasMouse.addEventListener("mousedown", handleMouseDown);
    canvasMouse.addEventListener("mousemove", handleMouseMove);
    canvasMouse.addEventListener("mouseup", handleMouseUp);
    canvasMouse.addEventListener("mouseleave", onMouseLeave);
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
      window.removeEventListener("load", handleDocumentLoaded);

      currentParams.mode = DRAWING_MODES.INIT;
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: HEIGHT + 5,
        width: WIDTH + 5,
      }}
      className="border-2 border-blue-300 border-spacing-2"
    >
      <canvas
        width={WIDTH}
        height={HEIGHT}
        ref={canvasRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
        }}
        className="m-auto bg-white rounded-md shadow-md border-spacing-3"
      />
      <canvas
        width={WIDTH}
        height={HEIGHT}
        ref={canvasTemporyRef as React.RefObject<HTMLCanvasElement>}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 2,
        }}
        className="m-auto transparent"
      />
      <canvas
        width={WIDTH}
        height={HEIGHT}
        ref={canvasMouseRef as React.RefObject<HTMLCanvasElement>}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 3,
        }}
        className="m-auto transparent"
      />
    </div>
  );
};
