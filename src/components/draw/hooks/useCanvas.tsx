import React, { useEffect, useRef } from "react";
import { clearCanvas, clearCanvasByCtx } from "@/lib/canvas/canvas-tools";

import {
  DRAWING_MODES,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingMode,
  isDrawingShape,
  isDrawingSelect,
  EventDetail,
  ThingsToDraw,
} from "@/lib/canvas/canvas-defines";

import { alertMessage } from "@/components/alert-messages/alertMessage";

import { drawLine } from "./drawLine";
import { drawElement } from "./drawElement";
import { drawSelection } from "./drawSelection";
import { drawFreehand } from "./drawFreehand";
import { drawFindElement } from "./drawFindElement";
import { drawingHandler, returnMouseDown } from "./drawingHandler";
import { getCoordinatesInCanvas } from "@/lib/canvas/canvas-tools";
import { mouseIsInsideComponent } from "@/lib/mouse-position";
import { useZustandDesignStore } from "@/lib/stores/design";
import { Coordinate } from "@/lib/canvas/types";
import { useDrawingContext } from "@/context/DrawingContext";

const TEMPORTY_OPACITY = 0.6;

interface DrawCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasTemporyRef: React.RefObject<HTMLCanvasElement>;
  canvasMouseRef: React.RefObject<HTMLCanvasElement>;
  storeName?: string | null;
  scale: number;
  defaultMode?: string;
}

// Draw on Canvas
export const useCanvas = ({
  canvasRef,
  canvasTemporyRef,
  canvasMouseRef,
  storeName = null,
  scale,
  defaultMode = DRAWING_MODES.DRAW,
}: DrawCanvasProps) => {
  useRef(undefined);
  const mouseOnCtrlPanel = useRef(false);

  const { mode, setDrawingMode, needRefresh, getDrawingParams } =
    useDrawingContext();

  let currentParams = getDrawingParams();
  // drawing handler
  const drawingRef = useRef<drawingHandler | null>(null);
  const lineRef = useRef<drawLine | null>(null);
  const findRef = useRef<drawFindElement | null>(null);
  const selectionRef = useRef<drawSelection | null>(null);
  const elementRef = useRef<drawElement | null>(null);
  const justReload = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const scaleRef = useRef(scale);

  let deleteLastDesignElement = null;
  let refreshCanvas = null;
  let getSelectedDesignElement = null;
  let setSelectedDesignElement = null;
  let deleteDesignElement = null;

  const store = useZustandDesignStore(storeName);
  if (store) {
    ({
      deleteLastDesignElement,
      refreshCanvas,
      getSelectedDesignElement,
      setSelectedDesignElement,
      deleteDesignElement,
    } = store.getState());
  }

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  /**
   * Function to get the last picture in the history for undo action
   */
  const previousPicture = (ctx: CanvasRenderingContext2D | null) => {
    if (ctx === null) {
      return;
    }
    if (deleteLastDesignElement) {
      deleteLastDesignElement();
    }
    if (refreshCanvas) {
      refreshCanvas(ctx, false, scaleRef.current);
    }
  };

  /**
   * Set the context constants
   */
  const setContextConstants = (
    ctx: CanvasRenderingContext2D | null,
    opacity?: number | null
  ) => {
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity ?? 1;
  };
  /**
   * Function to set the context of the canvas
   * @param {HTMLCanvasElement} canvas
   * @param {number} opacity
   */
  const setContext = (
    canvas: HTMLCanvasElement | null,
    context: CanvasRenderingContext2D | null = null,
    scale: number = 1,
    opacity: number | null = null
  ) => {
    if (!canvas) return;
    const ctx = context ?? canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = currentParams.general.color;
    ctx.lineWidth = currentParams.general.lineWidth * scale;

    setContextConstants(ctx, opacity ?? currentParams.general.opacity);
    return ctx;
  };

  /**
   * Function to clear the temporary canvas
   */
  const clearTemporyCanvas = () => {
    if (!canvasTemporyRef.current) return;
    const ctx = canvasTemporyRef.current.getContext("2d");

    if (!ctx) return;
    clearCanvasByCtx(ctx);
  };

  /**
   * Simple refresh canvas
   */
  const simpleRefreshCanvas = (
    withSelected: boolean = true,
    lScale: number = scale
  ) => {
    clearTemporyCanvas();
    if (canvasMouseRef.current) {
      clearCanvas(canvasMouseRef.current);
    }
    if (contextRef.current && refreshCanvas) {
      setContextConstants(contextRef.current);
      refreshCanvas(contextRef.current, withSelected, lScale);
    }
  };

  /**
   * Function to get the coordinates of the mouse in the canvas
   * @param {MouseEvent | TouchEvent} event
   * @param {number} scale
   * @returns {Coordinate} the coordinates of the mouse in the canvas
   */
  const getScaledCoordinatesInCanvas = (
    event: MouseEvent | TouchEvent
  ): Coordinate => {
    if (canvasTemporyRef.current === null) return { x: 0, y: 0 };
    const mode = currentParams.mode;
    // console.log("mode", mode);
    const lScale =
      mode === DRAWING_MODES.SELECT || mode === DRAWING_MODES.SELECT_AREA
        ? 1
        : scaleRef.current;

    return getCoordinatesInCanvas(event, canvasTemporyRef.current, lScale);
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
        lineRef.current = new drawLine(
          canvasRef.current,
          contextRef.current,
          canvasTemporyRef.current,
          setDrawingMode,
          storeName
        );
      }
      newHandler = true; // new initialization for color and width
      drawingHdl = lineRef.current;
    } else if (isDrawingFreehand(mode)) {
      drawingRef.current = new drawFreehand(
        canvasRef.current,
        contextRef.current,
        canvasTemporyRef.current,
        setDrawingMode,
        storeName
      );
      newHandler = true;
      drawingHdl = drawingRef.current;
    } else if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      if (elementRef.current === null) {
        elementRef.current = new drawElement(
          canvasRef.current,
          contextRef.current,
          canvasTemporyRef.current,
          setDrawingMode,
          storeName
        );
        newHandler = true;
      }

      drawingHdl = elementRef.current;
    } else if (isDrawingSelect(mode)) {
      if (selectionRef.current === null) {
        selectionRef.current = new drawSelection(
          canvasRef.current,
          contextRef.current,
          canvasTemporyRef.current,
          setDrawingMode,
          storeName
        );
        newHandler = true;
      }
      drawingHdl = selectionRef.current;
    } else {
      // Find mode is default mode
      if (findRef.current === null) {
        findRef.current = new drawFindElement(
          canvasRef.current,
          contextRef.current,
          canvasTemporyRef.current,
          setDrawingMode,
          storeName
        );
      }
      drawingHdl = findRef.current;
    }

    if (newHandler && drawingHdl) {
      currentParams = getDrawingParams();
      // console.log("initData ->", currentParams);
      drawingHdl.initData(currentParams);
      drawingHdl.setMouseCanvas(canvasMouseRef.current);
    } else {
      drawingHdl.newElement(mode, currentParams);
    }

    drawingHdl.setScale(scaleRef.current);

    return drawingHdl;
  };

  const generalInitialisation = () => {
    // Initialize canvas
    currentParams = getDrawingParams();
    setDrawingMode(defaultMode);

    if (setSelectedDesignElement) {
      setSelectedDesignElement(null);
    }

    lineRef.current = null;
    elementRef.current = null;

    if (contextRef.current === null && canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
    }

    if (selectionRef.current !== null) selectionRef.current.eraseSelectedArea();

    if (canvasRef.current && contextRef.current) {
      contextRef.current.globalCompositeOperation = "source-over";
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

  /**
   * Handle mouse down event (no touch event)
   * @param event - MouseEvent
   * @returns void
   */
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

    const coord = getCoordinatesInCanvas(
      event,
      canvasTemporyRef.current,
      scaleRef.current
    );

    const ret = drawingRef.current.actionMouseDown(event, coord);
    if (!ret.toExtend) {
      stopExtendMouseEvent();
    }
  };

  const handleMouseMoveExtend = (event: MouseEvent | TouchEvent) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (
      !canvasTemporyRef.current ||
      canvasTemporyRef.current.contains(event.target as Node)
    ) {
      return;
    }
    const coord = getCoordinatesInCanvas(
      event,
      canvasTemporyRef.current,
      scaleRef.current
    );
    drawingRef.current?.actionMouseMove(event, coord);
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
    currentParams = getDrawingParams();
    // console.log("paramChanged mode", currentParams.mode);

    if (!drawingRef.current) return;
    drawingRef.current.changeData(currentParams);

    if (
      currentParams.mode === DRAWING_MODES.PAUSE ||
      currentParams.mode === DRAWING_MODES.FIND
    )
      return;

    // console.log("paramChange -> refreshDrawing");
    drawingRef.current.refreshDrawing(
      currentParams.general.opacity,
      null,
      "paramChange"
    );
  };

  /**
   * Function to change the drawing mode
   * @param {string} newMode - new drawing mode
   */
  const actionChangeMode = (newMode: string) => {
    currentParams = getDrawingParams();

    if (newMode === DRAWING_MODES.INIT) {
      generalInitialisation();
      return;
    }

    if (justReload.current) {
      justReload.current = false;
      return;
    }

    const reload = newMode === DRAWING_MODES.RELOAD;

    const selectedDesignElement: ThingsToDraw | null = reload
      ? getSelectedDesignElement
        ? getSelectedDesignElement()
        : null
      : null;

    if (reload && selectedDesignElement) {
      newMode = selectedDesignElement.type;
    }
    currentParams.mode = newMode;

    // end previous action then changing mode
    if (drawingRef.current) {
      drawingRef.current.endAction(newMode);
    }
    stopExtendMouseEvent();

    // set the tempory canvas
    if (canvasTemporyRef.current) {
      setContext(
        canvasTemporyRef.current as HTMLCanvasElement,
        null,
        TEMPORTY_OPACITY
      );
      // set the mouse canvas
      if (canvasMouseRef.current) {
        setContext(
          canvasMouseRef.current as HTMLCanvasElement,
          null,
          scaleRef.current,
          TEMPORTY_OPACITY
        );
      }
    }
    // console.log("newMode", newMode, reload ? "reload" : "no reload");

    // set the new drawing mode
    drawingRef.current = selectDrawingHandler(newMode);

    if (reload && selectedDesignElement) {
      // reload draw from history
      // console.log("reload draw from history", selectedDesignElement);
      drawingRef.current.setDraw(selectedDesignElement);
      setTimeout(
        () => {
          drawingRef.current?.refreshDrawing(
            currentParams.general.opacity,
            null,
            "reload"
          );
          // hight light drawing when reload
          // console.log("hight Light");
          drawingRef.current?.hightLightDrawing();
        },
        newMode === DRAWING_MODES.IMAGE ? 5 : 0
      );
      if (canvasRef.current && refreshCanvas) {
        refreshCanvas(contextRef.current, false, scaleRef.current);
      }

      mouseOnCtrlPanel.current = false;
      justReload.current = true;
      setDrawingMode(newMode);
      return;
    }

    setTimeout(() => {
      drawingRef.current?.startAction();
      drawingRef.current?.refreshDrawing(
        currentParams.general.opacity,
        null,
        "show"
      );
    }, 20);
  };

  /**
   * Function to get the nearest position to the mouse inside the canvas
   * @param {Coordinate} position - position of the mouse
   * @returns {Coordinate} - nearest position
   */
  const nearestPosition = (position?: Coordinate) => {
    if (!position || !canvasTemporyRef.current) {
      return null;
    }
    // Check if position is inside canvas and adjust if needed
    const canvas = canvasTemporyRef.current;
    const bounds = canvas.getBoundingClientRect();
    const margin = 5;

    // Adjust x coordinate if needed
    if (position.x < bounds.left + margin) {
      position.x = bounds.left + margin;
    } else if (position.x > bounds.right - margin) {
      position.x = bounds.right - margin;
    }

    // Adjust y coordinate if needed
    if (position.y < bounds.top + margin) {
      position.y = bounds.top + margin;
    } else if (position.y > bounds.bottom - margin) {
      position.y = bounds.bottom - margin;
    }
    return {
      x: Math.round(position.x - bounds.left),
      y: Math.round(position.y - bounds.top),
    };
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
        drawingRef.current?.actionAbort();
        generalInitialisation();
        clearCanvasByCtx(contextRef.current);
        clearTemporyCanvas();
        break;
      case DRAWING_MODES.REFRESH:
        simpleRefreshCanvas(false, scaleRef.current);
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
        previousPicture(contextRef.current);
        break;
      case DRAWING_MODES.ABORT:
        const mode = drawingRef.current.actionAbort();
        if (mode) {
          setDrawingMode(mode);
        }
        break;
      case DRAWING_MODES.VALID:
        drawingRef.current.actionValid();
        break;
      case DRAWING_MODES.SAVE:
        if (selectionRef.current === null) {
          selectDrawingHandler(DRAWING_MODES.SELECT);
        }
        setTimeout(() => {
          selectionRef.current?.saveCanvas(filename, event.detail?.format);
        }, 20);
        break;
      case DRAWING_MODES.LOAD:
        {
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
      case DRAWING_MODES.IMAGE_RADIUS:
        if (selectionRef.current !== null) {
          alertMessage("Radius (" + value + ") on selection");
          selectionRef.current.radiusSelection(value as number);
        }
        break;
      case DRAWING_MODES.CLOSE_PATH:
      case DRAWING_MODES.STOP_PATH:
        if (lineRef.current !== null) {
          lineRef.current?.actionEndPath(eventAction);
          stopExtendMouseEvent();
          setDrawingMode(DRAWING_MODES.LINES_PATH);
        }
        break;
      case DRAWING_MODES.SELECT_AREA:
        // restart action for selection zone
        if (selectionRef.current !== null) {
          selectionRef.current.startAction();
          selectionRef.current.refreshDrawing();
        }
        break;
      case DRAWING_MODES.POSITION:
        const position = nearestPosition(event.detail.position);
        if (position) {
          if (drawingRef.current) {
            const type = drawingRef.current.getType();
            // console.log("type:", type, "position:", position);
            if (isDrawingShape(type)) {
              drawingRef.current.actionMouseMove(null, position);
            }
          }
        }
        break;

      default:
        console.error("Action not found : ", eventAction);
    }
  };

  /**
   * Function to start drawing on the canvas
   * @param {Event} event
   */
  const actionMouseDown = (
    event: MouseEvent | TouchEvent,
    touchDevice: boolean = false
  ) => {
    if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel

    if (!canvasRef.current) {
      console.error(
        canvasRef.current == null ? "canvas" : "drawingParams",
        "is null"
      );
      return;
    }

    // get color and width painting in currentParams
    currentParams = getDrawingParams();

    setContext(canvasRef.current, contextRef.current, scale);

    const coord = getScaledCoordinatesInCanvas(event);

    // drawingRef.current?.setType(currentParams.mode);
    drawingRef.current?.setScale(scaleRef.current);
    let mouseResult: returnMouseDown | null | undefined = undefined;
    if (touchDevice) {
      mouseResult = drawingRef.current?.actionTouchDown(
        event as TouchEvent,
        coord
      );
    } else {
      mouseResult = drawingRef.current?.actionMouseDown(event, coord);
    }

    if (mouseResult?.toExtend) {
      extendMouseEvent();
    } else {
      stopExtendMouseEvent();
    }

    if (mouseResult?.deleteId && deleteDesignElement) {
      deleteDesignElement(mouseResult.deleteId);
    }

    if (mouseResult?.toReset) {
      drawingRef.current?.endAction();
      // restart with basic drawing mode
      setDrawingMode(DRAWING_MODES.FIND);
      if (setSelectedDesignElement) {
        setSelectedDesignElement(null);
      }

      drawingRef.current = selectDrawingHandler(DRAWING_MODES.FIND);
      drawingRef.current?.setType(DRAWING_MODES.FIND);
      drawingRef.current?.setScale(scale);
    }
    if (mouseResult?.changeMode) {
      // console.log("changeMode", mouseResult.changeMode);
      setDrawingMode(mouseResult.changeMode);
      needRefresh();
    }
    if (mouseResult?.pointer && canvasTemporyRef.current) {
      canvasTemporyRef.current.style.cursor = mouseResult.pointer;
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
    setContext(canvasMouse, null, scaleRef.current);

    const handleMouseUp = () => {
      drawingRef.current?.actionMouseUp();
    };
    const handleMouseDown = (event: MouseEvent) => {
      actionMouseDown(event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel
      if (!canvasTemporyRef.current || !drawingRef.current) return;

      const coord = getScaledCoordinatesInCanvas(event);
      const pointer = drawingRef.current?.actionMouseMove(event, coord);

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
          // drawing mode are managed by the useEffect
          if (!isDrawingMode(newMode)) {
            console.error("Mode not found : ", newMode);
          }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel
      if (mouseIsInsideComponent(event, canvasTemporyRef.current)) {
        event.preventDefault();
      }

      actionMouseDown(event, true);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (mouseOnCtrlPanel.current === true) return;
      if (!canvasTemporyRef.current) return;

      if (mouseIsInsideComponent(event, canvasTemporyRef.current)) {
        event.preventDefault();
      }
      const coord = getCoordinatesInCanvas(
        event,
        canvasTemporyRef.current,
        scaleRef.current
      );

      drawingRef.current?.actionMouseMove(event, coord);
    };

    const handleTouchEnd = () => {
      if (canvasRef.current) {
        drawingRef.current?.actionTouchEnd();
      }
      stopExtendMouseEvent();
    };
    const handleDoubleTap = (() => {
      let lastTap = 0;
      const delay = 300;

      return (event: TouchEvent) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < delay && tapLength > 0) {
          event.preventDefault();
          drawingRef.current?.actionMouseDblClick();
        }

        lastTap = currentTime;
      };
    })();

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
  }, [mode]);

  useEffect(() => {
    const lScale = scaleRef.current;
    if (drawingRef.current) {
      drawingRef.current.setScale(lScale);
    }
    setContext(canvasMouseRef.current, null, lScale);
    setContext(canvasTemporyRef.current, null, lScale);
  }, [scaleRef.current]);

  return {
    simpleRefreshCanvas,
  };
};
