import React, { useEffect, useRef } from "react";
import {
  undoHistory,
  getCurrentHistory,
} from "../../../lib/canvas/canvas-history";
import { clearCanvasByCtx } from "../../../lib/canvas/canvas-tools";

import {
  DRAWING_MODES,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingMode,
  isDrawingShape,
  isDrawingSelect,
  AllParams,
  EventDetail,
} from "../../../lib/canvas/canvas-defines";

import { alertMessage } from "../../alert-messages/alertMessage";

import { drawLine } from "./drawLine";
import { drawElement } from "./drawElement";
import { drawSelection } from "./drawSelection";
import { drawFreehand } from "./drawFreehand";
import { drawingHandler } from "./drawingHandler";

const TEMPORTY_OPACITY = 0.6;

interface DrawCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement>;
  mode: string;
  setMode: (mode: string) => void;
  getParams: () => AllParams;
}
// Draw on Canvas
export const useCanvas = ({
  canvasRef,
  canvasTemporyRef,
  mode,
  setMode,
  getParams,
}: DrawCanvasProps) => {
  useRef(undefined);
  const mouseOnCtrlPanel = useRef(false);

  let currentParams = getParams();
  // drawing handler
  const drawingRef = useRef<drawingHandler | null>(null);
  const lineRef = useRef<drawLine | null>(null);
  const selectionRef = useRef<drawSelection | null>(null);
  const elementRef = useRef<drawElement | null>(null);
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
      if (lineRef.current !== null) lineRef.current.setStartCoordinates(null);
      return;
    }
    ctx.putImageData(item.image, 0, 0);
    if (lineRef.current !== null)
      lineRef.current.setStartCoordinates(item.coordinates);
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
  const selectDrawingHandler: (mode: string) => drawingHandler = (mode) => {
    if (canvasRef.current === null) {
      throw new Error("Canvas is null");
    }

    let drawingHdl;
    let newHandler = false;
    if (isDrawingLine(mode)) {
      if (lineRef.current === null) {
        lineRef.current = new drawLine(canvasRef.current);
      }
      newHandler = true; // new initialization for color and width
      drawingHdl = lineRef.current;
    } else if (isDrawingFreehand(mode)) {
      drawingHdl = new drawFreehand(canvasRef.current);
      newHandler = true;
    } else if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      if (elementRef.current === null) {
        elementRef.current = new drawElement(canvasRef.current);
        newHandler = true;
      }
      drawingHdl = elementRef.current;
    } else if (isDrawingSelect(mode)) {
      if (selectionRef.current === null) {
        selectionRef.current = new drawSelection(canvasRef.current);
        newHandler = true;
      }
      drawingHdl = selectionRef.current;
    } else {
      throw new Error("Drawing mode not found : " + mode);
    }
    if (newHandler) {
      drawingHdl.initData(currentParams);
      drawingHdl.setCanvas(canvasRef.current);
      drawingHdl.setTemporyCanvas(
        canvasTemporyRef.current as HTMLCanvasElement
      );
    }
    drawingHdl.setType(mode);
    return drawingHdl;
  };

  const generalInitialisation = () => {
    // Initialize canvas
    currentParams = getParams();
    setMode(DRAWING_MODES.DRAW);

    // default drawing handler
    drawingRef.current = selectDrawingHandler(DRAWING_MODES.DRAW);

    if (selectionRef.current !== null) selectionRef.current.eraseSelectedArea();

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.globalCompositeOperation = "source-over";
    }
  };

  const handleMouseUpExtend = (event: MouseEvent) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (
      !canvasTemporyRef.current ||
      canvasTemporyRef.current.contains(event.target as Node)
    ) {
      return;
    }
    drawingRef.current?.actionMouseUp();
  };

  const handleMouseDownExtend = (event: MouseEvent) => {
    if (!drawingRef.current || !canvasTemporyRef.current) return;
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasTemporyRef.current.contains(event.target as Node)) {
      return;
    }
    // draw line can be extended outside the canvas
    // but not when the mouse is on the control panel
    if (mouseOnCtrlPanel.current) {
      return;
    }

    const toContinue = drawingRef.current.actionMouseDown(event);
    if (!toContinue) {
      stopExtendMouseEvent();
    }
  };

  const handleMouseMoveExtend = (event: MouseEvent) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (
      !canvasTemporyRef.current ||
      canvasTemporyRef.current.contains(event.target as Node)
    ) {
      return;
    }
    drawingRef.current?.actionMouseMove(event);
  };

  /**
   * Extend mouse event to the document
   */
  const extendMouseEvent = () => {
    if (!drawingRef.current || drawingRef.current.isExtendedMouseArea()) return;
    drawingRef.current.setExtendedMouseArea(true);
    document.addEventListener("mousedown", handleMouseDownExtend);
    document.addEventListener("mousemove", handleMouseMoveExtend);
    document.addEventListener("mouseup", handleMouseUpExtend);
  };
  const stopExtendMouseEvent = () => {
    if (!drawingRef.current || !drawingRef.current.isExtendedMouseArea())
      return;
    drawingRef.current.setExtendedMouseArea(false);
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
    if (!drawingRef.current) return;

    drawingRef.current.changeData(currentParams);
    drawingRef.current.refreshDrawing(currentParams.general.opacity);
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
    currentParams.mode = newMode;

    // end previous action then changing mode
    if (drawingRef.current) {
      drawingRef.current.endAction(newMode);
    }
    stopExtendMouseEvent();
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      if (context)
        context.globalCompositeOperation =
          newMode === DRAWING_MODES.ERASE ? "destination-out" : "source-over";
    }
    // set the tempory canvas
    if (canvasTemporyRef.current) {
      setContext(
        canvasTemporyRef.current as HTMLCanvasElement,
        TEMPORTY_OPACITY
      );
    }

    // set the new drawing mode
    drawingRef.current = selectDrawingHandler(newMode);
    drawingRef.current.startAction();
    drawingRef.current.refreshDrawing();
  };

  const handleActionEvent = (event: EventDetail) => {
    const eventAction = event.detail.action;
    const filename = event.detail?.filename;
    const value = event.detail?.value;

    if (!canvasRef.current || !drawingRef.current) {
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
        drawingRef.current.actionMouseLeave();
        break;

      case DRAWING_MODES.CONTROL_PANEL.OUT:
        mouseOnCtrlPanel.current = false;
        break;
      case DRAWING_MODES.UNDO:
        clearTemporyCanvas();
        previousPicture(canvasRef.current);
        break;
      case DRAWING_MODES.ABORT:
        drawingRef.current.actionAbort();
        break;
      case DRAWING_MODES.VALID:
        drawingRef.current.actionValid();
        break;
      case DRAWING_MODES.SAVE:
        if (selectionRef.current === null) {
          selectDrawingHandler(DRAWING_MODES.SELECT);
        }
        selectionRef.current?.saveCanvas(filename, event.detail?.format);
        break;
      case DRAWING_MODES.LOAD:
        {
          // console.log("LOAD", event.detail, "type", currentParams.mode);
          const name = event.detail.name || "your file";

          if (selectionRef.current === null) {
            selectDrawingHandler(DRAWING_MODES.IMAGE);
          }
          selectionRef.current?.loadCanvas(filename, name);
          // correction of mouse position
          mouseOnCtrlPanel.current = false;
        }
        break;
      case DRAWING_MODES.COPY:
        if (selectionRef.current === null) {
          return;
        }
        alertMessage("Copy the selection");
        selectionRef.current.copySelection();
        break;
      case DRAWING_MODES.PASTE:
        if (selectionRef.current === null) {
          return;
        }
        alertMessage("Paste the selection");
        selectionRef.current.pasteSelection();
        break;
      case DRAWING_MODES.DELETE:
        if (selectionRef.current === null) {
          return;
        }
        alertMessage("Delete the selection");
        selectionRef.current.deleteSelection();
        break;
      case DRAWING_MODES.CUT:
        if (selectionRef.current === null) {
          console.log("selectionRef.current is null");
          return;
        }
        alertMessage("Cut the selection");
        selectionRef.current.cutSelection();
        break;
      case DRAWING_MODES.TRANSPARENCY:
        if (selectionRef.current !== null) {
          alertMessage("Transparency (" + value + ") on selection");
          selectionRef.current.transparencySelection(value as number);
        }
        break;
      case DRAWING_MODES.IMAGE_RADIUS:
        if (selectionRef.current !== null) {
          alertMessage("Radius (" + value + ") on selection");
          selectionRef.current.radiusSelection(value as number);
        }
        break;
      case DRAWING_MODES.BLACK_WHITE:
        if (selectionRef.current !== null) {
          alertMessage("Black and white on selection");
          selectionRef.current.blackWhiteSelection(value as boolean);
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

    if (!drawingRef.current) return;
    drawingRef.current.setType(currentParams.mode);
    const { toContinue, toReset, pointer } =
      drawingRef.current.actionMouseDown(event);
    if (toContinue) {
      extendMouseEvent();
    } else {
      stopExtendMouseEvent();
    }
    if (toReset && drawingRef.current) {
      drawingRef.current.endAction();
      // restart with basic drawing mode
      const chgtMode = DRAWING_MODES.PAUSE;
      currentParams.mode = chgtMode;
      setMode(chgtMode);

      drawingRef.current = selectDrawingHandler(chgtMode);
      drawingRef.current.initData(currentParams);
    }
    if (pointer && canvasTemporyRef.current) {
      canvasTemporyRef.current.style.cursor = pointer;
    }
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const onMouseLeave = () => {
    drawingRef.current && drawingRef.current.actionMouseLeave();
  };

  useEffect(() => {
    const canvasMouse = canvasTemporyRef.current;
    if (!canvasMouse) {
      return;
    }
    setContext(canvasMouse);

    const handleMouseUp = () => {
      drawingRef.current?.actionMouseUp();
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel

      actionMouseDown(event);
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel

      const pointer = drawingRef.current?.actionMouseMove(event);

      if (pointer) {
        canvasMouse.style.cursor = pointer;
      }
    };

    const handleMouseDblClick = (event: MouseEvent) => {
      if (event.detail === 2) {
        drawingRef.current?.actionMouseDblClick();
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
          if (!isDrawingMode(newMode)) {
            console.error("Mode not found : ", newMode);
          }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      // console.log("touchstart");
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel

      event.preventDefault();

      const touch = event.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      console.log("mouseEvent", mouseEvent);
      actionMouseDown(mouseEvent);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (mouseOnCtrlPanel.current === true) return;

      event.preventDefault();
      const touch = event.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });

      drawingRef.current?.actionMouseMove(mouseEvent);
    };

    const handleTouchEnd = () => {
      drawingRef.current?.actionMouseUp();
    };
    const handleDoubleTap = () => {
      let lastTap = 0;
      const delay = 300; // délai en millisecondes pour détecter un double tap

      return (event: TouchEvent) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < delay && tapLength > 0) {
          event.preventDefault();
          drawingRef.current?.actionMouseDblClick();
        }

        lastTap = currentTime;
      };
    };

    canvasMouse.style.pointerEvents = "auto";

    canvasMouse.addEventListener("mousedown", handleMouseDown);
    canvasMouse.addEventListener("mousemove", handleMouseMove);
    canvasMouse.addEventListener("mouseup", handleMouseUp);
    canvasMouse.addEventListener("mouseleave", onMouseLeave);
    canvasMouse.addEventListener("dblclick", handleMouseDblClick);
    document.addEventListener("modeChanged", handleChangeMode);

    canvasMouse.addEventListener("touchstart", handleTouchStart);
    canvasMouse.addEventListener("touchmove", handleTouchMove);
    canvasMouse.addEventListener("touchend", handleTouchEnd);
    canvasMouse.addEventListener("touchcancel", handleTouchEnd);
    canvasMouse.addEventListener("touchstart", handleDoubleTap);

    return () => {
      // mouse controls can be applied to the document
      canvasMouse.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleMouseDown);
      canvasMouse.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleMouseMove);
      canvasMouse.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseup", handleMouseUp);
      canvasMouse.removeEventListener("mouseleave", onMouseLeave);
      canvasMouse.removeEventListener("dblclick", handleMouseDblClick);
      document.removeEventListener("modeChanged", handleChangeMode);

      canvasMouse.removeEventListener("touchstart", handleTouchStart);
      canvasMouse.removeEventListener("touchmove", handleTouchMove);
      canvasMouse.removeEventListener("touchend", handleTouchEnd);
      canvasMouse.removeEventListener("touchcancel", handleTouchEnd);
      canvasMouse.removeEventListener("touchstart", handleDoubleTap);
    };
  }, [canvasTemporyRef.current]);

  useEffect(() => {
    actionChangeMode(mode);
    // clearTemporyCanvas();
  }, [mode]);
};