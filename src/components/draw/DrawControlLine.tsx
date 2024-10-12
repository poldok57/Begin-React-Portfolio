import React, { useState } from "react";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";
import { RangeInput } from "../atom/RangeInput";
import { Button } from "../atom/Button";
import { ColorPicker } from "../atom/ColorPicker";
import { ToggleSwitch } from "../atom/ToggleSwitch";
import {
  AllParams,
  DRAWING_MODES,
  GroupParams,
  isDrawingAllLines,
  isDrawingSelect,
  Params,
} from "@/lib/canvas/canvas-defines";
import { Shapes } from "lucide-react";

interface DrawControlLineProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  handleModeChange: (mode: string) => void;
  addEventAction: (action: string) => void;
  drawingParams: AllParams;
  opacity: number;
  setOpacity: (opacity: number) => void;
  isTouch?: boolean;
}

export const DrawControlLine: React.FC<DrawControlLineProps> = ({
  mode,
  handleParamChange,
  handleModeChange,
  addEventAction,
  drawingParams,
  opacity,
  setOpacity,
  isTouch = false,
}) => {
  const [withPathFilled, setWithPathFilled] = useState(false);
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
      <div
        className={clsx("flex flex-row gap-4 border border-secondary p-2", {
          "bg-paper": isDrawingAllLines(mode) || mode === DRAWING_MODES.IMAGE,
          "gap-8": isTouch,
          hidden: mode === DRAWING_MODES.TEXT,
        })}
      >
        <Button
          onClick={() => handleModeChange(DRAWING_MODES.PATH)}
          className="px-5"
          title="Start path"
        >
          <Shapes />
        </Button>
        <Button
          onClick={() => addEventAction(DRAWING_MODES.CLOSE_PATH)}
          className="w-20 h-8"
          title="Close path"
        >
          Close path
        </Button>
        <label
          htmlFor="toggle-border"
          className="flex flex-col gap-2 justify-center items-center p-2 text-sm font-bold"
        >
          Border
          <ToggleSwitch
            id="toggle-border"
            defaultChecked={drawingParams.shape.withBorder}
            onChange={(event) => {
              setWithPathFilled(event.target.checked);
            }}
          />
        </label>
        {withPathFilled && (
          <>
            <label
              htmlFor="border-color-picker"
              className="flex flex-col gap-1 justify-center items-center text-sm"
            >
              color
              <input
                id="border-color-picker"
                type="color"
                defaultValue={drawingParams.border.color}
                onChange={(e) => handleBorder({ color: e.target.value })}
              />
            </label>
            <RangeInput
              className={inputRangeVariants({ width: "8", size: "xs" })}
              id="border-opacity-picker"
              label="Opacity"
              value={drawingParams.border.opacity * 100}
              min="0"
              max="100"
              step="10"
              onChange={(value: number) => {
                handleGeneral({ opacity: value / 100 });
              }}
              // onChange={(value) => handleBorder({ opacity: value / 100 })}
              style={{ width: "50px" }}
              isTouch={isTouch}
            />
          </>
        )}
      </div>
    </>
  );
};
