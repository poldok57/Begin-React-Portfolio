import { useEffect, useRef } from "react";
import { useHistory } from "./DrawHistory";
import { BORDER, mousePointer, isInside } from "../../lib/mouse-position";
import {
  basicLine,
  drawPoint,
  hatchedCircle,
  CanvasLine,
} from "../../lib/canvas/canvas-line";
import {
  clearContext,
  showElement,
  resizingElement,
  hightLightMouseCursor,
} from "../../lib/canvas/canvas-elements";
import {
  isOnSquareBorder,
  // resizeSquare,
  getSquareOffset,
} from "../../lib/square-position";

import {
  DRAWING_MODES,
  isDrawingFreehand,
  isDrawingMode,
  isDrawingShape,
  isDrowingLine,
} from "../../lib/canvas/canvas-defines";

import { alertMessage } from "../../hooks/alertMessage";
import { imageSize } from "../../lib/canvas/canvas-size";
// Draw on Canvas
export const DrawCanvas = ({ canvas: canvasRef, getParams }) => {
  let element = {
    fixed: false,
    isResizing: null,
  };

  const line = new CanvasLine(canvasRef.current);
  const drawLine = new CanvasLine(canvasRef.current);

  const drawingParams = useRef(null);
  const canvasMouseRef = useRef(null);
  const canvasTemporyRef = useRef(null);
  const mouseOnCtrlPanel = useRef(false);

  const [WIDTH, HEIGHT] = [560, 315]; // 16:9 aspact ratio
  const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

  const mouseCircle = {
    type: "circle",
    color: "rgba(255, 255, 0,0.8)",
    width: 80,
    filled: true,
  };
  const squareRef = useRef(null);
  const offsetRef = useRef({ x: -SQUARE_WIDTH / 2, y: -SQUARE_HEIGHT / 2 });

  const { undoHistory, addHistoryItem, getCurrentHistory } = useHistory();

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
    const ctx = canvas.getContext("2d");

    const item = {
      image: ctx.getImageData(0, 0, canvas.width, canvas.height),
      startCoordinate: line.getStartCoordinates(),
    };

    addHistoryItem(item);
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

    if (item === null || item.image === null || item.image === undefined) {
      clearContext(ctx);
      line.eraseStartCoordinates();

      return;
    }
    ctx.putImageData(item.image, 0, 0);
    line.setStartCoordinates(item.startCoordinate);
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
    if (isDrawingShape(drawingParams.current.mode)) {
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
    } else if (drawingParams.current.mode === DRAWING_MODES.TEXT) {
      squareRef.current.text = { ...drawingParams.current.text };
      refreshElement();
    }
  };

  /**
   * Function to change the drawing mode
   * @param {string} newMode - new drawing mode
   */
  const actionChangeMode = (newMode) => {
    if (drawingParams.current === null) {
      drawingParams.current = getParams();
      setContext(canvasTemporyRef.current);
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
      line.eraseStartCoordinates();

      refreshElement();
    } else if (isDrawingFreehand(newMode)) {
      line.eraseStartCoordinates();
    }
    const context = canvasRef.current.getContext("2d");

    context.globalCompositeOperation =
      newMode === DRAWING_MODES.ERASE ? "destination-out" : "source-over";
  };

  const handleSpecialEvent = (eventMode) => {
    switch (eventMode) {
      case DRAWING_MODES.CONTROL_PANEL.IN:
        mouseOnCtrlPanel.current = true;
        line.isDrawing(false);
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
    clearContext(context);
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
    // we can validate draw line if the mouse is outside the canvas
    if (!canvasMouseRef.current.contains(event.target)) {
      if (
        !isDrowingLine(drawingParams.current.mode) ||
        mouseOnCtrlPanel.current || // Mouse on Control Panel, action refused
        line.getStartCoordinates() == null // dont start drawing if the mouse is outside the canvas
      ) {
        return;
      }
    }

    // color and width painting
    drawingParams.current = getParams();
    const canvasElement = canvasRef.current;

    const context = setContext(canvasElement);
    line.setCoordinates(event);

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
      case DRAWING_MODES.ERASE:
        line.setDrawing(true);
        break;

      case DRAWING_MODES.LINE:
        if (line.drawLine()) {
          savePicture(canvasElement);
        }
        break;
      case DRAWING_MODES.ARC:
        if (line.drawArc(context, true)) {
          line.showArc(context, false);
          line.setStartFromEnd();
          savePicture(canvasElement);
        }
        break;

      default:
        if (
          !isDrawingShape(drawingParams.current.mode) &&
          drawingParams.current.mode !== DRAWING_MODES.TEXT
        ) {
          return;
        }
        if (element.fixed) {
          const mouseOnShape = handleMouseOnElement(
            drawingParams.current.mode,
            line.getCoordinates(),
            squareRef.current
          );
          if (mouseOnShape) {
            // Clic on the shape --------
            if (mouseOnShape === BORDER.INSIDE) {
              offsetRef.current = getSquareOffset(
                line.getCoordinates(),
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
        break;
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

    clearContext(context);

    const newCoord = resizingElement(
      context,
      squareRef.current,
      line.getCoordinates(),
      element.isResizing
    );

    if (newCoord) {
      squareRef.current = { ...squareRef.current, ...newCoord };
    }
  };
  /**
   * Function to stop drawing on the canvas
   */
  const onMouseUp = (mode) => {
    line.eraseCoordinate();

    if (isDrawingFreehand(mode)) {
      if (line.isDrawing()) {
        line.setDrawing(false);
        line.eraseStartCoordinates();
        savePicture(canvasRef.current);
      }
      return;
    }
    if (isDrawingShape(mode) || mode === DRAWING_MODES.TEXT) {
      element.fixed = true;
      element.isResizing = null;
    }
    return;
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
      oldY = square.y;
    if (!element.fixed) {
      square.x = coord.x + offsetRef.current.x;
      square.y = coord.y + offsetRef.current.y;
    }
    // if element didn't move don't show the buttons
    const withBtn = oldX === square.x && oldY === square.y;
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
    clearContext(context);
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

    clearContext(context);
    clearContext(canvasMouseRef.current.getContext("2d"));

    if (isDrawingFreehand(mode)) {
      line.setDrawing(false);
      line.eraseStartCoordinates();
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
    clearContext(ctxMouse);

    let cursorType = "default";
    let coordinate = line.getCoordinates();

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.ARC:
        hightLightMouseCursor(ctxMouse, coordinate, mouseCircle);
        clearContext(context);
        line.showArc(context, true);
        cursorType = "crosshair";
        break;
      case DRAWING_MODES.LINE:
        hightLightMouseCursor(ctxMouse, coordinate, mouseCircle);
        cursorType = "crosshair";
        if (line.getStartCoordinates() == null) {
          drawPoint(
            ctxMouse,
            coordinate,
            drawingParams.current.general.color,
            null,
            drawingParams.current.general.lineWidth
          );
          break;
        }
        clearContext(context);
        basicLine(context, line.getStartCoordinates(), coordinate);
        break;
      case DRAWING_MODES.DRAW:
        ctxMouse.globalAlpha = 0.4;
        hightLightMouseCursor(ctxMouse, coordinate, mouseCircle);
        drawPoint(
          ctxMouse,
          coordinate,
          drawingParams.current.general.color,
          null,
          drawingParams.current.general.lineWidth
        );
        break;
      case DRAWING_MODES.ERASE:
        ctxMouse.globalAlpha = 0.9;
        hightLightMouseCursor(ctxMouse, coordinate, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        hatchedCircle(
          ctxMouse,
          coordinate,
          "#eee",
          "#303030",
          drawingParams.current.general.lineWidth
        );
        cursorType = "none";
        break;
      default:
        if (
          isDrawingShape(drawingParams.current.mode) ||
          drawingParams.current.mode === DRAWING_MODES.TEXT
        ) {
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
          clearContext(context);
          moveElement(context, coordinate, mouseOnShape);
        }
        break;
    }
    canvasMouseRef.current.style.cursor = cursorType;
  };

  useEffect(() => {
    const handleMouseUp = () => {
      onMouseUp(drawingParams.current.mode);
    };
    const handleMouseDown = (event) => {
      actionMouseDown(event);
    };
    const handleMouseMove = (event) => {
      if (
        !drawingParams.current ||
        drawingParams.current.mode === DRAWING_MODES.INIT
      ) {
        // Initialize canvas
        drawingParams.current = getParams();
        drawingParams.current.mode = DRAWING_MODES.DRAW;
        initShape();
        savePicture(canvasRef.current);
        line.setCanvas(canvasRef.current);
      }
      const mode = drawingParams.current.mode;

      line.setCoordinates(event);
      if (line.isDrawing()) {
        line.drawLine();
        followCursor(0.4);
      } else if (element.isResizing && isDrawingShape(mode)) {
        resizingSquare(canvasTemporyRef.current);
      } else if (mouseOnCtrlPanel.current) {
        return;
      } else {
        followCursor(0.4);
      }
      if (mode === DRAWING_MODES.SELECT) {
        memorizeSelectedZone();
      }
    };
    const hanldeKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          clearTemporyCanvas();
          line.eraseLastCoordinates();
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
      if (newMode === DRAWING_MODES.DRAWING_CHANGE) {
        drawingParamChanged();
      } else if (isDrawingMode(newMode)) {
        clearTemporyCanvas();
        actionChangeMode(newMode);
      } else if (newMode === DRAWING_MODES.UNDO) {
        previousPicture(canvasRef.current);
      } else {
        handleSpecialEvent(newMode);
      }
    };

    const canvasMouse = canvasMouseRef.current;

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    canvasMouse.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("keydown", hanldeKeyDown);
    document.addEventListener("modeChanged", handleChangeMode);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      canvasMouse.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("keydown", hanldeKeyDown);
      document.removeEventListener("modeChanged", handleChangeMode);
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
