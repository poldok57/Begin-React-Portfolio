import { useEffect, useRef } from "react";
import { useMessage } from "../../context/MessageProvider";
import { useHistory } from "./DrawHistory";
import { BORDER, mousePointer, isInside } from "../../lib/mouse-position";
import { basicLine, CanvasLine } from "../../lib/canvas-line";
import {
  drawSquare,
  drawEllipse,
  drawText,
  drawBorder,
  drawButtons,
  hightLightMouseCursor,
} from "../../lib/canvas-elements";
import {
  isOnSquareBorder,
  resizeSquare,
  getSquareOffset,
} from "../../lib/square-position";

import { DRAWING_MODES, ALL_DRAWING_MODES } from "./Draw";

// Draw on Canvas
export const DrawCanvas = ({ canvas: canvasRef, getParams }) => {
  let element = {
    fixed: false,
    isResizing: null,
  };

  const line = new CanvasLine(canvasRef.current);

  const drawingParams = useRef(null);
  const canvasOverRef = useRef(null);

  const [WIDTH, HEIGHT] = [560, 315]; // 16:9 aspact ratio
  const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 100];

  const mouseCircle = {
    type: "circle",
    color: "rgba(255, 255, 0,0.8)",
    width: 80,
    height: 80,
    filled: true,
  };
  const squareRef = useRef(null);
  const offsetRef = useRef({ x: -SQUARE_WIDTH / 2, y: -SQUARE_HEIGHT / 2 });

  const lineCap = useRef("round");
  const { undoHistory, addHistoryItem, getCurrentHistory, getHistoryLength } =
    useHistory();
  const { alertMessage } = useMessage();

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
  function savePics() {
    // Save the current state of the canvas
    const canvas = canvasRef.current;
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
  const previousPicture = () => {
    if (canvasRef.current === null) {
      return;
    }
    undoHistory();
    const item = getCurrentHistory();

    if (item === null || item.image === null || item.image === undefined) {
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      return;
    }
    canvasRef.current.getContext("2d").putImageData(item.image, 0, 0);
    line.setStartCoordinates(item.startCoordinate);
  };

  /**
   * Function to get the current parameters for drawing
   * call then user change something in the drawing panel
   */
  const drawingParamChanged = () => {
    drawingParams.current = getParams();
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
        break;
      case DRAWING_MODES.TEXT:
        squareRef.current.text = { ...drawingParams.current.text };
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

    // console.log("Set Context...");

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
    });
  };

  /**
   * Function to start drawing on the canvas
   * @param {Event} event
   */
  const startDrawing = (event) => {
    // color and width painting
    drawingParams.current = getParams();

    const canvasElement = canvasRef.current;
    alertMessage("Start Drawing & set Context..");
    setContext(canvasElement);
    line.setCoordinates(event);

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
        line.setDrawing(true);
        line.eraseStartCoordinates();
        break;

      case DRAWING_MODES.LINE:
        if (line.drawLine(event)) {
          savePics();
        }
        break;

      case DRAWING_MODES.TEXT:
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
        squareRef.current.shape = { ...drawingParams.current.shape };
        if (element.fixed) {
          // isInsideSquare(getCoordinates(), squareRef.current, true);
          const border = handleMouseOnElement(
            drawingParams.current.mode,
            line.getCoordinates(),
            squareRef.current
          );
          if (border) {
            if (border === BORDER.INSIDE) {
              offsetRef.current = getSquareOffset(
                line.getCoordinates(),
                squareRef.current
              );
              canvasOverRef.current.style.cursor = "pointer";
              element.fixed = false;
            } else if (border === BORDER.ON_BUTTON) {
              canvasOverRef.current.style.cursor = "pointer";
              validDrawedElement();
              // init for next shape
              initShape(drawingParams.current.mode);
              drawingParams.current.mode = DRAWING_MODES.DRAW;
            } else if (border === BORDER.ON_BUTTON_LEFT) {
              squareRef.current.rotation -= Math.PI / 16;
              followCursor(event);
            } else if (border === BORDER.ON_BUTTON_RIGHT) {
              squareRef.current.rotation += Math.PI / 16;
              followCursor(event);
            } else {
              element.isResizing = border;
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
  const resizingSquare = (event, canvas) => {
    const context = setContext(canvas);
    if (!context) return;

    const coordinate = line.setCoordinates(event);
    const border = element.isResizing;
    if (border) {
      const { coord, newSquare } = resizeSquare(
        coordinate,
        squareRef.current,
        border
      );
      // element.fixed = true;
      squareRef.current = { ...squareRef.current, ...newSquare };

      context.clearRect(0, 0, canvas.width, canvas.height);
      showElement(context, coord);
    }
  };
  /**
   * Function to stop drawing on the canvas
   */
  const stopDrawing = () => {
    line.setDrawing(false);
    line.eraseCoordinate();

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
        savePics();
        alertMessage("STOP Drawing...");
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
  const draw = (event) => {
    if (line.isDrawing()) {
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      basicLine(context, line.getCoordinates(), line.setCoordinates(event));
    }
  };

  /**
   * Function to show a element (square, ellipse or text) on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array} coord [x, y]
   * @param {boolean} withBtn - show button to resize the square
   * @param {string} border - border where the mouse is
   */
  const showElement = (ctx, coord, withBtn = true, border = null) => {
    const square = squareRef.current;
    if (!element.fixed) {
      square.x = coord.x + offsetRef.current.x;
      square.y = coord.y + offsetRef.current.y;
    }

    switch (square.type) {
      case DRAWING_MODES.SQUARE:
        drawSquare(ctx, square);
        break;
      case DRAWING_MODES.CIRCLE:
        drawEllipse(ctx, square);

        break;
      case DRAWING_MODES.TEXT:
        if (!square.text || !square.text.text) return;
        drawText(ctx, square);
      // writeText(ctx, coord, withBtn, border);
    }

    if (square.type !== DRAWING_MODES.TEXT) {
      if (drawingParams.current.shape.withBorder) {
        drawBorder(ctx, square);
      }
      if (drawingParams.current.shape.withText) {
        // text inside the square
        squareRef.current.shape.withText = true;
        // writeText(ctx, coord, false);
        drawText(ctx, square);
      }
    }
    if (withBtn) {
      drawButtons(ctx, square, border);
    }
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

    showElement(context, null, false);
  };

  /**
   * erase canavasOver (temporary canvas) when mouse leave the canvas
   */
  const eraseCanvasOver = () => {
    const context = canvasOverRef.current.getContext("2d");
    if (!context || !drawingParams.current) {
      return;
    }
    // dont erase the fixed element (square, circle or text)
    if (
      (drawingParams.current.mode === DRAWING_MODES.SQUARE ||
        drawingParams.current.mode === DRAWING_MODES.CIRCLE ||
        drawingParams.current.mode === DRAWING_MODES.TEXT) &&
      element.fixed
    ) {
      return;
    }
    context.clearRect(
      0,
      0,
      canvasOverRef.current.width,
      canvasOverRef.current.height
    );
    return;
  };

  /**
   * Function to follow the cursor on the canvas
   * @param {Event} event
   * @param {number} opacity
   */
  const followCursor = (event, opacity = null) => {
    const canvasOver = canvasOverRef.current;
    const context = setContext(canvasOver, opacity);
    if (!context) return;

    // clear the temporary canvas
    context.clearRect(0, 0, canvasOver.width, canvasOver.height);

    let cursorType = "default";
    let coordinate = line.setCoordinates(event);

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
      case DRAWING_MODES.TEXT:
        {
          let border = null;
          if (element.fixed) {
            border = handleMouseOnElement(
              drawingParams.current.mode,
              line.getCoordinates(),
              squareRef.current
            );

            if (border) {
              cursorType = mousePointer(border);

              if (isInside(border)) {
                // show real color when mouse is inside the square
                context.globalAlpha = drawingParams.current.general.opacity;
              }
            }
          } else {
            cursorType = "pointer";
          }

          showElement(context, coordinate, true, border);
        }
        break;

      case DRAWING_MODES.LINE:
        hightLightMouseCursor(context, coordinate, mouseCircle);
        if (line.getStartCoordinates() == null) {
          basicLine(context, coordinate, coordinate);
          return;
        }
        basicLine(context, line.getStartCoordinates(), coordinate);
        break;
      case DRAWING_MODES.DRAW:
        basicLine(context, coordinate, coordinate);
        hightLightMouseCursor(context, coordinate, mouseCircle);
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
      startDrawing(event);
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
        savePics();
        line.setCanvas(canvasRef.current);
        // console.log("Init Drawing...");
      }

      if (line.isDrawing()) {
        draw(event);
        followCursor(event, 0.4);
      } else if (
        element.isResizing &&
        (drawingParams.current.mode === DRAWING_MODES.SQUARE ||
          drawingParams.current.mode === DRAWING_MODES.CIRCLE)
      ) {
        resizingSquare(event, canvasElement);
      } else {
        followCursor(event, 0.4);
      }
    };
    const hanldeKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          line.eraseStartCoordinates();
          break;

        case "z":
        case "Z": // Ctrl Z
          if (event.ctrlKey) {
            // undo
            previousPicture();
          }
      }
    };

    const handleModeChange = (event) => {
      const newMode = event.detail.mode;
      if (newMode === DRAWING_MODES.DRAWING_CHANGE) {
        drawingParamChanged();
        followCursor(event);
      } else if (ALL_DRAWING_MODES.includes(newMode)) {
        if (drawingParams.current === null) {
          drawingParams.current = getParams();
        }
        drawingParams.current.mode = newMode;
        if (
          newMode === DRAWING_MODES.SQUARE ||
          newMode === DRAWING_MODES.CIRCLE ||
          newMode === DRAWING_MODES.TEXT
        ) {
          if (squareRef.current === null) {
            initShape(newMode);
          } else {
            squareRef.current.type = newMode;
          }
          //  initShape(newMode);
          followCursor(event);
        }
        alertMessage(`Mode changed to ${newMode}`);
      } else if (newMode === DRAWING_MODES.UNDO) {
        previousPicture();
      }
    };

    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("mouseleave", eraseCanvasOver);
    window.addEventListener("keydown", hanldeKeyDown);
    document.addEventListener("modeChanged", handleModeChange);

    return () => {
      canvasElement.removeEventListener("mousedown", handleMouseDown);
      canvasElement.removeEventListener("mousemove", handleMouseMove);
      canvasElement.removeEventListener("mouseup", handleMouseUp);
      canvasElement.removeEventListener("mouseleave", eraseCanvasOver);
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
