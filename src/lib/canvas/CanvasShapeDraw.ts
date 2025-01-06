import {
  isDrawingShape,
  ParamsGeneral,
  SHAPE_TYPE,
  ShapeDefinition,
} from "./canvas-defines";
import { Area } from "./types";
import { drawDashedRectangle } from "@/lib/canvas/canvas-dashed-rect";
import {
  drawRoundedRect,
  drawRectWithRoundedCorner,
  drawShadowRectangle,
  drawImage,
} from "./canvas-elements";
import {
  drawCornerButton,
  drawCornerButtonDelete,
  drawTurningButtons,
} from "./canvas-buttons";
import {
  BORDER,
  isBorder,
  topRightPosition,
  topRightPositionOver,
} from "@/lib/mouse-position";
import { scaledSize } from "../utils/scaledSize";

const TEXT_PADDING = 20;

type drawingProps = {
  ctx: CanvasRenderingContext2D;
  squareSize: Area;
  lineWidth?: number;
  radius?: number;
  type?: string;
  virtualCanvas?: HTMLCanvasElement | null;
  blackWhite?: boolean;
};

export class CanvasShapeDraw {
  data: ShapeDefinition;
  protected scale: number = 1;

  constructor(data: ShapeDefinition) {
    this.data = data;
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  /**
   * rotation for an element
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, color, type, rotation}
   * @param {number} angle - angle of rotation in radian
   * @param {boolean} saveContext - save the context before rotation
   */
  rotateElement = (
    ctx: CanvasRenderingContext2D,
    sSize: Area,
    angle: number,
    saveContext = true
  ) => {
    if (angle === 0) {
      return;
    }
    if (saveContext) ctx.save();
    ctx.translate(sSize.x + sSize.width / 2, sSize.y + sSize.height / 2);
    // ctx.rotate(angle);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-(sSize.x + sSize.width / 2), -(sSize.y + sSize.height / 2));
  };

  /**
   * calculate the size and position of the shape then the shape is not filled
   * @param square
   * @param lineWidth
   * @returns
   */
  getShapeSize = (square: Area, lWidth: number = 0) => {
    let { x, y, width, height } = square;

    if (lWidth > 0) {
      width -= lWidth;
      height -= lWidth;
      x += lWidth / 2;
      y += lWidth / 2;
    }

    return { x, y, width, height } as Area;
  };

  /**
   * Function to show a square on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} squareSize: Area - {x, y, width, height}
   * @param {number} lineWidth - width of the line
   * @param {number} radius - radius of the square
   */
  drawSquare = ({ ctx, squareSize, lineWidth, radius }: drawingProps) => {
    const newArea = this.getShapeSize(squareSize, lineWidth);

    ctx.beginPath();

    if (!radius || radius < 1) {
      ctx.lineJoin = "miter";
      const { x, y, width, height } = newArea;
      ctx.rect(x, y, width, height);
    } else {
      drawRoundedRect(ctx, newArea, radius);
    }
  };
  /**
   * Function to show a square with one rounded angle
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, color, filled, radius, type, rotation}
   */
  drawSquareWithRoundedCorner = ({
    ctx,
    squareSize,
    lineWidth,
    radius = 0,
    type: shapeType,
  }: drawingProps) => {
    const { x, y, width, height } = this.getShapeSize(squareSize, lineWidth);
    if (!shapeType) shapeType = SHAPE_TYPE.TWO_RADIUS;

    if (!radius || radius < 1) {
      ctx.lineJoin = "miter";
    }
    drawRectWithRoundedCorner(ctx, x, y, width, height, radius, shapeType);
  };
  /**
   * Function to show an ellipse on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, color, type, rotation}
   */
  drawEllipse = ({ ctx, squareSize, lineWidth }: drawingProps) => {
    const { x, y, width, height } = this.getShapeSize(squareSize, lineWidth);

    ctx.beginPath();
    if (width === height) {
      ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
    } else {
      ctx.ellipse(
        x + width / 2,
        y + height / 2,
        width / 2,
        height / 2,
        0,
        0,
        2 * Math.PI
      );
    }
  };

  /**
   * Function to show a border around a square or an ellipse on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} squareBorder - {color, lineWidth, opacity, interval}
   * @param {object} squareSize - {x, y, width, height}
   * @param {number} radius - radius of the shape
   * @param {string} shapeType - type of the shape
   * @param {Function} drawingFunction - function to draw the shape (drawSquare, drawSquareWithRoundedCorner, drawEllipse)
   */
  drawBorder = (
    ctx: CanvasRenderingContext2D,
    squareBorder: ParamsGeneral,
    squareSize: Area,
    radius: number,
    shapeType: string,
    drawingFunction: (props: drawingProps) => void
  ) => {
    const bWidth = squareBorder.lineWidth * this.scale;
    const bInterval = squareBorder.interval
      ? squareBorder.interval * this.scale
      : 0;

    const bSize: Area = { ...squareSize };
    const addRadius = bWidth + bInterval;
    bSize.width += addRadius * 2;
    bSize.height += addRadius * 2;
    bSize.x -= bWidth + bInterval;
    bSize.y -= bWidth + bInterval;

    let radiusB: number = radius;
    if (radius > 0) {
      radiusB += addRadius;
    }
    ctx.beginPath();
    ctx.globalAlpha = squareBorder.opacity;
    ctx.strokeStyle = squareBorder.color;
    ctx.lineWidth = bWidth;

    drawingFunction({
      ctx,
      squareSize: bSize,
      lineWidth: bWidth,
      radius: radiusB,
      type: shapeType,
    } as drawingProps);

    ctx.stroke();
  };

  /**
   * Function to show a text on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, color, type, rotation}
   */
  drawText = (ctx: CanvasRenderingContext2D, square: ShapeDefinition) => {
    let paddingX: number, paddingY: number;
    if (!square.text) return;
    const sSize = scaledSize(square.size, this.scale);
    const rotation: number = square.rotation + square.text.rotation;
    if (rotation !== 0) {
      this.rotateElement(ctx, sSize, rotation);
    }

    const paramsText = square.text;
    const fontSize = paramsText.fontSize * this.scale;
    const text = paramsText.text ?? "";

    ctx.font = `${paramsText.bold} ${
      paramsText.italic ? "italic" : ""
    } ${fontSize}px ${paramsText.font}`;

    // console.log("draw text", square);
    ctx.fillStyle = paramsText.color;

    const w = ctx.measureText(text).width;
    const h = ctx.measureText(text).actualBoundingBoxAscent;

    if (square.type === SHAPE_TYPE.TEXT) {
      // text alone
      paddingY = paddingX = Math.min(TEXT_PADDING, h);

      sSize.width = w + 2 * paddingX;
      sSize.height = h + 2 * paddingY;
    } else {
      // text with rectangle or ellipse
      paddingY = (sSize.height - h) / 2;
      paddingX = (sSize.width - w) / 2;
      ctx.globalAlpha = square.general.opacity;
    }
    ctx.fillText(text, sSize.x + paddingX, sSize.y + h + paddingY);

    if (rotation !== 0) {
      ctx.restore();
    }
  };

  /**
   * draw buttons from shape on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, color, type, rotation}
   * @param {string} border - border where the mouse is
   */
  drawButtonsAndLines = (
    ctx: CanvasRenderingContext2D,
    square: ShapeDefinition,
    border: string | null
  ) => {
    const sSize: Area = scaledSize(square.size, this.scale);

    if (square?.withCornerButton) {
      let opacity = border === BORDER.ON_BUTTON ? 1 : 0.5;
      const bPos = topRightPosition(
        sSize,
        ctx.canvas.width,
        ctx.canvas.height,
        square.rotation
      );
      drawCornerButton(ctx, bPos.centerX, bPos.centerY, bPos.radius, opacity);

      const bPosDel = topRightPositionOver(
        sSize,
        ctx.canvas.width,
        ctx.canvas.height,
        square.rotation
      );
      opacity = border === BORDER.ON_BUTTON_DELETE ? 1 : 0.5;
      drawCornerButtonDelete(
        ctx,
        bPosDel.centerX,
        bPosDel.centerY,
        bPosDel.radius,
        opacity
      );
    }
    /**
     * draw the middle button used to rotate the shape
     */
    if (square?.withTurningButtons) {
      drawTurningButtons(ctx, sSize, border);
    }

    const rotation =
      square.rotation +
      (square.type === SHAPE_TYPE.TEXT ? square.text?.rotation ?? 0 : 0);
    if (rotation !== 0) {
      this.rotateElement(ctx, sSize, square.rotation);
    }
    switch (square.type) {
      case SHAPE_TYPE.IMAGE:
        ctx.beginPath();
        ctx.strokeStyle = "rgba(49,130,236,0.6)";
        ctx.lineWidth = 4;

        ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
        ctx.stroke();
        ctx.fillStyle = "rgba(50, 50, 50, 0.20)";
        ctx.beginPath();
        ctx.rect(sSize.x + 1, sSize.y + 1, sSize.width - 2, sSize.height - 2);
        ctx.fill();
        break;
      case SHAPE_TYPE.TEXT:
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;

        ctx.rect(sSize.x, sSize.y, sSize.width, sSize.height);
        ctx.stroke();
        break;

      case SHAPE_TYPE.CIRCLE:
        // show the rectangle around the ellipse and circle
        drawShadowRectangle(ctx, sSize);
        break;

      default:
        // show the rectangle around the shape
        if (
          square.shape &&
          square.shape.radius &&
          square.shape.radius >= 10
          //  && square.shape.withBorder === false
        ) {
          const brd = border ? isBorder(border) : false;
          const lineDash = brd ? [] : [5, 2];
          const strokeStyle = brd ? "#60000" : "rgba(132,132,192,0.8)";
          drawShadowRectangle(ctx, sSize, strokeStyle, lineDash);
        }
        break;
    }

    if (rotation !== 0) {
      ctx.restore();
    }
  };

  /**
   * function to shapDraw a shape on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {ShapeDefinition} data - data to show
   * @param {boolean} withButton - show button to resize the square
   */
  shapeDrawing = (
    ctx: CanvasRenderingContext2D,
    square: ShapeDefinition,
    withButton: boolean
  ) => {
    const squareSize = scaledSize(square.size, this.scale);
    if (square.rotation !== 0) {
      this.rotateElement(ctx, squareSize, square.rotation);
    }
    if (!square.shape) return;

    let drawingBorderFunction: (props: drawingProps) => void = this.drawSquare;

    const { radius = 0, blackWhite = false } = square.shape;
    const { color, filled = false } = square.general;
    const lineWidth = filled ? 0 : square.general.lineWidth * this.scale;
    const type = square.type;

    ctx.fillStyle = color;
    if (!filled) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
    }

    ctx.filter = blackWhite ? "grayscale(100%)" : "none";

    switch (type) {
      case SHAPE_TYPE.IMAGE:
        drawImage({
          ctx,
          squareSize,
          radius,
          virtualCanvas: square.canvasImageTransparent ?? square.canvasImage,
        });
        break;
      case SHAPE_TYPE.SQUARE:
        this.drawSquare({
          ctx,
          squareSize,
          lineWidth,
          radius,
        });
        break;
      case SHAPE_TYPE.CIRCLE:
        this.drawEllipse({
          ctx,
          squareSize,
          lineWidth,
        });
        drawingBorderFunction = this.drawEllipse;
        break;

      default: // all square with rounded corner
        this.drawSquareWithRoundedCorner({
          ctx,
          squareSize,
          lineWidth,
          radius,
          type,
        });
        drawingBorderFunction = this.drawSquareWithRoundedCorner;
        break;
    }

    if (isDrawingShape(type)) {
      if (filled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }
    }

    // Draw the border if needed
    if (square.shape?.withBorder && square.border) {
      if (!withButton) {
        ctx.globalAlpha = square.border.opacity;
      }
      if (drawingBorderFunction) {
        this.drawBorder(
          ctx,
          square.border,
          squareSize,
          radius,
          square.type,
          drawingBorderFunction
        );
      }
    }

    if (square.rotation !== 0 || blackWhite) {
      ctx.restore();
    }
  };

  /**
   * Function to show a element (square, ellipse or text) on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, rotation, type, text}
   * @param {boolean} withButton - show button to resize the square
   * @param {string} mouseOnShape - border where the mouse is
   */
  showElement = (
    ctx: CanvasRenderingContext2D | null,
    square: ShapeDefinition,
    withButton: boolean = true,
    mouseOnShape: string | null = null
  ) => {
    if (!ctx) return;
    // console.log("show", square.type, square.size);
    switch (square.type) {
      case SHAPE_TYPE.TEXT:
        if (!square.text || !square.text.text) return;
        this.drawText(ctx, square);
        break;
      case SHAPE_TYPE.SELECT:
        drawDashedRectangle(ctx, square.size);
        return;
      default: // all square with rounded corner
        this.shapeDrawing(ctx, square, withButton);
        break;
    }

    if (isDrawingShape(square.type)) {
      if (square?.shape?.withText) {
        // text inside the square
        this.drawText(ctx, square);
      }
    }

    if (withButton) {
      this.drawButtonsAndLines(ctx, square, mouseOnShape);
    }
  };
}
