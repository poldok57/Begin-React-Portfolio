import {
  isDrawingShape,
  ParamsGeneral,
  ParamsText,
  SHAPE_TYPE,
  ShapeDefinition,
} from "./canvas-defines";
import { Area, ButtonArgs, Coordinate, MiddleButton, Size } from "./types";
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
import { scaledCoordinate, scaledSize } from "../utils/scaledSize";

const TEXT_PADDING = 20;

type drawingProps = {
  ctx: CanvasRenderingContext2D;
  area: Area;
  center?: Coordinate;
  lineWidth?: number;
  radius?: number;
  type?: string;
  virtualCanvas?: HTMLCanvasElement | null;
  blackWhite?: boolean;
  isDrawingBorder?: boolean;
};

export class CanvasShapeDraw {
  data: ShapeDefinition;
  protected scale: number = 1;
  protected btnValidPos: ButtonArgs | null = null;
  protected btnDeletePos: ButtonArgs | null = null;
  protected btnMiddlePos: MiddleButton | null = null;

  constructor(data: ShapeDefinition) {
    this.data = data;
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  getBtnValidPos() {
    return this.btnValidPos;
  }

  getBtnDeletePos() {
    return this.btnDeletePos;
  }

  getBtnMiddlePos() {
    return this.btnMiddlePos;
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
    center: Coordinate,
    sSize: Size,
    angle: number,
    saveContext = true
  ) => {
    if (angle === 0) {
      return;
    }
    if (saveContext) ctx.save();
    ctx.translate(center.x, center.y);
    // ctx.rotate(angle);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-center.x, -center.y);
  };

  /**
   * calculate the size and position of the shape then the shape is not filled
   * @param square
   * @param lineWidth
   * @returns
   */
  getShapeSize = (square: Area, lWidth: number = 0) => {
    let { x, y, width, height } = square;
    // console.log("getShapeSize", square, lWidth);
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
   * @param {object} area: Area - {x, y, width, height}
   * @param {number} lineWidth - width of the line
   * @param {number} radius - radius of the square
   */
  drawSquare = ({
    ctx,
    area,
    lineWidth,
    radius,
    isDrawingBorder = false,
  }: drawingProps) => {
    const newArea = this.getShapeSize(area, lineWidth);

    if (!isDrawingBorder && lineWidth && lineWidth > 0 && radius) {
      radius = Math.max(0, radius - lineWidth / 2);
    }

    if (!radius || radius < 1) {
      ctx.beginPath();

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
    area,
    lineWidth,
    radius = 0,
    type: shapeType,
    isDrawingBorder = false,
  }: drawingProps) => {
    const { x, y, width, height } = this.getShapeSize(area, lineWidth);
    if (!shapeType) shapeType = SHAPE_TYPE.TWO_RADIUS;

    if (!isDrawingBorder && lineWidth && lineWidth > 0 && radius) {
      radius = Math.max(0, radius - lineWidth / 2);
    }
    if (!radius || radius < 1) {
      ctx.lineJoin = "miter";
    }
    drawRectWithRoundedCorner(ctx, x, y, width, height, radius, shapeType);
  };
  /**
   * Function to show an ellipse on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} area - {x, y, width, height}
   * @param {Coordinate} center - {x, y}
   * @param {number} lineWidth - width of the line
   */
  drawEllipse = ({ ctx, area, center, lineWidth }: drawingProps) => {
    const { x, y, width, height } = this.getShapeSize(area, lineWidth);
    if (!center) center = { x: x + width / 2, y: y + height / 2 };
    ctx.beginPath();
    if (width === height) {
      ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
    } else {
      ctx.ellipse(center.x, center.y, width / 2, height / 2, 0, 0, 2 * Math.PI);
    }
  };

  /**
   * Function to show a border around a square or an ellipse on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} squareBorder - {color, lineWidth, opacity, interval}
   * @param {object} area - {x, y, width, height}
   * @param {Coordinate} center - {x, y}
   * @param {number} radius - radius of the shape
   * @param {string} shapeType - type of the shape
   * @param {Function} drawingFunction - function to draw the shape (drawSquare, drawSquareWithRoundedCorner, drawEllipse)
   */
  private drawBorder = (
    ctx: CanvasRenderingContext2D,
    squareBorder: ParamsGeneral,
    area: Area,
    center: Coordinate,
    radius: number,
    shapeType: string,
    drawingFunction: (props: drawingProps) => void
  ) => {
    const bWidth = squareBorder.lineWidth * this.scale;
    const bInterval = squareBorder.interval
      ? squareBorder.interval * this.scale
      : 0;

    const bSize: Area = { ...area };
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
      area: bSize,
      center,
      lineWidth: bWidth,
      radius: radiusB,
      type: shapeType,
      isDrawingBorder: true,
    } as drawingProps);

    ctx.stroke();
  };

  /**
   * calculate the size of a text
   * @param {CanvasRenderingContext2D} ctx
   * @param {ParamsText} paramsText
   * @returns {Size} - {width, height}
   */
  textSize = (ctx: CanvasRenderingContext2D, paramsText: ParamsText) => {
    const fontSize = paramsText.fontSize;
    const text = paramsText.text ?? "";
    ctx.font = `${paramsText.bold} ${
      paramsText.italic ? "italic" : ""
    } ${fontSize}px ${paramsText.font}`;

    const h = ctx.measureText(text).actualBoundingBoxAscent;
    const padding = Math.min(TEXT_PADDING, h);

    const width = ctx.measureText(text).width + 2 * padding;
    const height = h + 2 * padding;
    return { width, height } as Size;
  };

  /**
   * Function to show a text on the canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} square - {x, y, width, height, color, type, rotation}
   */
  drawText = (ctx: CanvasRenderingContext2D, square: ShapeDefinition) => {
    let paddingX: number, paddingY: number;
    if (!square.text) return;
    const center = scaledCoordinate(square.center, this.scale);
    const size = scaledSize(square.size, this.scale);
    const rotation: number = square.rotation + square.text.rotation;
    if (rotation !== 0) {
      this.rotateElement(ctx, center, size, rotation);
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

    const area: Area = {
      ...size,
      x: center.x - size.width / 2,
      y: center.y - size.height / 2,
    };
    if (square.type === SHAPE_TYPE.TEXT) {
      // text alone
      paddingY = paddingX = Math.min(TEXT_PADDING, h);

      area.width = w + 2 * paddingX;
      area.height = h + 2 * paddingY;
    } else {
      // text with rectangle or ellipse
      paddingY = (area.height - h) / 2;
      paddingX = (area.width - w) / 2;
      ctx.globalAlpha = square.general.opacity;
    }
    ctx.fillText(text, area.x + paddingX, area.y + h + paddingY);

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
    border: string | null,
    withCornerButton: boolean = true,
    withTurningButtons: boolean = false
  ) => {
    const sSize: Size = scaledSize(square.size, this.scale);
    const center = scaledCoordinate(square.center, this.scale);
    const area: Area = {
      ...sSize,
      x: center.x - sSize.width / 2,
      y: center.y - sSize.height / 2,
    };
    if (withCornerButton) {
      let opacity = border === BORDER.ON_BUTTON ? 1 : 0.5;
      this.btnValidPos = topRightPosition(
        center,
        sSize,
        ctx.canvas.width,
        ctx.canvas.height,
        square.rotation
      );
      drawCornerButton(
        ctx,
        this.btnValidPos.centerX,
        this.btnValidPos.centerY,
        this.btnValidPos.radius,
        opacity,
        border === BORDER.ON_BUTTON
      );

      this.btnDeletePos = topRightPositionOver(
        center,
        sSize,
        ctx.canvas.width,
        ctx.canvas.height,
        square.rotation
      );
      opacity = border === BORDER.ON_BUTTON_DELETE ? 1 : 0.5;
      drawCornerButtonDelete(
        ctx,
        this.btnDeletePos.centerX,
        this.btnDeletePos.centerY,
        this.btnDeletePos.radius,
        opacity,
        border === BORDER.ON_BUTTON_DELETE
      );
    } else {
      this.btnValidPos = null;
      this.btnDeletePos = null;
    }
    /**
     * draw the middle button used to rotate the shape
     */
    if (withTurningButtons) {
      this.btnMiddlePos = drawTurningButtons(ctx, center, sSize, border);
    } else {
      this.btnMiddlePos = null;
    }

    const rotation =
      square.rotation +
      (square.type === SHAPE_TYPE.TEXT ? square.text?.rotation ?? 0 : 0);
    if (rotation !== 0) {
      this.rotateElement(ctx, center, sSize, square.rotation);
    }
    switch (square.type) {
      case SHAPE_TYPE.IMAGE:
        ctx.beginPath();
        ctx.strokeStyle = "rgba(49,130,236,0.6)";
        ctx.lineWidth = 4;

        ctx.rect(area.x, area.y, area.width, area.height);
        ctx.stroke();
        ctx.fillStyle = "rgba(50, 50, 50, 0.20)";
        ctx.beginPath();
        ctx.rect(area.x + 1, area.y + 1, area.width - 2, area.height - 2);
        ctx.fill();
        break;
      case SHAPE_TYPE.TEXT:
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 1;

        ctx.rect(area.x, area.y, area.width, area.height);
        ctx.stroke();
        break;

      case SHAPE_TYPE.CIRCLE:
        // show the rectangle around the ellipse and circle
        drawShadowRectangle(ctx, area);
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
          drawShadowRectangle(ctx, area, strokeStyle, lineDash);
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
    const center = scaledCoordinate(square.center, this.scale);
    if (square.rotation !== 0) {
      this.rotateElement(ctx, center, squareSize, square.rotation);
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
    const area: Area = {
      ...squareSize,
      x: center.x - squareSize.width / 2,
      y: center.y - squareSize.height / 2,
    };
    switch (type) {
      case SHAPE_TYPE.IMAGE:
        drawImage({
          ctx,
          area,
          radius,
          virtualCanvas: square.canvasImageTransparent ?? square.canvasImage,
        });
        break;
      case SHAPE_TYPE.SQUARE:
        this.drawSquare({
          ctx,
          area,
          lineWidth,
          radius,
        });
        break;
      case SHAPE_TYPE.CIRCLE:
        this.drawEllipse({
          ctx,
          area,
          center,
          lineWidth,
        });
        drawingBorderFunction = this.drawEllipse;
        break;

      default: // all square with rounded corner
        this.drawSquareWithRoundedCorner({
          ctx,
          area,
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
          area,
          center,
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
  showElement = ({
    ctx,
    square,
    withButton,
    mouseOnShape,
    withCornerButton,
    withTurningButtons,
  }: {
    ctx: CanvasRenderingContext2D | null;
    square: ShapeDefinition;
    withButton: boolean;
    withCornerButton: boolean;
    withTurningButtons: boolean;
    mouseOnShape: string | null;
  }) => {
    if (!ctx) return;

    // console.log("show", square.type, square.size);
    switch (square.type) {
      case SHAPE_TYPE.TEXT:
        if (!square.text || !square.text.text) return;
        this.drawText(ctx, square);
        {
          const size = this.textSize(ctx, square.text);
          square.size = { ...square.size, ...size };
        }
        break;
      case SHAPE_TYPE.SELECT:
        drawDashedRectangle(ctx, square.center, square.size);
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
      this.drawButtonsAndLines(
        ctx,
        square,
        mouseOnShape,
        withCornerButton,
        withTurningButtons
      );
    }
  };
}
