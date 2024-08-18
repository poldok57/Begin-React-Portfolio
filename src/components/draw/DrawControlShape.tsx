import React, { useState } from "react";
import { MdRadioButtonUnchecked } from "react-icons/md";
import { BiSquare } from "react-icons/bi";
import { AiOutlineRadiusUpright } from "react-icons/ai";
import { AiOutlineRadiusBottomright } from "react-icons/ai";
import { WiMoonFirstQuarter } from "react-icons/wi";
import { Button } from "../atom/Button";
import { RangeInput } from "../atom/RangeInput";
import ToggleSwitch from "../atom/ToggleSwitch";

import {
  DRAWING_MODES,
  isDrawingSelect,
  isDrawingShape,
  Params,
  GroupParams,
  AllParams,
} from "../../lib/canvas/canvas-defines";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";

interface DrawControlShapeProps {
  mode: string;
  drawingParams: AllParams;
  handleParamChange: (params: GroupParams) => void;
  handleModeChange: (mode: string) => void;
  handleChangeRadius: (value: number) => void;
  setWithText: (value: boolean) => void;
  isTouch?: boolean;
}

export const DrawControlShape: React.FC<DrawControlShapeProps> = ({
  mode,
  drawingParams,
  handleParamChange,
  handleModeChange,
  handleChangeRadius,
  setWithText,
  isTouch = false,
}) => {
  const [withBorder, setWithBorder] = useState(drawingParams.shape.withBorder);
  const handleShape = (param: Params) => {
    drawingParams.shape = { ...drawingParams.shape, ...param };
    handleParamChange({ shape: drawingParams.shape });
  };
  const handleBorder = (param: Params) => {
    drawingParams.border = { ...drawingParams.border, ...param };
    handleParamChange({ border: drawingParams.border });
  };
  const handleWithText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWithText(event.target.checked);
    handleShape({ withText: event.target.checked });
  };

  return (
    <div
      className={clsx("flex flex-col p-2 border-2 border-secondary", {
        "bg-paper": isDrawingShape(mode),
      })}
    >
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-2">
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.CIRCLE}
            onClick={() => handleModeChange(DRAWING_MODES.CIRCLE)}
          >
            <MdRadioButtonUnchecked size="20px" />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.SQUARE}
            onClick={() => handleModeChange(DRAWING_MODES.SQUARE)}
          >
            <BiSquare size="20px" />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.ONE_RADIUS_T}
            onClick={() => handleModeChange(DRAWING_MODES.ONE_RADIUS_T)}
          >
            <AiOutlineRadiusUpright size="20px" />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.ONE_RADIUS_B}
            onClick={() => handleModeChange(DRAWING_MODES.ONE_RADIUS_B)}
          >
            <AiOutlineRadiusBottomright size="20px" />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.TWO_RADIUS}
            onClick={() => handleModeChange(DRAWING_MODES.TWO_RADIUS)}
          >
            <WiMoonFirstQuarter size="20px" />
          </Button>
        </div>
        <div className="flex flex-row gap-5">
          <label
            htmlFor="toggle-filled"
            className={clsx(
              "flex flex-col justify-center items-center font-bold",
              {
                hidden: !isDrawingShape(mode),
              }
            )}
          >
            Filled
            <ToggleSwitch
              id="toggle-filled"
              defaultChecked={drawingParams.shape.filled}
              onChange={(event) =>
                handleShape({ filled: event.target.checked })
              }
            />
          </label>
          <RangeInput
            className={inputRangeVariants({ width: "16", size: "xs" })}
            id="draw-radius-picker"
            label="Radius"
            value={drawingParams.shape.radius}
            min="0"
            max="50"
            step="2"
            onChange={(value) => handleChangeRadius(value)}
            isTouch={isTouch}
          />
          <label
            htmlFor="toggle-text"
            className={clsx(
              "flex flex-col justify-center items-center font-bold",
              {
                hidden: !isDrawingShape(mode),
              }
            )}
          >
            With Text
            <ToggleSwitch
              id="toggle-text"
              defaultChecked={drawingParams.shape.withText}
              onChange={(event) => handleWithText(event)}
            />
          </label>
        </div>
      </div>
      <div
        className={clsx("mt-1 flex flex-row  border-t border-secondary p-2", {
          hidden: !isDrawingShape(mode) && !isDrawingSelect(mode),
          "bg-paper": isDrawingSelect(mode),
          "gap-4": isTouch,
        })}
      >
        <label
          htmlFor="toggle-border"
          className="flex flex-col justify-center items-center font-bold"
        >
          Border
          <ToggleSwitch
            id="toggle-border"
            defaultChecked={drawingParams.shape.withBorder}
            onChange={(event) => {
              handleShape({ withBorder: event.target.checked });
              setWithBorder(event.target.checked);
            }}
          />
        </label>
        <div className={clsx("flex flex-row gap-5", { hidden: !withBorder })}>
          <label
            htmlFor="border-color-picker"
            className="flex gap-2 justify-center items-center"
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
            className={inputRangeVariants({ width: "10", size: "xs" })}
            id="border-size-picker"
            label="Width"
            value={drawingParams.border.lineWidth}
            min="0.5"
            max="20"
            step="0.5"
            onChange={(value) => handleBorder({ lineWidth: value })}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
          <RangeInput
            className={inputRangeVariants({ width: "10", size: "xs" })}
            id="border-interval-picker"
            label="Interval"
            value={drawingParams.border.interval || 0}
            min="0"
            max="20"
            step="1"
            onChange={(value) => handleBorder({ interval: value })}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
          <RangeInput
            className={inputRangeVariants({ width: "8", size: "xs" })}
            id="border-opacity-picker"
            label="Opacity"
            value={drawingParams.border.opacity * 100}
            min="0"
            max="100"
            step="10"
            onChange={(value) => handleBorder({ opacity: value / 100 })}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
        </div>
      </div>
    </div>
  );
};
