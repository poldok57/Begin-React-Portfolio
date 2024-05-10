import { useEffect, useRef } from "react";
import { BORDER, mousePointer, isInside } from "../../lib/mouse-position";
import {
  undoHistory,
  addPictureToHistory,
  getCurrentHistory,
} from "../../lib/canvas/canvas-history";
import {
  clearCanvasByCtx,
  getCoordinates,
} from "../../lib/canvas/canvas-tools";

import { showElement, resizingElement } from "../../lib/canvas/canvas-elements";
import { isOnSquareBorder, getSquareOffset } from "../../lib/square-position";

import {
  DRAWING_MODES,
  isDrawingAllLines,
  isDrawingFreehand,
  isDrawingMode,
  isDrawingShape,
  isDrawingLine,
} from "../../lib/canvas/canvas-defines";

import { alertMessage } from "../../hooks/alertMessage";
import { imageSize } from "../../lib/canvas/canvas-size";
import { DrawLine } from "./DrawLine";

const TEMPORTY_OPACITY = 0.6;
// Draw on Canvas
export const DrawCanvas = ({ canvas: canvasRef, getParams }) => {
  const drawLine = new DrawLine(canvasRef.current);

  const drawingParams = useRef(null);
  const canvasMouseRef = useRef(null);
  const canvasTemporyRef = useRef(null);
  const mouseOnCtrlPanel = useRef(false);

  const [WIDTH, HEIGHT] = [560, 315]; // 16:9 aspact ratio
  const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

  const squareRef = useRef(null);
  const offsetRef = useRef({ x: -SQUARE_WIDTH / 2, y: -SQUARE_HEIGHT / 2 });

  let element = {
    fixed: false,
    isResizing: null,
    coordinates: null,
  };

  const initShape = (type = DRAWING_MODES.SQUARE) => {
    squareRef.current = {
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
    element.fixed = false;
    offsetRef.current = { x: -SQUARE_WIDTH / 2, y: -SQUARE_HEIGHT / 2 };
  };

  /**
   * Function to save the current state of the canvas
   */
  function savePicture(canvas) {
    // Save the current state of the canvas
    if (!canvas) return;
    // console.log("add picture to histo");
    addPictureToHistory({
      canvas,
      coordinate: drawLine.getStartCoordinates(),
    });
  }

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
    // record
    // savePicture(canvasRef.current);
    // initialise the mouse canvas
    setContext(canvasMouseRef.current);
    setContext(canvasTemporyRef.current, TEMPORTY_OPACITY);

    // set the canvas for the drawLine
    drawLine.setCanvas(canvasRef.current);
    drawLine.setMouseCanvas(canvasMouseRef.current);
    drawLine.setTemporyCanvas(canvasTemporyRef.current);
    drawLine.setLineWidth(drawingParams.current.general.lineWidth);
    drawLine.setStrokeStyle(drawingParams.current.general.color);
  };

  const handleMouseUpExtend = (event) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target)) {
      return;
    }
    if (!isDrawingLine(drawingParams.current.mode)) return;
    drawLine.actionMouseUp(drawingParams.current.mode);
  };
  const handleMouseDownExtend = (event) => {
    // the event is inside the canvas, let event on the canvas to be handled
    if (canvasMouseRef.current.contains(event.target)) {
      return;
    }
    // only draw line can be extended outside the canvas
    // but not when the mouse is on the control panel
    if (
      !isDrawingLine(drawingParams.current.mode) ||
      mouseOnCtrlPanel.current ||
      drawLine.getStartCoordinates() == null // should not happen, but just in case
    ) {
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
    drawLine.actionMouseMove(drawingParams.current.mode, event);
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
   * Function to mémorize the selected zone
   * @param {object} area - {x, y, width, height} of the selected zone
   */
  const memorizeSelectedZone = (area = null) => {
    if (squareRef.current.type !== DRAWING_MODES.SELECT) {
      return;
    }
    if (area == null) {
      const { x, y, width, height } = squareRef.current;
      area = { x, y, width, height };
    }
    drawingParams.current.selectedArea = area;
  };
  /**
   * Function to get the current parameters for drawing
   * call then user change something in the drawing panel
   */
  const drawingParamChanged = () => {
    drawingParams.current = getParams();
    const mode = drawingParams.current.mode;
    if (isDrawingShape(mode)) {
      squareRef.current.general = { ...drawingParams.current.general };
      squareRef.current.shape = { ...drawingParams.current.shape };

      if (drawingParams.current.shape.withBorder) {
        squareRef.current.border = { ...drawingParams.current.border };
      }
      if (drawingParams.current.shape.withText) {
        squareRef.current.text = { ...drawingParams.current.text };
      }
      // clear the temporary canvas and show the element
      refreshElement();
    } else if (mode === DRAWING_MODES.TEXT) {
      squareRef.current.text = { ...drawingParams.current.text };
      refreshElement();
    } else if (isDrawingAllLines(mode)) {
      drawLine.setLineWidth(drawingParams.current.general.lineWidth);
      drawLine.setStrokeStyle(drawingParams.current.general.color);
      if (isDrawingLine(mode)) {
        drawLine.showTemporyLine(mode, drawingParams.current.general.opacity);
      }
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
      squareRef.current = { ...squareRef.current, ...rect };
      element.fixed = true;
      squareRef.current.type = DRAWING_MODES.SELECT;
      memorizeSelectedZone(rect);
      refreshElement();
    }

    // drawingParams.current.mode = newMode;
    if (isDrawingShape(newMode) || newMode === DRAWING_MODES.TEXT) {
      if (squareRef.current === null) {
        initShape(newMode);
      } else {
        squareRef.current.type = newMode;
      }
      drawLine.eraseStartCoordinates();

      refreshElement();
    } else if (isDrawingFreehand(newMode)) {
      drawLine.eraseStartCoordinates();
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
        drawLine.isDrawing(false);
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
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   * @param {string} mode - drawing mode
   * @param {object} coord - {x, y}
   * @param {object} square
   */
  const handleMouseOnElement = (mode, coord, square) => {
    return isOnSquareBorder({
      coord,
      square,
      withButton: true,
      withResize: mode !== DRAWING_MODES.TEXT,
      withMiddleButton: square.withMiddleButton,
      maxWidth: WIDTH,
    });
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
      if (element.fixed) {
        const mouseOnShape = handleMouseOnElement(
          drawingParams.current.mode,
          element.coordinates,
          squareRef.current
        );
        if (mouseOnShape) {
          // Clic on the shape --------
          if (mouseOnShape === BORDER.INSIDE) {
            offsetRef.current = getSquareOffset(
              element.coordinates,
              squareRef.current
            );
            canvasMouseRef.current.style.cursor = "pointer";
            element.fixed = false;
          } else if (mouseOnShape === BORDER.ON_BUTTON) {
            canvasMouseRef.current.style.cursor = "pointer";
            validDrawedElement();
          } else if (mouseOnShape === BORDER.ON_BUTTON_LEFT) {
            squareRef.current.rotation -= Math.PI / 16;
            refreshElement();
          } else if (mouseOnShape === BORDER.ON_BUTTON_RIGHT) {
            squareRef.current.rotation += Math.PI / 16;
            refreshElement();
          } else {
            element.isResizing = mouseOnShape;
            console.log("resizing element: ", mouseOnShape);
          }
        }
      }
    }

    alertMessage(
      `Start ${drawingParams.current.mode} : + color:${drawingParams.current.general.color}`
    );
  };

  /**
   * Function to resize the square on the canvas
   * @param {Event} event
   * @param {HTMLCanvasElement} canvas
   */
  const resizingSquare = (canvas) => {
    const context = setContext(canvas);
    if (!context) return;

    clearCanvasByCtx(context);

    const newCoord = resizingElement(
      context,
      squareRef.current,
      element.coordinates,
      element.isResizing
    );

    if (newCoord) {
      squareRef.current = { ...squareRef.current, ...newCoord };
    }
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
      element.fixed = true;
      element.isResizing = null;
      // element.coordinates = null;
    }
  };

  /**
   * Function to move an element on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} coord - {x, y}
   * @param {string} mouseOnShape - border or button where the mouse is
   */
  const moveElement = (ctx, coord, mouseOnShape = null) => {
    const square = squareRef.current;
    const oldX = square.x,
      oldY = square.y,
      oldRotation = square.rotation;
    if (!element.fixed) {
      square.x = coord.x + offsetRef.current.x;
      square.y = coord.y + offsetRef.current.y;
    }
    // if element didn't move don't show the buttons
    const withBtn =
      oldX === square.x && oldY === square.y && oldRotation === square.rotation;

    showElement(ctx, squareRef.current, withBtn, mouseOnShape);
  };
  /**
   * Function to refresh the element on the tempory canvas
   */
  const refreshElement = () => {
    const context = canvasTemporyRef.current.getContext("2d");
    if (!context) {
      return;
    }
    clearCanvasByCtx(context);
    showElement(context, squareRef.current, true);
  };
  /**
   * Function to draw an element on the MAIN canvas
   */
  const validDrawedElement = () => {
    const canvas = canvasRef.current;
    const context = setContext(canvas);
    if (!context) {
      return;
    }

    showElement(context, squareRef.current, false);

    savePicture(canvas);

    // init for next shape
    initShape(drawingParams.current.mode);
    clearTemporyCanvas();
    drawingParams.current.mode = DRAWING_MODES.DRAW;
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const onMouseLeave = () => {
    const context = canvasTemporyRef.current.getContext("2d");
    if (!context || !drawingParams.current) {
      return;
    }
    const mode = drawingParams.current.mode;
    // dont erase the fixed element (square, circle or text)
    if (mode === DRAWING_MODES.ARC || (isDrawingShape(mode) && element.fixed)) {
      return;
    }

    clearCanvasByCtx(context);
    clearCanvasByCtx(canvasMouseRef.current.getContext("2d"));

    if (isDrawingFreehand(mode)) {
      drawLine.actionMouseLeave(mode);
    }
  };

  /**
   * Function to follow the cursor on the canvas
   * @param {number} opacity
   */
  const followCursor = (opacity = null) => {
    const context = setContext(canvasTemporyRef.current, opacity);
    const ctxMouse = canvasMouseRef.current.getContext("2d");
    if (!ctxMouse || !context) return;

    // clear the mouse canvas
    clearCanvasByCtx(ctxMouse);

    let cursorType = "default";

    // console.log("follow cursor: ", coordinate);

    if (isDrawingAllLines(drawingParams.current.mode)) {
      console.log("error follow cursor general for lines ");
    } else if (
      isDrawingShape(drawingParams.current.mode) ||
      drawingParams.current.mode === DRAWING_MODES.TEXT
    ) {
      let coordinate = element.coordinates;
      let mouseOnShape = null;
      if (element.fixed) {
        mouseOnShape = handleMouseOnElement(
          drawingParams.current.mode,
          coordinate,
          squareRef.current
        );

        if (mouseOnShape) {
          cursorType = mousePointer(mouseOnShape);

          if (isInside(mouseOnShape)) {
            // show real color when mouse is inside the square
            context.globalAlpha = drawingParams.current.general.opacity;
          }
        }
      } else {
        cursorType = "pointer";
      }
      clearCanvasByCtx(context);
      moveElement(context, coordinate, mouseOnShape);
    }
    canvasMouseRef.current.style.cursor = cursorType;
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

      if (isDrawingAllLines(mode)) {
        // setContext(canvasTemporyRef.current, TEMPORTY_OPACITY);
        drawLine.actionMouseMove(mode, event);
      } else {
        element.coordinates = getCoordinates(event, canvasRef.current);
        if (element.isResizing && isDrawingShape(mode)) {
          resizingSquare(canvasTemporyRef.current);
        } else {
          followCursor(0.4);
        }
      }
      if (mode === DRAWING_MODES.SELECT) {
        memorizeSelectedZone();
      }
    };
    const hanldeKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          clearTemporyCanvas();
          drawLine.eraseLastCoordinates();
          break;

        case "Enter":
          validDrawedElement();
          alertMessage("Valid the drawing element");
          break;

        case "z":
        case "Z": // Ctrl Z
          if (event.ctrlKey) {
            // undo
            clearTemporyCanvas();
            previousPicture(canvasRef.current);
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
