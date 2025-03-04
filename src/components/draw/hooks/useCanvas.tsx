import React, { useEffect, useRef } from "react";
import { clearCanvasByCtx, duplicateCanvas } from "@/lib/canvas/canvas-tools";

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

import { DesignState } from "@/lib/stores/design";

import { alertMessage } from "@/components/alert-messages/alertMessage";

import { drawLine } from "./drawLine";
import { drawShape } from "./drawShape";
import { drawSelection } from "./drawSelection";
import { drawFreehand } from "./drawFreehand";
import { drawFindElement } from "./drawFindElement";
import { drawingHandler, returnMouseDown } from "./drawingHandler";
import { getCoordinatesInCanvas } from "@/lib/canvas/canvas-tools";
import {
  mouseIsInsideComponent,
  setMarginOnBorder,
} from "@/lib/mouse-position";
import { useZustandDesignStore } from "@/lib/stores/design";
import { Coordinate } from "@/lib/canvas/types";
import { useDrawingContext } from "@/context/DrawingContext";
import { isTouchDevice } from "@/lib/utils/device";

const TEMPORTY_OPACITY = 0.6;

interface DrawCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  storeName?: string | null;
  scale: number;
  defaultMode?: string;
}

// Draw on Canvas
/**
 * Custom hook for managing canvas drawing functionality
 * @param {DrawCanvasProps} props - Canvas properties including:
 *   - canvasRef: Reference to the main canvas element
 *   - storeName: Optional name for the store
 *   - scale: Scale factor for drawing
 *   - defaultMode: Default drawing mode (defaults to DRAW)
 * @returns {Object} Canvas state including:
 *   - tempCanvas: Temporary canvas for in-progress drawing
 *   - simpleRefreshCanvas: Function to refresh canvas
 */
export const useCanvas = ({
  canvasRef,
  storeName = null,
  scale,
  defaultMode = DRAWING_MODES.DRAW,
}: DrawCanvasProps) => {
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseOnCtrlPanel = useRef(false);

  const { mode, setDrawingMode, needRefresh, getDrawingParams } =
    useDrawingContext();

  let currentParams = getDrawingParams();
  // Drawing handler references
  const drawingRef = useRef<drawingHandler | null>(null);
  const lineRef = useRef<drawLine | null>(null);
  const findRef = useRef<drawFindElement | null>(null);
  const selectionRef = useRef<drawSelection | null>(null);
  const elementRef = useRef<drawShape | null>(null);
  const justReload = useRef(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const scaleRef = useRef(scale);
  const lastModeRef = useRef(currentParams.mode);
  const namedStoreRef = useRef<DesignState | null>(null);
  const storeNameRef = useRef<string | null>(null);

  if (storeNameRef.current !== storeName) {
    storeNameRef.current = storeName;
    findRef.current = null;

    console.log("useCanvas storeName", storeName);
    namedStoreRef.current = useZustandDesignStore(storeName).getState();
  }

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Create working canvases
  useEffect(() => {
    if (!canvasRef.current) return;

    if (contextRef.current === null) {
      contextRef.current = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
    }

    // Create temporary canvas
    const newTempCanvas = duplicateCanvas(canvasRef.current);
    tempCanvasRef.current = newTempCanvas;

    // Observe resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        newTempCanvas.width = width;
        newTempCanvas.height = height;
      }
    });

    resizeObserver.observe(canvasRef.current);

    return () => {
      resizeObserver.disconnect();
      newTempCanvas.remove();
    };
  }, [canvasRef.current]);

  /**
   * Get the last picture in history for undo action
   */
  const previousPicture = async (ctx: CanvasRenderingContext2D | null) => {
    if (ctx === null) {
      return;
    }
    if (namedStoreRef.current) {
      namedStoreRef.current.deleteLastDesignElement();
    }
    if (findRef.current) {
      await findRef.current.refreshCanvas(true, scaleRef.current);
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
   * Set the context of the canvas
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
   * Clear the temporary canvas
   */
  const clearTemporaryCanvas = () => {
    if (!tempCanvasRef.current) return;
    const ctx = tempCanvasRef.current.getContext("2d");

    if (!ctx) return;
    clearCanvasByCtx(ctx);
  };

  /**
   * Simple refresh canvas
   */
  const simpleRefreshCanvas = async (
    withSelected: boolean = true,
    lScale: number = scale
  ) => {
    if (contextRef.current) {
      setContextConstants(contextRef.current);

      if (!findRef.current) {
        selectDrawingHandler(DRAWING_MODES.FIND);
      }
      if (findRef.current) {
        await findRef.current.refreshCanvas(withSelected, lScale);
      }
    }
  };

  /**
   * Get the coordinates of the mouse in the canvas
   * @param {MouseEvent | TouchEvent} event
   * @param {number} scale
   * @returns {Coordinate} the coordinates of the mouse in the canvas
   */
  const getScaledCoordinatesInCanvas = (
    event: MouseEvent | TouchEvent
  ): Coordinate => {
    if (tempCanvasRef.current === null) return { x: 0, y: 0 };
    const mode = currentParams.mode;
    // console.log("mode", mode);
    const lScale =
      mode === DRAWING_MODES.SELECT || mode === DRAWING_MODES.SELECT_AREA
        ? 1
        : scaleRef.current;

    return getCoordinatesInCanvas(event, tempCanvasRef.current, lScale);
  };
  /**
   * Select the drawing handler according to the mode
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
          tempCanvasRef.current,
          setDrawingMode
        );
        newHandler = true;
      }
      drawingHdl = lineRef.current;
    } else if (isDrawingFreehand(mode)) {
      drawingRef.current = new drawFreehand(
        canvasRef.current,
        contextRef.current,
        tempCanvasRef.current,
        setDrawingMode
      );
      newHandler = true;
      drawingHdl = drawingRef.current;
    } else if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      if (elementRef.current === null) {
        elementRef.current = new drawShape(
          canvasRef.current,
          contextRef.current,
          tempCanvasRef.current,
          setDrawingMode
        );
        newHandler = true;
      }

      drawingHdl = elementRef.current;
    } else if (isDrawingSelect(mode)) {
      if (selectionRef.current === null) {
        selectionRef.current = new drawSelection(
          canvasRef.current,
          contextRef.current,
          tempCanvasRef.current,
          setDrawingMode
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
          tempCanvasRef.current,
          setDrawingMode,
          storeName
        );
        newHandler = true;
      }
      drawingHdl = findRef.current;
    }

    currentParams = getDrawingParams();
    if (newHandler && drawingHdl) {
      drawingHdl.initData(currentParams);
    } else {
      drawingHdl.newElement(currentParams);
    }

    drawingHdl.setScale(scaleRef.current);

    return drawingHdl;
  };

  /**
   * Record the design element in the store
   */
  const recordDesignElement = async () => {
    if (namedStoreRef.current) {
      const element = drawingRef.current?.getLastDraw();
      if (element) {
        await namedStoreRef.current.addOrUpdateDesignElement(element);
      }
    }
  };

  const setSelectedDesignElement = (elementId: string | null) => {
    if (namedStoreRef.current) {
      namedStoreRef.current.setSelectedDesignElement(elementId);
    }
  };

  const generalInitialisation = () => {
    // Initialize canvas
    currentParams = getDrawingParams();
    setDrawingMode(defaultMode);

    setSelectedDesignElement(null);

    lineRef.current = null;
    elementRef.current = null;

    if (selectionRef.current !== null) selectionRef.current.eraseSelectedArea();

    if (canvasRef.current && contextRef.current) {
      contextRef.current.globalCompositeOperation = "source-over";
    }

    if (isTouchDevice()) {
      setMarginOnBorder(10);
    }
  };

  const handleMouseUpExtend = (event: MouseEvent) => {
    if (!tempCanvasRef.current || !(event.target instanceof Node)) return;
    if (tempCanvasRef.current.contains(event.target)) {
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
    if (
      !drawingRef.current ||
      !tempCanvasRef.current ||
      !(event.target instanceof Node)
    )
      return;
    if (tempCanvasRef.current.contains(event.target)) {
      return;
    }
    // draw line can be extended outside the canvas
    // but not when the mouse is on the control panel
    if (mouseOnCtrlPanel.current) {
      return;
    }

    const coord = getCoordinatesInCanvas(
      event,
      tempCanvasRef.current,
      scaleRef.current
    );

    const ret = drawingRef.current.actionMouseDown(event, coord);
    if (!ret.toExtend) {
      stopExtendMouseEvent();
    }
  };

  const handleMouseMoveExtend = (event: MouseEvent | TouchEvent) => {
    if (!tempCanvasRef.current || !(event.target instanceof Node)) return;
    if (tempCanvasRef.current.contains(event.target)) {
      return;
    }
    const coord = getCoordinatesInCanvas(
      event,
      tempCanvasRef.current,
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
   * Get the current parameters for drawing
   * Called when user changes something in the drawing panel
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
   * Change the drawing mode
   * @param {string} newMode - new drawing mode
   */
  const actionChangeMode = async (newMode: string) => {
    currentParams = getDrawingParams();

    if (newMode === DRAWING_MODES.INIT) {
      generalInitialisation();
      return;
    }

    // Handle mouse events for PAUSE mode
    if (tempCanvasRef.current) {
      if (newMode === DRAWING_MODES.PAUSE) {
        // Disable mouse events when paused
        tempCanvasRef.current.style.pointerEvents = "none";
      } else if (lastModeRef.current === DRAWING_MODES.PAUSE) {
        // Re-enable mouse events when leaving pause mode
        tempCanvasRef.current.style.pointerEvents = "auto";
      }
    }
    lastModeRef.current = newMode;

    if (justReload.current) {
      justReload.current = false;
      return;
    }

    const reload = newMode === DRAWING_MODES.RELOAD;
    let selectedDesignElement = null;
    if (reload && namedStoreRef.current) {
      selectedDesignElement = namedStoreRef.current.getSelectedDesignElement();

      if (selectedDesignElement) {
        newMode = selectedDesignElement.type;
      }
      currentParams.mode = newMode;
    }

    // end previous action then changing mode
    if (drawingRef.current) {
      drawingRef.current.endAction(newMode);
    }
    stopExtendMouseEvent();

    // set the temporary canvas
    if (tempCanvasRef.current) {
      setContext(tempCanvasRef.current, null, TEMPORTY_OPACITY);
    }
    // set the new drawing mode
    drawingRef.current = selectDrawingHandler(newMode);

    if (reload && selectedDesignElement) {
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
      if (findRef.current) {
        await findRef.current.refreshCanvas(false, scaleRef.current);
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
   * Get the nearest position to the mouse inside the canvas
   * @param {Coordinate} position - position of the mouse
   * @returns {Coordinate} - nearest position
   */
  const nearestPosition = (position?: Coordinate) => {
    if (!position || !tempCanvasRef.current) {
      return null;
    }
    // Check if position is inside canvas and adjust if needed
    const canvas = tempCanvasRef.current;
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
        clearTemporaryCanvas();
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
        clearTemporaryCanvas();
        previousPicture(contextRef.current);
        break;
      case DRAWING_MODES.ABORT:
        const mode = drawingRef.current.actionAbort();
        if (mode === DRAWING_MODES.RECORD) {
          recordDesignElement();
        } else if (mode) {
          setDrawingMode(mode);
        }
        break;
      case DRAWING_MODES.VALID:
        if (drawingRef.current) {
          drawingRef.current.actionValid();
          recordDesignElement();
        }
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
        if (selectionRef.current.deleteSelection()) {
          recordDesignElement();
        }
        break;
      case DRAWING_MODES.CUT:
        if (selectionRef.current === null) {
          console.log("selectionRef.current is null");
          return;
        }
        alertMessage("Cut the selection");
        if (selectionRef.current.cutSelection()) {
          recordDesignElement();
        }
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
   * Start drawing on the canvas
   * @param {Event} event - Mouse or touch event
   * @param {boolean} touchDevice - Whether event is from touch device
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

    if (mouseResult?.reccord) {
      recordDesignElement();
    }

    if (mouseResult?.toExtend) {
      extendMouseEvent();
    } else {
      stopExtendMouseEvent();
    }

    if (mouseResult?.deleteId) {
      if (namedStoreRef.current) {
        namedStoreRef.current.deleteDesignElement(mouseResult.deleteId);
      }
    }

    if (mouseResult?.toReset) {
      drawingRef.current?.endAction();
      // restart with basic drawing mode
      setDrawingMode(DRAWING_MODES.FIND);
      setSelectedDesignElement(null);

      drawingRef.current = selectDrawingHandler(DRAWING_MODES.FIND);
      drawingRef.current?.setType(DRAWING_MODES.FIND);
      drawingRef.current?.setScale(scale);
    }
    if (mouseResult?.changeMode) {
      // console.log("changeMode", mouseResult.changeMode);
      setDrawingMode(mouseResult.changeMode);
      needRefresh();
    }
    if (mouseResult?.pointer && tempCanvasRef.current) {
      tempCanvasRef.current.style.cursor = mouseResult.pointer;
    }
  };

  /**
   * Erase temporary canvas when mouse leaves the canvas
   */
  const onMouseLeave = () => {
    drawingRef.current && drawingRef.current.actionMouseLeave();
  };

  useEffect(() => {
    const canvasWithEvent = tempCanvasRef.current;
    if (!canvasWithEvent) {
      return;
    }

    setContext(canvasWithEvent, null, scaleRef.current);

    const handleMouseUp = () => {
      drawingRef.current?.actionMouseUp();
    };
    const handleMouseDown = (event: MouseEvent) => {
      actionMouseDown(event);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseOnCtrlPanel.current === true) return; // mouse is on the control panel
      if (!tempCanvasRef.current || !drawingRef.current) return;

      const coord = getScaledCoordinatesInCanvas(event);
      const pointer = drawingRef.current?.actionMouseMove(event, coord);

      if (pointer) {
        canvasWithEvent.style.cursor = pointer;
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
      if (mouseIsInsideComponent(event, tempCanvasRef.current)) {
        event.preventDefault();
      }

      actionMouseDown(event, true);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (mouseOnCtrlPanel.current === true) return;
      if (!tempCanvasRef.current) return;

      if (mouseIsInsideComponent(event, tempCanvasRef.current)) {
        event.preventDefault();
      }
      const coord = getCoordinatesInCanvas(
        event,
        tempCanvasRef.current,
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

    // Enable pointer events when not in PAUSE mode
    if (currentParams.mode === DRAWING_MODES.PAUSE) {
      canvasWithEvent.style.pointerEvents = "none";
    } else {
      canvasWithEvent.style.pointerEvents = "auto";
    }

    canvasWithEvent.addEventListener("mousedown", handleMouseDown);
    canvasWithEvent.addEventListener("mousemove", handleMouseMove);
    canvasWithEvent.addEventListener("mouseup", handleMouseUp);
    canvasWithEvent.addEventListener("mouseleave", onMouseLeave);
    canvasWithEvent.addEventListener("dblclick", handleMouseDblClick);
    document.addEventListener("modeChanged", handleChangeMode);

    canvasWithEvent.addEventListener("touchstart", handleTouchStart);
    canvasWithEvent.addEventListener("touchmove", handleTouchMove);
    canvasWithEvent.addEventListener("touchend", handleTouchEnd);
    canvasWithEvent.addEventListener("touchcancel", handleTouchEnd);
    canvasWithEvent.addEventListener("touchstart", handleDoubleTap);

    return () => {
      // mouse controls can be applied to the document
      canvasWithEvent.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousedown", handleMouseDown);
      canvasWithEvent.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousemove", handleMouseMove);
      canvasWithEvent.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseup", handleMouseUp);
      canvasWithEvent.removeEventListener("mouseleave", onMouseLeave);
      canvasWithEvent.removeEventListener("dblclick", handleMouseDblClick);
      document.removeEventListener("modeChanged", handleChangeMode);

      canvasWithEvent.removeEventListener("touchstart", handleTouchStart);
      canvasWithEvent.removeEventListener("touchmove", handleTouchMove);
      canvasWithEvent.removeEventListener("touchend", handleTouchEnd);
      canvasWithEvent.removeEventListener("touchcancel", handleTouchEnd);
      canvasWithEvent.removeEventListener("touchstart", handleDoubleTap);
    };
  }, [tempCanvasRef.current]);

  useEffect(() => {
    actionChangeMode(mode);
  }, [mode]);

  useEffect(() => {
    const lScale = scaleRef.current;
    if (drawingRef.current) {
      drawingRef.current.setScale(lScale);
    }
    setContext(tempCanvasRef.current, null, lScale);
  }, [scaleRef.current]);

  return {
    tempCanvas: tempCanvasRef.current,
    simpleRefreshCanvas,
    clearTemporaryCanvas,
  };
};
