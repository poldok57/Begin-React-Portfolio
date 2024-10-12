import React from "react";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";
import { RangeInput } from "../atom/RangeInput";
import { ColorPicker } from "../atom/ColorPicker";
import {
  AllParams,
  DRAWING_MODES,
  GroupParams,
  isDrawingAllLines,
  isDrawingSelect,
  Params,
} from "@/lib/canvas/canvas-defines";

interface DrawControlBasicProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  drawingParams: AllParams;
  opacity: number;
  setOpacity: (opacity: number) => void;
  isTouch?: boolean;
}

export const DrawControlBasic: React.FC<DrawControlBasicProps> = ({
  mode,
  handleParamChange,
  drawingParams,
  opacity,
  setOpacity,
  isTouch = false,
}) => {
  const handleGeneral = (param: Params) => {
    drawingParams.general = { ...drawingParams.general, ...param };
    handleParamChange({ general: drawingParams.general });
  };
  return (
    <>
      <div
        className={clsx("flex flex-row gap-4 border border-secondary p-2", {
          "bg-paper": isDrawingAllLines(mode) || mode === DRAWING_MODES.IMAGE,
          "gap-8": isTouch,
          hidden: mode === DRAWING_MODES.TEXT,
        })}
      >
        <label
          htmlFor="draw-color-picker"
          className={clsx("flex items-center justify-center gap-3", {
            hidden: isDrawingSelect(mode) || mode === DRAWING_MODES.ERASE,
          })}
        >
          Color
          <ColorPicker
            className="my-0"
            id="draw-color-picker"
            height={isTouch ? 50 : 40}
            width={isTouch ? 50 : 40}
            defaultValue={drawingParams.general.color}
            onChange={(color) => handleGeneral({ color: color })}
          />
        </label>
        <RangeInput
          id="draw-size-picker"
          label="Line width"
          className={inputRangeVariants({ width: "24", size: "sm" })}
          value={drawingParams.general.lineWidth}
          onChange={(value: number) => handleGeneral({ lineWidth: value })}
          min="2"
          max="32"
          step="2"
          isTouch={isTouch}
        />
        <RangeInput
          className={inputRangeVariants({ width: "20", size: "sm" })}
          label="Opacity"
          id="draw-size-picker"
          value={opacity}
          min="5"
          max="100"
          step="5"
          onChange={(value: number) => setOpacity(value)}
          isTouch={isTouch}
        />
      </div>
    </>
  );
};
