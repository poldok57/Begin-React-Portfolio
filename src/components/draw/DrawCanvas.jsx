import { useEffect, useRef } from "react";
import { useMessage } from "../../context/MessageProvider";
import {
  BORDER,
  mousePointer,
  isBorder,
  isInside,
} from "../../lib/mouse-position";
import {
  basicLine,
  drawSquare,
  drawEllipse,
  drawText,
  drawBorder,
  drawButtons,
} from "../../lib/canvas-elements";
import {
  isOnSquareBorder,
  resizeSquare,
  getSquareOffset,
} from "../../lib/square-position";

import { DRAWING_MODES, ALL_DRAWING_MODES } from "./Draw";

const MAX_UNDO = 20;

// Draw on Canvas
export const DrawCanvas = ({
  canvas: canvasRef,
  history: historyRef,
  startCoordinate: startCoordinateRef,
  getParams,
}) => {
  let fixed = false;
  let lastCoordinate = null;
  const isDrawing = useRef(false);
  const isResizing = useRef(null);

  const drawingParams = useRef(null);
  const canvasOverRef = useRef(null);
  const cursorRef = useRef("default");

  const [WIDTH, HEIGHT] = [560, 315]; // 16:9 aspact ratio
  const [SQUARE_WIDTH, SQUARE_HEIGHT] = [100, 80];

  const mouseCircle = useRef({
    color: "rgba(255, 255, 0, 0.5)",
    size: 40,
    show: true,
  });
  const squareRef = useRef(null);
  const offsetRef = useRef({ x: -SQUARE_WIDTH / 2, y: -SQUARE_HEIGHT / 2 });

  const lineCap = useRef("round");

  const { alertMessage } = useMessage();

  const initShape = (type = DRAWING_MODES.SQUARE) => {
    squareRef.current = {
      type: type,
      x: WIDTH / 2,
      y: HEIGHT / 2,
      width: SQUARE_WIDTH,
      height: type == DRAWING_MODES.CIRCLE ? SQUARE_WIDTH : SQUARE_HEIGHT,
      color: drawingParams.current.color,
      lineWidth: drawingParams.current.lineWidth,
      opacity: 1,
      rotation: 0,
      shape: { ...drawingParams.current.shape },
      border: { ...drawingParams.current.border },
      text: { ...drawingParams.current.text },
    };
    fixed = false;
  };

  /**
   * Function to save the current state of the canvas
   */
  function savePics() {
    // Save the current state of the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (historyRef.current === null) {
      historyRef.current = [];
    }
    const history = historyRef.current;
    history.push({
      image: ctx.getImageData(0, 0, canvas.width, canvas.height),
      startCoordinate: startCoordinateRef.current,
    });

    // Limit the number of saved states
    if (history.length > MAX_UNDO) {
      history.shift();
    }
  }

  /**
   * Function to set the coordinates of the cursor on the canvas
   * @param {Event} event
   * @param {HTMLCanvasElement} canvas
   */
  const setCoordinates = (event, canvas) => {
    if (!event || !canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left,
      y = event.clientY - rect.top;

    return (lastCoordinate = { x, y });
  };

  const setStartCoordinates = (coordinate) => {
    startCoordinateRef.current = coordinate;
  };
  const eraseStartCoordinates = () => {
    startCoordinateRef.current = null;
  };
  const getStartCoordinates = () => {
    return startCoordinateRef.current;
  };
  const getCoordinates = () => {
    return lastCoordinate;
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
      ctx.strokeStyle = drawingParams.current.color;
      ctx.lineWidth = drawingParams.current.lineWidth;
    }
    if (lineCap.current) {
      ctx.lineCap = lineCap.current;
    }
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity ?? drawingParams.current.opacity;
    return ctx;
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
    setCoordinates(event, canvasElement);

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
        isDrawing.current = true;
        eraseStartCoordinates();
        break;

      case DRAWING_MODES.LINE:
        drawLine(event, canvasElement);
        break;

      case DRAWING_MODES.TEXT:
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
        squareRef.current.shape = { ...drawingParams.current.shape };
        if (fixed) {
          // isInsideSquare(getCoordinates(), squareRef.current, true);
          const border = isOnSquareBorder(
            getCoordinates(),
            squareRef.current,
            true
          );
          if (border) {
            if (
              border === BORDER.INSIDE ||
              (drawingParams.current.mode === DRAWING_MODES.TEXT &&
                isBorder(border))
            ) {
              offsetRef.current = getSquareOffset(
                getCoordinates(),
                squareRef.current
              );
              canvasOverRef.current.style.cursor = "pointer";
              fixed = false;
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
              isResizing.current = border;
            }
          }
        }
        break;
    }

    alertMessage(
      `Start ${drawingParams.current.mode} : + color:${drawingParams.current.color}`
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

    const coordinate = setCoordinates(event, canvas);
    const border = isResizing.current;
    if (border) {
      const { coord, newSquare } = resizeSquare(
        coordinate,
        squareRef.current,
        border
      );
      // fixed = true;
      squareRef.current = { ...squareRef.current, ...newSquare };

      context.clearRect(0, 0, canvas.width, canvas.height);
      showElement(context, coord);
    }
  };
  /**
   * Function to stop drawing on the canvas
   */
  const stopDrawing = () => {
    isDrawing.current = false;
    lastCoordinate = null;

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
        savePics();
        alertMessage("STOP Drawing...");
        break;
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
      case DRAWING_MODES.TEXT:
        fixed = true;
        isResizing.current = null;
        break;
    }
  };

  /**
   * Function to freehand draw on the canvas
   * @param {Event} event
   */
  const draw = (event) => {
    if (isDrawing.current) {
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      basicLine(
        context,
        getCoordinates(),
        setCoordinates(event, canvasRef.current)
      );

      // const co = getCoordinates();
      // debounceLogs(`Drawing.. ${co.x}x${co.y}`);
    }
  };

  /**
   * Function to draw a line on the canvas
   * @param {Event} event
   * @param {HTMLCanvasElement} canvas
   */
  const drawLine = (event, canvas) => {
    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    let start = getStartCoordinates();
    const end = setCoordinates(event, canvas);
    setStartCoordinates(end);
    if (start == null) {
      // if start is null, set start coordinates
      start = end;
    } else {
      basicLine(context, start, end);
      savePics();
    }

    alertMessage("Drawing Line..");
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
    if (!fixed) {
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
   * Function to show a circle on the canvas to highlight the cursor
   * @param {CanvasRenderingContext2D} ctxSouris
   * @param {Array} coordinate [x, y]
   */
  const showCercle = (ctxSouris, coord) => {
    if (!mouseCircle.current.show) return;
    ctxSouris.beginPath();
    ctxSouris.arc(
      coord.x,
      coord.y,
      mouseCircle.current.size,
      0,
      Math.PI * 2,
      false
    );
    ctxSouris.fillStyle = mouseCircle.current.color;
    ctxSouris.fill();
  };

  /**
   * erase canavasOver
   */
  const eraseCanvasOver = () => {
    const context = canvasOverRef.current.getContext("2d");
    if (!context || !drawingParams.current) {
      return;
    }
    if (
      (drawingParams.current.mode === DRAWING_MODES.SQUARE ||
        drawingParams.current.mode === DRAWING_MODES.CIRCLE ||
        drawingParams.current.mode === DRAWING_MODES.TEXT) &&
      fixed
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
    if (!context || !drawingParams.current) {
      if (drawingParams.current === null) {
        // initalisation at the first time
        drawingParams.current = getParams();
        // console.log("Init Drawing Params: ", drawingParams.current);
        if (!historyRef.current || historyRef.current.length === 0) {
          // for undo record white canvas, first pic in history is white canvas
          savePics();
        }
      }
      return;
    }

    cursorRef.current = "default";
    // clear the temporary canvas
    context.clearRect(0, 0, canvasOver.width, canvasOver.height);

    let coordinate = setCoordinates(event, canvasOver);

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.SQUARE:
      case DRAWING_MODES.CIRCLE:
      case DRAWING_MODES.TEXT:
        {
          let border = null;
          if (fixed) {
            border = isOnSquareBorder(coordinate, squareRef.current, true);
            if (
              drawingParams.current.mode === DRAWING_MODES.TEXT &&
              isBorder(border)
            ) {
              cursorRef.current = "move";
              border = BORDER.INSIDE;
            }
            if (border) {
              cursorRef.current = mousePointer(border);

              if (isInside(border)) {
                // show real color when mouse is inside the square
                context.globalAlpha = drawingParams.current.opacity;
              }
            }
          } else {
            cursorRef.current = "pointer";
          }

          showElement(context, coordinate, true, border);
        }
        break;

      case DRAWING_MODES.LINE:
        if (getStartCoordinates() == null) return;
        basicLine(context, getStartCoordinates(), coordinate);

        break;
      case DRAWING_MODES.DRAW:
        basicLine(context, coordinate, coordinate);
        showCercle(context, coordinate);
        break;
    }
    canvasOverRef.current.style.cursor = cursorRef.current;
  };

  useEffect(() => {
    // if (!canvasRef || !canvasRef.current) return;

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
      }

      if (isDrawing.current) {
        draw(event);
      } else if (
        isResizing.current &&
        (drawingParams.current.mode === DRAWING_MODES.SQUARE ||
          drawingParams.current.mode === DRAWING_MODES.CIRCLE)
      ) {
        resizingSquare(event, canvasElement);
      } else {
        followCursor(event, 0.3);
      }
    };
    const hanldeKeyDown = (event) => {
      if (event.key === "Escape") {
        eraseStartCoordinates();
        // drawingParams.current.mode = DRAWING_MODES.DRAW;
        alertMessage("Escape key pressed...");
      }
    };
    const handleModeChange = (event) => {
      const newMode = event.detail.mode;
      if (newMode === DRAWING_MODES.DRAWING_CHANGE) {
        drawingParams.current = getParams();
        if (
          drawingParams.current.mode === DRAWING_MODES.SQUARE ||
          drawingParams.current.mode === DRAWING_MODES.CIRCLE
        ) {
          squareRef.current.color = drawingParams.current.color;
          squareRef.current.lineWidth = drawingParams.current.lineWidth;
          squareRef.current.opacity = drawingParams.current.opacity;

          squareRef.current.shape = { ...drawingParams.current.shape };

          if (drawingParams.current.shape.withBorder) {
            squareRef.current.border = { ...drawingParams.current.border };
          }

          if (drawingParams.current.shape.withText) {
            squareRef.current.text = { ...drawingParams.current.text };
          }
        } else if (drawingParams.current.mode == DRAWING_MODES.TEXT) {
          squareRef.current.text = { ...drawingParams.current.text };
        }
        followCursor(event);
        // console.log(`event ${newMode}`, newParam);
      } else if (ALL_DRAWING_MODES.includes(newMode)) {
        if (drawingParams.current === null) {
          drawingParams.current = getParams();
        }
        drawingParams.current.mode = newMode;
        alertMessage(`Mode changed to ${newMode}`);
      }

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
    };

    document.addEventListener("modeChanged", handleModeChange);
    canvasElement.addEventListener("mousedown", handleMouseDown);
    canvasElement.addEventListener("mousemove", handleMouseMove);
    canvasElement.addEventListener("mouseup", handleMouseUp);
    canvasElement.addEventListener("mouseleave", eraseCanvasOver);
    window.addEventListener("keydown", hanldeKeyDown);

    return () => {
      canvasElement.removeEventListener("mousedown", handleMouseDown);
      canvasElement.removeEventListener("mousemove", handleMouseMove);
      canvasElement.removeEventListener("mouseup", handleMouseUp);
      canvasElement.removeEventListener("mouseleave", eraseCanvasOver);
      window.removeEventListener("keydown", hanldeKeyDown);
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
