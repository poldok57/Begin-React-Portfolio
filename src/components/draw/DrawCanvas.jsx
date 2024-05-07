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
  drawText,
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
  isDrawingMode,
  isDrawingShape,
} from "../../lib/canvas/canvas-defines";

import { alertMessage } from "../../hooks/alertMessage";
// Draw on Canvas
export const DrawCanvas = ({ canvas: canvasRef, getParams }) => {
  let element = {
    fixed: false,
    isResizing: null,
  };

  const line = new CanvasLine(canvasRef.current);

  const drawingParams = useRef(null);
  const canvasOverRef = useRef(null);
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

  const lineCap = useRef("round");
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

    if (item === null || item.image === null || item.image === undefined) {
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, canvas.width, canvas.height);
      line.eraseStartCoordinates();

      return;
    }
    canvas.getContext("2d").putImageData(item.image, 0, 0);
    line.setStartCoordinates(item.startCoordinate);
  };

  /**
   * Function to get the current parameters for drawing
   * call then user change something in the drawing panel
   */
  const drawingParamChanged = () => {
    drawingParams.current = getParams();
    const ctx = setContext(canvasOverRef.current);
    switch (drawingParams.current.mode) {
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
        squareRef.current.general = { ...drawingParams.current.general };
        squareRef.current.shape = { ...drawingParams.current.shape };

        if (drawingParams.current.shape.withBorder) {
          squareRef.current.border = { ...drawingParams.current.border };
        }

        if (drawingParams.current.shape.withText) {
          squareRef.current.text = { ...drawingParams.current.text };
        }
        // clear the temporary canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        showElement(ctx, squareRef.current, false);
        break;
      case DRAWING_MODES.TEXT:
        squareRef.current.text = { ...drawingParams.current.text };
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawText(ctx, squareRef.current);
    }
  };

  /**
   * Function to change the drawing mode
   * @param {string} newMode - new drawing mode
   */
  const actionModeChange = (newMode) => {
    if (drawingParams.current === null) {
      drawingParams.current = getParams();
      setContext(canvasOverRef.current);
    }

    // drawingParams.current.mode = newMode;
    switch (newMode) {
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
      case DRAWING_MODES.TEXT:
        if (squareRef.current === null) {
          initShape(newMode);
        } else {
          squareRef.current.type = newMode;
        }
        line.eraseStartCoordinates();
        followCursor();
        break;
      case DRAWING_MODES.DRAW:
      case DRAWING_MODES.ERASE:
        line.eraseStartCoordinates();
        break;
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
    if (lineCap.current) {
      ctx.lineCap = lineCap.current;
    }
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity ?? drawingParams.current.general.opacity;
    return ctx;
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
    const canvas = canvasOverRef.current;
    canvas.contains(event.target);
    // we can validate the drawing if the mouse is outside the canvas
    if (!canvas.contains(event.target)) {
      if (mouseOnCtrlPanel.current) {
        // alertMessage("Mouse on Control Panel, action refused ");
        return;
      }
      switch (drawingParams.current.mode) {
        case DRAWING_MODES.LINE:
        case DRAWING_MODES.ARC:
          // if the first point is outside the canvas, we can't draw the line
          if (line.getStartCoordinates() == null) {
            return;
          }
          break;
        default:
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

      case DRAWING_MODES.TEXT:
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
        // squareRef.current.shape = { ...drawingParams.current.shape };
        if (element.fixed) {
          // isInsideSquare(getCoordinates(), squareRef.current, true);
          const mouseOnShape = handleMouseOnElement(
            drawingParams.current.mode,
            line.getCoordinates(),
            squareRef.current
          );
          if (mouseOnShape) {
            if (mouseOnShape === BORDER.INSIDE) {
              offsetRef.current = getSquareOffset(
                line.getCoordinates(),
                squareRef.current
              );
              canvasOverRef.current.style.cursor = "pointer";
              element.fixed = false;
            } else if (mouseOnShape === BORDER.ON_BUTTON) {
              canvasOverRef.current.style.cursor = "pointer";
              validDrawedElement();
              // init for next shape
              initShape(drawingParams.current.mode);
              drawingParams.current.mode = DRAWING_MODES.DRAW;
            } else if (mouseOnShape === BORDER.ON_BUTTON_LEFT) {
              squareRef.current.rotation -= Math.PI / 16;
              followCursor();
            } else if (mouseOnShape === BORDER.ON_BUTTON_RIGHT) {
              squareRef.current.rotation += Math.PI / 16;
              followCursor();
            } else {
              element.isResizing = mouseOnShape;
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
    context.clearRect(0, 0, canvas.width, canvas.height);

    const newCoord = resizingElement(
      context,
      squareRef.current,
      line.getCoordinates(),
      element.isResizing
    );

    if (newCoord) squareRef.current = { ...squareRef.current, ...newCoord };
  };
  /**
   * Function to stop drawing on the canvas
   */
  const stopDrawing = () => {
    line.setDrawing(false);
    line.eraseCoordinate();

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
      case DRAWING_MODES.ERASE:
        line.eraseStartCoordinates();
        savePicture(canvasRef.current);
        break;
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
      case DRAWING_MODES.TEXT:
        element.fixed = true;
        element.isResizing = null;
        break;
    }
  };

  /**
   * Function to freehand draw on the canvas
   * @param {Event} event
   */
  const draw = () => {
    if (line.isDrawing()) {
      line.drawLine();
    }
  };

  /**
   * Function to show a element (square, ellipse or text) on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} withBtn - show button to resize the square
   * @param {string} mouseOnShape - border where the mouse is
   */
  // const showElement = (ctx, square, withBtn = true, mouseOnShape = null) => {
  //   switch (square.type) {
  //     case DRAWING_MODES.SQUARE:
  //       drawSquare(ctx, square);
  //       break;
  //     case DRAWING_MODES.CIRCLE:
  //       drawEllipse(ctx, square);

  //       break;
  //     case DRAWING_MODES.TEXT:
  //       if (!square.text || !square.text.text) return;
  //       drawText(ctx, square);
  //     // writeText(ctx, coord, withBtn, mouseOnShape);
  //   }

  //   if (square.type !== DRAWING_MODES.TEXT) {
  //     if (drawingParams.current.shape.withBorder) {
  //       if (!withBtn) {
  //         ctx.globalAlpha = square.border.opacity;
  //       }
  //       drawBorder(ctx, square);
  //     }
  //     if (drawingParams.current.shape.withText) {
  //       // text inside the square
  //       square.shape.withText = true;
  //       // writeText(ctx, coord, false);
  //       drawText(ctx, square);
  //     }
  //   }
  //   if (withBtn) {
  //     drawButtons(ctx, square, mouseOnShape);
  //   }
  // };

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
   * Function to draw an element on the MAIN canvas
   */
  const validDrawedElement = () => {
    const canvas = canvasRef.current;
    const context = setContext(canvas);
    if (!context) {
      return;
    }

    showElement(context, squareRef.current, false);
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const onMouseLeave = () => {
    const context = canvasOverRef.current.getContext("2d");
    if (!context || !drawingParams.current) {
      return;
    }
    const mode = drawingParams.current.mode;
    // dont erase the fixed element (square, circle or text)
    if (mode === DRAWING_MODES.ARC || (isDrawingShape(mode) && element.fixed)) {
      return;
    }
    context.clearRect(
      0,
      0,
      canvasOverRef.current.width,
      canvasOverRef.current.height
    );
    if (mode === DRAWING_MODES.DRAW) {
      line.setDrawing(false);
      line.eraseStartCoordinates();
    }
  };

  /**
   * Function to follow the cursor on the canvas
   * @param {number} opacity
   */
  const followCursor = (opacity = null) => {
    const canvasOver = canvasOverRef.current;
    const context = setContext(canvasOver, opacity);
    // const context = canvasOver.getContext("2d");
    context.globalAlpha = opacity ?? drawingParams.current.general.opacity;

    if (!context) return;

    // clear the temporary canvas
    context.clearRect(0, 0, canvasOver.width, canvasOver.height);

    let cursorType = "default";
    let coordinate = line.getCoordinates();

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
      case DRAWING_MODES.TEXT:
        {
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

          moveElement(context, coordinate, mouseOnShape);
        }
        break;
      case DRAWING_MODES.ARC:
        hightLightMouseCursor(context, coordinate, mouseCircle);
        line.showArc(context, true);
        cursorType = "crosshair";
        break;
      case DRAWING_MODES.LINE:
        hightLightMouseCursor(context, coordinate, mouseCircle);
        cursorType = "crosshair";
        if (line.getStartCoordinates() == null) {
          drawPoint(context, coordinate);
          break;
        }
        basicLine(context, line.getStartCoordinates(), coordinate);
        break;
      case DRAWING_MODES.DRAW:
        hightLightMouseCursor(context, coordinate, mouseCircle);
        drawPoint(context, coordinate);
        break;
      case DRAWING_MODES.ERASE:
        hightLightMouseCursor(context, coordinate, {
          ...mouseCircle,
          color: "pink",
          width: 50,
        });
        context.globalAlpha = 0.9;
        hatchedCircle(context, coordinate, "#eee", "#303030");
        cursorType = "none";
        break;
    }
    canvasOverRef.current.style.cursor = cursorType;
  };

  useEffect(() => {
    const canvasElement = canvasOverRef.current;

    const handleMouseUp = () => {
      stopDrawing();
    };
    const handleMouseDown = (event) => {
      actionMouseDown(event);
    };
    const handleMouseMove = (event) => {
      // Initialize canvas
      if (
        !drawingParams.current ||
        drawingParams.current.mode === DRAWING_MODES.INIT
      ) {
        drawingParams.current = getParams();
        drawingParams.current.mode = DRAWING_MODES.DRAW;
        initShape(drawingParams.current.mode);
        savePicture(canvasRef.current);
        line.setCanvas(canvasRef.current);
        console.log("Init Drawing...");
      }

      line.setCoordinates(event);
      if (line.isDrawing()) {
        draw();
        followCursor(0.4);
      } else if (
        element.isResizing &&
        (drawingParams.current.mode === DRAWING_MODES.SQUARE ||
          drawingParams.current.mode === DRAWING_MODES.CIRCLE)
      ) {
        resizingSquare(canvasElement);
      } else if (mouseOnCtrlPanel.current) {
        return;
      } else {
        followCursor(0.4);
      }
    };
    const hanldeKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          line.eraseLastCoordinates();
          break;

        case "z":
        case "Z": // Ctrl Z
          if (event.ctrlKey) {
            // undo
            previousPicture(canvasRef.current);
          }
      }
    };

    const handleModeChange = (event) => {
      const newMode = event.detail.mode;
      if (newMode === DRAWING_MODES.DRAWING_CHANGE) {
        drawingParamChanged();
      } else if (isDrawingMode(newMode)) {
        actionModeChange(newMode);
      } else if (newMode === DRAWING_MODES.UNDO) {
        previousPicture(canvasRef.current);
      } else {
        handleSpecialEvent(newMode);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("keydown", hanldeKeyDown);
    document.addEventListener("modeChanged", handleModeChange);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      canvasElement.removeEventListener("mouseup", handleMouseUp);
      canvasElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("keydown", hanldeKeyDown);
      document.removeEventListener("modeChanged", handleModeChange);
    };
  }, [canvasRef, canvasOverRef]);

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
          zIndex: 1,
        }}
        className="m-auto border-spacing-3 rounded-md bg-white shadow-md"
      />
      <canvas
        left={0}
        top={0}
        width={WIDTH}
        height={HEIGHT}
        ref={canvasOverRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 2,
        }}
        className="transparent m-auto"
      />
    </div>
  );
};
