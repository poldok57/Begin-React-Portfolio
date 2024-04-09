import { useEffect, useRef } from "react";
import { useMessage } from "../../context/MessageProvider";
import { debounceLogs } from "../../lib/debounce-logs";
import { BORDER, mousePointer } from "../../lib/mouse-position";
import {
  isInsideSquare,
  isOnSquareBorder,
  resizeSquare,
  setSquareDecalage,
  getSquareDecalage,
} from "../../lib/square-position";

import { DRAWING_MODES } from "./Draw";

const MAX_UNDO = 10;

// Draw on Canvas
export const DrawCanvas = ({
  canvas: canvasRef,
  history: historyRef,
  getParams,
}) => {
  const isDrawing = useRef(false);
  const isResizing = useRef(null);
  const lastCoordinate = useRef(null);
  const startCoordinate = useRef(null);
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

  const lineCap = useRef("round");

  const { alertMessage } = useMessage();

  const initSquare = () => {
    squareRef.current = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      show: true,
      fixed: false,
      radius: 5,
      width: SQUARE_WIDTH,
      height: SQUARE_HEIGHT,
    };
    setSquareDecalage(
      { x: SQUARE_WIDTH / 2, y: SQUARE_HEIGHT / 2 },
      { x: 0, y: 0 }
    );
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
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

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

    return (lastCoordinate.current = { x, y });
  };

  const setStartCoordinates = (coordinate) => {
    startCoordinate.current = coordinate;
  };
  const eraseStartCoordinates = () => {
    startCoordinate.current = null;
  };
  const getStartCoordinates = () => {
    return startCoordinate.current;
  };

  const getCoordinates = () => {
    return lastCoordinate.current;
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
      ctx.lineWidth = drawingParams.current.width;
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

      case DRAWING_MODES.SQUARE:
        if (squareRef.current.fixed) {
          // if mouse is inside the square, move it
          if (isInsideSquare(getCoordinates(), squareRef.current, true)) {
            const border = isOnSquareBorder(
              getCoordinates(),
              squareRef.current,
              true
            );
            if (border) {
              if (border === BORDER.INSIDE) {
                canvasOverRef.current.style.cursor = "pointer";
                squareRef.current.fixed = false;
              } else if (border === BORDER.ON_BUTTON) {
                canvasOverRef.current.style.cursor = "pointer";
                drawSquare();
                initSquare();
                drawingParams.current.mode = DRAWING_MODES.DRAW;
              } else {
                isResizing.current = border;
                console.log(
                  "Start resizing...",
                  border,
                  "fixed:",
                  squareRef.current.fixed
                );
              }
            }
          }
        }
        break;
    }

    alertMessage(
      `Start ${drawingParams.current.mode} : + color:${drawingParams.current.color}`
    );
  };

  const resizingSquare = (event, canvas) => {
    const context = setContext(canvas, 0.4);
    if (!context) return;

    const coordinate = setCoordinates(event, canvas);
    const border = isResizing.current;
    if (border) {
      const { coord, newSquare } = resizeSquare(
        coordinate,
        squareRef.current,
        border
      );
      squareRef.current.fixed = true;
      squareRef.current = { ...squareRef.current, ...newSquare };

      context.clearRect(0, 0, canvas.width, canvas.height);
      showSquare(context, coord);

      // console.log(
      //   "Resizing from ",
      //   border,
      //   " left:",
      //   Math.floor(squareRef.current.x),
      //   " top:",
      //   Math.floor(squareRef.current.y),
      //   ` size: ${squareRef.current.width} x ${squareRef.current.height}`,
      //   ` coord: ${Math.floor(coord.x)} x ${Math.floor(coord.y)}`
      // );
    }
  };
  /**
   * Function to stop drawing on the canvas
   */
  const stopDrawing = () => {
    isDrawing.current = false;
    lastCoordinate.current = null;

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.DRAW:
        savePics();
        alertMessage("STOP Drawing...");
        break;
      case DRAWING_MODES.SQUARE:
        squareRef.current.fixed = true;
        isResizing.current = null;
        console.log("Stop moving Square...");
        break;
    }
  };

  /**
   * Function to draw a basic line on the canvas
   * @param {CanvasRenderingContext2D} context
   * @param {object} start {x, y}
   * @param {object} end {x, y}
   */
  const basicLine = (context, start, end) => {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
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

      const co = getCoordinates();
      debounceLogs(`Drawing.. ${co.x}x${co.y}`);
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

    if (start == null) {
      // if start is null, set start coordinates and drow a point
      start = end;
    }

    basicLine(context, start, end);
    setStartCoordinates(end);

    savePics();

    alertMessage("Drawing Line..");
  };

  /**
   * Function to draw a check mark
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - x coordinate
   * @param {number} y  - y coordinate
   * @param {number} size - size of the check mark
   */
  function drawCheckMark(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / 4, y + size / 4);
    ctx.lineTo(x + size, y - size / 2);
    ctx.strokeStyle = "green"; // Color of the check mark
    ctx.lineWidth = 2; // width of the check mark
    ctx.stroke();
  }

  function drawBadge(ctx, x, y, width) {
    // cercle parameters
    const circleRadius = 10;
    const circleX = x + width - circleRadius; // center circle X
    const circleY = y + circleRadius; // center circle Y
    const circleColor = "#e0e0e0"; // color of the circle

    // draw the circle
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    ctx.fillStyle = circleColor;
    ctx.globalAlpha = 1;
    ctx.fill();

    // draw the check mark
    drawCheckMark(ctx, circleX - 6, circleY, 10);
  }
  /**
   * Function to draw a rounded rectangle
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} radius
   */
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    // ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    // ctx.fillStyle = drawingParams.current.color;
    // ctx.globalAlpha = square.opacity;
    // ctx.fill();
  }

  /**
   * Function to show a square on the canvas
   */
  const showSquare = (ctx, coord, withBtn = true) => {
    if (!squareRef.current.show) {
      return;
    }
    const square = squareRef.current;
    if (!square.fixed) {
      console.log("Show square... not fixed");
      const decal = getSquareDecalage(coord);
      square.x = decal.x;
      square.y = decal.y;
    }
    ctx.beginPath();
    if (!square.radius || square.radius < 1) {
      ctx.rect(square.x, square.y, square.width, square.height);
    } else {
      drawRoundedRect(
        ctx,
        square.x,
        square.y,
        square.width,
        square.height,
        square.radius
      );
    }
    ctx.fillStyle = drawingParams.current.color;
    ctx.fill();
    if (withBtn) drawBadge(ctx, square.x, square.y, square.width);
  };

  /**
   * Function to show a square on the canvas
   */
  const drawSquare = () => {
    const canvas = canvasRef.current;
    const context = setContext(canvas);
    if (!context) {
      return;
    }

    squareRef.current.fixed = true;

    showSquare(context, null, false);
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
    if (!context) {
      return;
    }
    if (
      drawingParams.current.mode === DRAWING_MODES.SQUARE &&
      squareRef.current.fixed
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
   */
  const followCursor = (event) => {
    const canvasOver = canvasOverRef.current;
    const context = setContext(canvasOver, 0.3);
    if (!context) {
      return;
    }

    cursorRef.current = "default";

    context.clearRect(0, 0, canvasOver.width, canvasOver.height);

    let coordinate = setCoordinates(event, canvasOver);
    if (
      drawingParams.current !== null &&
      drawingParams.current.mode === DRAWING_MODES.SQUARE
    ) {
      if (squareRef.current.fixed) {
        const border = isOnSquareBorder(coordinate, squareRef.current, true);
        if (border) {
          cursorRef.current = mousePointer(border);

          if (border === BORDER.INSIDE || border === BORDER.ON_BUTTON) {
            // show real color when mouse is inside the square
            context.globalAlpha = drawingParams.current.opacity;
          }
        }
      } else {
        cursorRef.current = "pointer";
      }
      showSquare(context, coordinate);
    } else showCercle(context, coordinate);

    if (drawingParams.current === null) {
      drawingParams.current = getParams();
      if (!historyRef.current || historyRef.current.length === 0) {
        // for undo record white canvas, first pic in history is white canvas
        savePics();
      }
    }

    switch (drawingParams.current.mode) {
      case DRAWING_MODES.LINE:
        if (getStartCoordinates() == null) return;
        basicLine(context, getStartCoordinates(), coordinate);
        break;
      case DRAWING_MODES.DRAW:
        basicLine(context, coordinate, coordinate);
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
        initSquare();
        savePics();
      }

      if (isDrawing.current) {
        draw(event);
      } else if (
        drawingParams.current.mode === DRAWING_MODES.SQUARE &&
        isResizing.current
      ) {
        resizingSquare(event, canvasElement);
      } else {
        followCursor(event);
      }
    };
    const hanldeKeyDown = (event) => {
      if (event.key === "Escape") {
        eraseStartCoordinates();
        drawingParams.current.mode = DRAWING_MODES.DRAW;
        alertMessage("Escape key pressed...");
      }
    };

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
