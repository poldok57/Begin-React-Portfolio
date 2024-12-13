/**
 * @module canvas-shape
 * @description
 * this interface is used to draw shapes on a canvas
 */
import { Area, Coordinate, ArgsMouseOnShape } from "./types";
import {
  AllParams,
  ParamsGeneral,
  ParamsShape,
  ParamsText,
  ShapeDefinition,
  DRAWING_MODES,
} from "./canvas-defines";
import { resizingElement } from "./canvas-resize";
import { CanvasDrawableObject } from "./CanvasDrawableObject";
import { showElement } from "./canvas-elements";
import { isOnSquareBorder } from "@/lib/square-position";
import { throttle } from "@/lib/utils/throttle";
import { imageLoadInCanvas } from "./image-load";
import {
  makeWhiteTransparent,
  makeCornerTransparent,
  CornerColors,
} from "./image-transparency";
import { useDesignStore } from "@/lib/stores/design";

const compressImage = (canvasImage: HTMLCanvasElement) => {
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");

  tempCanvas.width = canvasImage.width / 2;
  tempCanvas.height = canvasImage.height / 2;

  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvasImage, 0, 0, tempCanvas.width, tempCanvas.height);
    return tempCanvas.toDataURL("image/png");
  }
  return null;
};

export class CanvasShape extends CanvasDrawableObject {
  protected data: ShapeDefinition;
  private previousTransparency: number = 0;
  private getImageDataURL: (id: string) => string | null;

  constructor() {
    super();
    this.data = {
      id: "",
      type: "",
      rotation: 0,
      size: { x: 0, y: 0, width: 0, height: 0 },
      general: {
        color: "#000",
        lineWidth: 1,
        opacity: 0,
      },
    };
    this.getImageDataURL = useDesignStore.getState().getImageDataURL;
  }

  addData(data: AllParams) {
    this.data = { ...this.data, ...data };
  }

  getData(): ShapeDefinition {
    const d = this.data;

    const cpy: ShapeDefinition = {
      id: d.id,
      type: d.type,
      rotation: Number(d.rotation.toFixed(4)),
      size: { ...d.size },
      general: { ...d.general },
      shape: { ...d.shape },
    };

    if (d.shape?.withBorder && d.border) cpy.border = { ...d.border };
    if ((d.type === DRAWING_MODES.TEXT || d.shape?.withText) && d.text)
      cpy.text = { ...d.text };
    if (d.type === DRAWING_MODES.TEXT) {
      cpy.general.color = d.text?.color ?? "gray";
    }

    if (d.type === DRAWING_MODES.IMAGE && d.canvasImage) {
      cpy.format = d.format;

      if (d.format && d.format === "jpg") {
        cpy.dataURL = d.canvasImage.toDataURL("image/jpeg");
        const quality = 0.9;
        while (cpy.dataURL.length > 500000 && quality > 0.1) {
          cpy.dataURL = d.canvasImage.toDataURL("image/jpeg", quality);
        }
      } else {
        cpy.dataURL = d.canvasImage.toDataURL("image/png");

        if (cpy.dataURL.length > 500000) {
          cpy.dataURL = compressImage(d.canvasImage);
        }
      }
    }
    return cpy;
  }

  private getTopCornerColors(canvas: HTMLCanvasElement) {
    // get canvas context
    const ctx = canvas.getContext("2d");
    // Get the color of the top-left and top-right corners
    let topLeftColor = ctx?.getImageData(0, 0, 1, 1).data ?? null;
    let topRightColor =
      ctx?.getImageData(canvas.width - 1, 0, 1, 1).data ?? null;

    // Function to find the first non-transparent pixel diagonally
    const findFirstNonTransparentPixel = (
      startX: number,
      startY: number,
      direction: 1 | -1
    ) => {
      const middleX = canvas.width / 2;
      for (let i = 0; i < middleX; i++) {
        const color = ctx?.getImageData(
          startX + i * direction,
          startY + i,
          1,
          1
        ).data;
        if (color && color[3] !== 0) {
          // Check if the alpha channel is not transparent
          return color;
        }
      }
      return null;
    };

    if (topLeftColor && topLeftColor[3] === 0) {
      topLeftColor = findFirstNonTransparentPixel(0, 0, 1);
    }

    if (topRightColor && topRightColor[3] === 0) {
      topRightColor = findFirstNonTransparentPixel(canvas.width - 1, 0, -1);
    }

    // Function to check if the color is close to white or light gray
    const isLightColor = (color: Uint8ClampedArray | null) => {
      if (!color) return false;
      const r = color[0];
      const g = color[1];
      const b = color[2];

      if (r > 200 && g > 200 && b > 200) {
        return true;
      }
      if (r > 120 && g > 120 && b > 120) {
        const isGray =
          Math.abs(r - g) < 10 && Math.abs(r - b) < 10 && Math.abs(g - b) < 10;
        if (isGray) {
          return true;
        }
      }
      return false;
    };

    if (isLightColor(topLeftColor) && isLightColor(topRightColor)) {
      return null;
    }
    return { topLeft: topLeftColor, topRight: topRightColor } as CornerColors;
  }

  private async loadImage(id: string, dataURL: string | null | undefined) {
    try {
      if (!dataURL) {
        dataURL = this.getImageDataURL(id);
      }
      const canvas = await imageLoadInCanvas(dataURL);
      do {
        if (canvas) {
          this.data.canvasImage = canvas;
          if (this.data.shape?.transparency) {
            // Get the color of the top-left and top-right corners

            const topCornerColors = this.getTopCornerColors(canvas);

            if (topCornerColors === null) {
              this.data.canvasImageTransparent = makeWhiteTransparent(
                canvas,
                this.data.shape.transparency
              );
            } else {
              this.data.canvasImageTransparent = makeCornerTransparent(
                canvas,
                this.data.shape.transparency,
                topCornerColors
              );
            }
            this.previousTransparency = this.data.shape.transparency;
          }
        } else {
          setTimeout(() => {}, 10);
        }
      } while (canvas === null);
    } catch (error) {
      console.error("Error loading image", error);
    }
  }

  async setData(data: ShapeDefinition) {
    this.data = { ...data };

    if (!data.shape?.withBorder && data.border) {
      console.log(data.type, "withBorder error", data.border);
      this.data.border = undefined;
    }
    if (
      data.type !== DRAWING_MODES.TEXT &&
      !data.shape?.withText &&
      data.text
    ) {
      console.log(data.type, "withText error", data.text);
      this.data.text = undefined;
    }

    if (this.data.type === DRAWING_MODES.IMAGE) {
      await this.loadImage(data.id, data.dataURL);
    }

    this.calculateWithTurningButtons(data.type);
    this.data.withCornerButton = true;
  }

  setDataParams(params: Area | ParamsGeneral | ParamsShape | ParamsText) {
    this.data = { ...this.data, ...params } as ShapeDefinition;
  }

  setFormat(format: string): void {
    this.data.format = format;
  }

  setType(type: string): void {
    this.data.type = type;
    this.calculateWithTurningButtons(type);
  }
  getType() {
    return this.data.type;
  }
  setDataSize(data: Area | Coordinate): void {
    if ("width" in data && "height" in data) {
      this.data.size = { ...data };
    } else {
      this.data.size = { ...this.data.size, ...data };
    }
  }
  getDataSize(): Area {
    return { ...this.data.size };
  }
  setDataGeneral(data: ParamsGeneral): void {
    this.data.general = { ...data };
  }
  changeRotation(rotation: number): void {
    this.data.rotation = (this.data.rotation + rotation + 360) % 360;
  }
  setRotation(rotation: number): void {
    this.data.rotation = rotation;
  }
  getRotation() {
    return this.data.rotation;
  }
  setDataBorder(data: ParamsGeneral) {
    this.data.border = { ...data };
  }
  setDataShape(data: ParamsShape) {
    // console.log("setDataShape", data);
    this.data.shape = { ...data };
    if (data?.transparency && data.transparency !== this.previousTransparency) {
      this.transparencySelection(data.transparency);
    }
  }
  setDataText(data: ParamsText) {
    this.data.text = { ...data };
  }
  initData(initData: AllParams) {
    // this.data = { ...this.data, ...initData };
    this.changeData(initData);
    this.data.id = "";
    this.data.rotation = 0;
    if (this.data.text) {
      this.data.text.rotation = 0;
    }
    this.data.size.ratio = 0;

    this.data.withTurningButtons = true;
  }
  changeData(param: AllParams) {
    this.setDataGeneral(param.general);
    this.setDataBorder(param.border);
    this.setDataShape(param.shape);
    this.setDataText(param.text);

    this.data.type = param.mode;
  }

  transparencySelection(delta: number) {
    if (delta <= 0) {
      // Reset the transparency
      if (this.data.shape) {
        this.data.shape.transparency = 0;
      } else {
        this.data.shape = { transparency: 0 };
      }
      this.data.canvasImageTransparent = null;
      return true;
    }
    const canvas = this.data.canvasImage;
    if (canvas) {
      const topCornerColors = this.getTopCornerColors(canvas);

      if (topCornerColors === null) {
        this.data.canvasImageTransparent = makeWhiteTransparent(canvas, delta);
      } else {
        this.data.canvasImageTransparent = makeCornerTransparent(
          canvas,
          delta,
          topCornerColors
        );
      }
      if (this.data.shape) {
        this.data.shape.transparency = delta;
      } else {
        this.data.shape = { transparency: delta };
      }
      this.previousTransparency = delta;
      return true;
    }
    return false;
  }

  setWithTurningButtons(value: boolean) {
    this.data.withTurningButtons = value;
  }
  /**
   * Function to set if the middle button should be shown
   */
  calculateWithTurningButtons(type: string | null = null): void {
    const sSize = this.getDataSize();
    if (type === null) type = this.getType();

    // don't show the middle button if the shape is a circle without text
    if (
      type === DRAWING_MODES.CIRCLE &&
      sSize.width === sSize.height &&
      !this.data.shape?.withText
    ) {
      this.data.withTurningButtons = false;
      return;
    }
    this.data.withTurningButtons = true;
  }

  setWithCornerButton(value: boolean) {
    this.data.withCornerButton = value;
  }
  setWithAllButtons(value: boolean) {
    if (value) {
      this.calculateWithTurningButtons();
    } else {
      this.data.withTurningButtons = false;
    }
    this.data.withCornerButton = value;
  }

  setRadius(radius: number) {
    if (this.data.shape) {
      this.data.shape.radius = radius;
    } else {
      this.data.shape = { radius: radius };
    }
  }
  getOpacity() {
    return this.data.general.opacity;
  }

  setDataURL(value: string | null) {
    this.data.dataURL = value;
  }
  getCanvasImage() {
    return this.data.canvasImage;
  }
  setCanvasImage(value: HTMLCanvasElement | null) {
    this.data.canvasImage = value;
  }
  setCanvasImageTransparent(value: HTMLCanvasElement | null) {
    this.data.canvasImageTransparent = value;
  }
  setTransparency(value: number) {
    if (this.data.shape) {
      this.data.shape.transparency = value;
    } else {
      this.data.shape = { transparency: value };
    }
  }

  getDataURL() {
    return this.data.dataURL;
  }

  resizingElement(
    ctx: CanvasRenderingContext2D,
    coordinates: Coordinate,
    lockRatio: boolean,
    witchBorder: string
  ) {
    const newCoord = resizingElement(
      ctx,
      this.data.size,
      coordinates,
      lockRatio,
      witchBorder,
      this.data.rotation
    );

    if (newCoord) {
      this.draw(ctx, lockRatio, witchBorder);
      this.setDataSize(newCoord);
      this.calculateWithTurningButtons();
    }
    return newCoord;
  }

  /**
   * Function to check if the mouse is on the border of the square or on a button inside or outside the square.
   * handle special cases for the border of the square
   */
  handleMouseOnShape(
    canvas: HTMLCanvasElement | null,
    coordinate: Coordinate | null
  ): string | null {
    if (canvas === null || !coordinate) return null;

    const argsMouseOnShape: ArgsMouseOnShape = {
      coordinate: coordinate,
      area: this.getDataSize(),
      withResize: this.data.type !== DRAWING_MODES.TEXT,
      withCornerButton: this.data.withCornerButton || false,
      withTurningButtons: this.data.withTurningButtons || false,
      maxWidth: canvas.width,
      rotation: this.data.rotation,
    };

    return isOnSquareBorder(argsMouseOnShape);
  }

  /**
   * Function to draw the shape on tempory canvas with throttling
   */
  drawToTrottle(
    ctx: CanvasRenderingContext2D | null,
    data: ShapeDefinition,
    borderInfo?: string | null
  ) {
    ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    showElement(ctx, data, true, borderInfo);
  }

  showElementThrottled = throttle(this.drawToTrottle, 20);
  /**
   * Function to draw the shape on the canvas
   */
  draw(
    ctx: CanvasRenderingContext2D | null,
    temporyDraw?: boolean,
    borderInfo?: string | null
  ) {
    if (temporyDraw) {
      this.showElementThrottled(ctx, this.data, borderInfo);
    } else {
      if (ctx) ctx.globalAlpha = this.data.general.opacity;
      showElement(ctx, this.data, false, null);
    }
  }
}
