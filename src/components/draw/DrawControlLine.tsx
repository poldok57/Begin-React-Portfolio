import React from "react";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";

import {
  AllParams,
  DRAWING_MODES,
  GroupParams,
  isDrawingAllLines,
  isDrawingSelect,
  Params,
} from "../../lib/canvas/canvas-defines";
import { ColorPicker } from "../atom/ColorPicker";

interface DrawControlLineProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  drawingParams: AllParams;
  opacity: number;
  setOpacity: (opacity: number) => void;
}

export const DrawControlLine: React.FC<DrawControlLineProps> = ({
  mode,
  handleParamChange,
  drawingParams,
  opacity,
  setOpacity,
}) => {
  const handleGeneral = (param: Params) => {
    drawingParams.general = { ...drawingParams.general, ...param };
    handleParamChange({ general: drawingParams.general });
  };
  return (
    <div
      className={clsx("flex flex-row gap-4 border border-secondary p-2", {
        "bg-paper": isDrawingAllLines(mode) || mode === DRAWING_MODES.IMAGE,
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
          height={40}
          width={40}
          defaultValue={drawingParams.general.color}
          onChange={(color) => handleGeneral({ color: color })}
        />
      </label>
      <label
        htmlFor="draw-size-picker"
        className={clsx(
          "flex flex-col items-center justify-center gap-1 whitespace-nowrap",
          { hidden: isDrawingSelect(mode) }
        )}
      >
        Line width
        <input
          className={inputRangeVariants({ width: "24", size: "sm" })}
          id="draw-size-picker"
          type="range"
          defaultValue={drawingParams.general.lineWidth}
          min="2"
          max="32"
          step="2"
          onChange={(event) => handleGeneral({ lineWidth: event.target.value })}
        />
      </label>
      <label
        htmlFor="draw-opacity-picker"
        className={clsx("flex flex-col items-center justify-center gap-1", {
          hidden: mode === DRAWING_MODES.SELECT,
        })}
      >
        Opacity
        <input
          className={inputRangeVariants({ width: "20", size: "sm" })}
          id="draw-size-picker"
          type="range"
          value={opacity}
          min="5"
          max="100"
          step="5"
          onChange={(event) => setOpacity(Number(event.target.value))}
        />
      </label>
    </div>
  );
};
