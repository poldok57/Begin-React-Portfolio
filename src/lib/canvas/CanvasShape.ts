/**
 * @module canvas-shape
 * @description
 * this interface is used to draw shapes on a canvas
 */
import { Area } from "./types";
import {
  AllParams,
  ParamsGeneral,
  ParamsShape,
  ParamsText,
  ShapeDefinition,
} from "./canvas-defines";
import { CanvasDrawableObject } from "./CanvasDrawableObject";

export class CanvasShape extends CanvasDrawableObject {
  protected data: ShapeDefinition;

  constructor() {
    super();
    this.data = {
      type: "",
      rotation: 0,
      size: { x: 0, y: 0, width: 0, height: 0 },
      general: {
        color: "#000",
        lineWidth: 1,
        opacity: 1,
      },
    };
  }

  addData(data: AllParams) {
    this.data = { ...this.data, ...data };
  }
  setDataSize(data: Area): void {
    this.data.size = { ...data };
  }
  setDataGeneral(data: ParamsGeneral): void {
    this.data.general = { ...data };
  }
  changeRotation(rotation: number): void {
    this.data.rotation += rotation;
  }
  setRotation(rotation: number): void {
    this.data.rotation = rotation;
  }
  setDataBorder(data: ParamsGeneral) {
    this.data.border = { ...data };
  }
  setDataShape(data: ParamsShape) {
    this.data.shape = { ...data };
  }
  setDataText(data: ParamsText) {
    this.data.text = { ...data };
  }
  initData(initData: AllParams) {
    this.data = { ...this.data, ...initData };
    this.changeData(initData);
    this.data.rotation = 0;
    if (this.data.text) {
      this.data.text.rotation = 0;
    }
    this.data.size.ratio = 0;
  }
  changeData(param: AllParams) {
    this.setDataGeneral(param.general);
    this.setDataBorder(param.border);
    this.setDataShape(param.shape);
    this.setDataText(param.text);

    this.data.type = param.mode;
  }

  draw(
    ctx: CanvasRenderingContext2D | null,
    withBorder?: boolean,
    borderInfo?: string | null
  ) {}
}
