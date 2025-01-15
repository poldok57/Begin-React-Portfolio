/**
 * @module canvas-shape
 * @description
 * this interface is used to manage data of a shape or image to draw on a canvas
 */
import { Area, Coordinate, ArgsMouseOnShape } from "./types";
import {
  AllParams,
  ParamsGeneral,
  ParamsShape,
  ParamsText,
  ShapeDefinition,
  DRAWING_MODES,
  isDrawingShape,
} from "./canvas-defines";

import { CanvasDrawableObject } from "./CanvasDrawableObject";
import { CanvasShapeDraw } from "./CanvasShapeDraw";
import { isOnSquareBorder } from "@/lib/square-position";
import { imageLoadInCanvas } from "./image-load";
import { compressImage } from "./canvas-images";
import {
  makeWhiteTransparent,
  makeCornerTransparent,
  getTopCornerColors,
} from "./image-transparency";
import { useDesignStore } from "@/lib/stores/design";
import { scaledSize } from "../utils/scaledSize";
import { drawDashedRedRectangle } from "./canvas-dashed-rect";

export class CanvasShape extends CanvasDrawableObject {
  protected data: ShapeDefinition;
  private previousTransparency: number = 0;
  private getImageDataURL: (id: string) => string | null;
  private drawer: CanvasShapeDraw;

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
    this.drawer = new CanvasShapeDraw(this.data);
    this.getImageDataURL = useDesignStore.getState().getImageDataURL;
  }

  setScale(scale: number) {
    super.setScale(scale);
    this.drawer.setScale(scale);
  }

  addData(data: AllParams) {
    this.data = { ...this.data, ...data };
  }

  getData(): ShapeDefinition | null {
    const d = this.data;

    if (
      d.type === DRAWING_MODES.SELECT_AREA ||
      d.type === DRAWING_MODES.SELECT
    ) {
      return null;
    }

    const cpy: ShapeDefinition = {
      id: d.id,
      type: d.type,
      rotation: Number(d.rotation.toFixed(4)),
      size: { ...d.size },
      general: { ...d.general },
      shape: { ...d.shape },
    };

    if (d.shape?.withText && !isDrawingShape(d.type)) {
      d.shape.withText = false;
      d.text = undefined;
    }

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
        let quality = 0.9;
        while (cpy.dataURL.length > 500000 && quality > 0.1) {
          cpy.dataURL = d.canvasImage.toDataURL("image/jpeg", quality);
          quality -= 0.1;
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

  private async loadImage(id: string, dataURL: string) {
    try {
      let context = this.data.canvasImageContext;
      if (!context) {
        context = await imageLoadInCanvas(dataURL);
      }
      let i = 0;
      do {
        if (context) {
          // load the image in the main canvas
          this.setCanvasImageContext(context);
          if (this.data.shape?.transparency) {
            // Get the color of the top-left and top-right corners

            const topCornerColors = getTopCornerColors(context);

            let trCanvas = null;

            if (topCornerColors === null) {
              trCanvas = makeWhiteTransparent(
                context,
                this.data.shape.transparency
              );
            } else {
              trCanvas = makeCornerTransparent(
                context,
                this.data.shape.transparency,
                topCornerColors
              );
            }
            // save the transparency image in secondary canvas
            this.previousTransparency = this.data.shape.transparency;
            this.data.canvasImageTransparent = trCanvas;
          }
        } else {
          setTimeout(() => {}, 10);
        }
      } while (context === null && i++ < 100);
    } catch (error) {
      console.error("Error loading image", error);
    }
  }

  async setData(data: ShapeDefinition) {
    this.data = { ...data };
    // console.log("setData", data);
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
      if (!data.dataURL) {
        data.dataURL = this.getImageDataURL(data.id);
      }
      if (data.dataURL) {
        await this.loadImage(data.id, data.dataURL);
      }
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
    if (
      data?.transparency !== undefined &&
      data.transparency !== this.previousTransparency
    ) {
      this.transparencySelection(data.transparency);
    }
  }
  setDataText(data: ParamsText | undefined) {
    this.data.text = data ? { ...data } : undefined;
  }
  initData(initData: AllParams) {
    // this.data = { ...this.data, ...initData };

    // console.log("initData", initData);
    this.changeData(initData);
    this.data.id = "";
    this.data.rotation = 0;
    if (this.data.text) {
      this.data.text.rotation = 0;
    }
    this.data.size.ratio = 0;
    this.data.withTurningButtons = true;
  }
  /**
   * Function to change the data of the shape
   * @param {AllParams} param - the new data
   */
  changeData(param: AllParams) {
    const mode = param.mode;
    this.setDataGeneral(param.general);
    this.setDataBorder(param.border);
    this.setDataShape(param.shape);
    this.setDataText(
      mode === DRAWING_MODES.TEXT ||
        (isDrawingShape(mode) && param.shape?.withText)
        ? param.text
        : undefined
    );

    this.data.type = mode;
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
    const context = this.data.canvasImageContext;
    if (context) {
      const topCornerColors = getTopCornerColors(context);

      if (topCornerColors === null) {
        this.data.canvasImageTransparent = makeWhiteTransparent(context, delta);
      } else {
        this.data.canvasImageTransparent = makeCornerTransparent(
          context,
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
  setCanvasImageContext(value: CanvasRenderingContext2D | null) {
    this.data.canvasImageContext = value;
    if (value && value.canvas) {
      this.data.canvasImage = value.canvas;
    } else {
      this.data.canvasImage = null;
    }
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

  resizingArea(
    ctx: CanvasRenderingContext2D,
    coordinates: Coordinate,
    lockRatio: boolean,
    witchBorder: string
  ) {
    const newCoord = super.resizingArea(
      ctx,
      coordinates,
      lockRatio,
      witchBorder
    );

    if (newCoord) {
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
      maxWidth: canvas.width / this.scale,
      maxHeight: canvas.height / this.scale,
      rotation: this.data.rotation,
    };

    return isOnSquareBorder(argsMouseOnShape);
  }

  /**
   * Function to draw the shape on the canvas
   */
  draw(
    ctx: CanvasRenderingContext2D | null,
    temporyDraw?: boolean,
    borderInfo?: string | null
  ) {
    if (!temporyDraw && ctx) ctx.globalAlpha = this.data.general.opacity;
    this.drawer.showElement(ctx, this.data, temporyDraw, borderInfo);
  }

  hightLightDrawing(ctx: CanvasRenderingContext2D | null) {
    const size = scaledSize(this.data.size, this.scale);
    let large = 0;
    if (this.data.shape?.withBorder && this.data.border) {
      large = this.data.border.lineWidth / 2 + (this.data.border.interval || 0);
    }
    drawDashedRedRectangle(ctx, size, 0.8, this.data.rotation, large);
  }
}
