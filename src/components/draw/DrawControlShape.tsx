import React, { useEffect, useState } from "react";
import { MdRadioButtonUnchecked } from "react-icons/md";
import { BiSquare } from "react-icons/bi";
import { AiOutlineRadiusUpright } from "react-icons/ai";
import { AiOutlineRadiusBottomright } from "react-icons/ai";
import { WiMoonFirstQuarter } from "react-icons/wi";
import { Button } from "../atom/Button";
import { RangeInput } from "../atom/RangeInput";
import ToggleSwitch from "../atom/ToggleSwitch";
import { ColorPicker } from "../atom/ColorPicker";
import { useDrawingContext } from "@/context/DrawingContext";

import {
  DRAWING_MODES,
  isDrawingSelect,
  isDrawingShape,
} from "../../lib/canvas/canvas-defines";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";

interface DrawControlShapeProps {
  isTouch?: boolean;
  buttonShapeSize?: number;
}

export const DrawControlShape: React.FC<DrawControlShapeProps> = ({
  isTouch = false,
  buttonShapeSize = 20,
}) => {
  const {
    mode,
    drawingParams,
    // addEventAction,
    handleChangeMode,
    setShapeParams,
    setBorderParams,
    setWithText,
  } = useDrawingContext();

  const paramsShape = drawingParams.shape;
  const paramsBorder = drawingParams.border;
  const [withBorder, setWithBorder] = useState(drawingParams.shape.withBorder);

  const handleWithText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWithText(event.target.checked);
    setShapeParams({ withText: event.target.checked });
  };

  useEffect(() => {
    setWithBorder(drawingParams.shape.withBorder);
  }, [drawingParams.shape.withBorder]);

  return (
    <div
      className={clsx("flex flex-col px-2 py-1 border-2 border-secondary", {
        "bg-paper": isDrawingShape(mode),
      })}
    >
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-2">
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.CIRCLE}
            onClick={() => handleChangeMode(DRAWING_MODES.CIRCLE)}
          >
            <MdRadioButtonUnchecked size="20px" />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.SQUARE}
            onClick={() => handleChangeMode(DRAWING_MODES.SQUARE)}
          >
            <BiSquare size={buttonShapeSize} />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.ONE_RADIUS_T}
            onClick={() => handleChangeMode(DRAWING_MODES.ONE_RADIUS_T)}
          >
            <AiOutlineRadiusUpright size={buttonShapeSize} />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.ONE_RADIUS_B}
            onClick={() => handleChangeMode(DRAWING_MODES.ONE_RADIUS_B)}
          >
            <AiOutlineRadiusBottomright size={buttonShapeSize} />
          </Button>
          <Button
            className="py-1"
            selected={mode == DRAWING_MODES.TWO_RADIUS}
            onClick={() => handleChangeMode(DRAWING_MODES.TWO_RADIUS)}
          >
            <WiMoonFirstQuarter size={buttonShapeSize} />
          </Button>
        </div>
        <div className="flex flex-row gap-5">
          {/* <label
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
              defaultChecked={drawingParams.general.filled}
              onChange={(event) =>
                handleGeneral({ filled: event.target.checked })
              }
            />
          </label> */}
          {mode !== DRAWING_MODES.CIRCLE && (
            <RangeInput
              className={inputRangeVariants({ width: "16", size: "xs" })}
              id="draw-radius-picker"
              label="Radius"
              value={paramsShape.radius || 0}
              min="0"
              max="50"
              step="2"
              onChange={(value) => setShapeParams({ radius: value })}
              isTouch={isTouch}
            />
          )}
          <label
            htmlFor="toggle-text"
            className={clsx(
              "flex flex-col justify-center items-center font-bold text-nowrap",
              {
                hidden: !isDrawingShape(mode),
              }
            )}
          >
            With Text
            <ToggleSwitch
              id="toggle-text"
              defaultChecked={paramsShape.withText}
              onChange={(event) => handleWithText(event)}
            />
          </label>
        </div>
      </div>
      <div
        className={clsx("mt-1 flex flex-row border-secondary px-2", {
          hidden: !isDrawingShape(mode) && !isDrawingSelect(mode),
          "bg-paper": isDrawingSelect(mode),
          "gap-4": isTouch,
        })}
      >
        <label
          htmlFor="toggle-border"
          className="flex flex-col gap-2 justify-center items-center p-2 text-sm font-bold"
        >
          Border
          <ToggleSwitch
            id="toggle-border"
            defaultChecked={paramsShape.withBorder}
            onChange={(event) => {
              setShapeParams({ withBorder: event.target.checked });
              setWithBorder(event.target.checked);
            }}
          />
        </label>
        <div
          className={clsx(
            "flex flex-row gap-5 justify-between p-1 ml-3 w-full border border-secondary border-opacity-15",
            {
              hidden: !withBorder,
              "gap-6": isTouch,
            }
          )}
        >
          <label
            htmlFor="border-color-picker"
            className="flex flex-col gap-1 justify-center items-center text-sm"
          >
            color
            <ColorPicker
              id="border-color-picker"
              defaultValue={paramsBorder.color}
              onChange={(color) => setBorderParams({ color: color })}
            />
          </label>
          <RangeInput
            className={inputRangeVariants({ width: "10", size: "xs" })}
            id="border-size-picker"
            label="Width"
            value={paramsBorder.lineWidth}
            min="0.5"
            max="20"
            step="0.5"
            onChange={(value) => setBorderParams({ lineWidth: value })}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
          <RangeInput
            className={inputRangeVariants({ width: "10", size: "xs" })}
            id="border-interval-picker"
            label="Interval"
            value={paramsBorder.interval || 0}
            min="0"
            max="20"
            step="1"
            onChange={(value) => setBorderParams({ interval: value })}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
          <RangeInput
            className={inputRangeVariants({ width: "8", size: "xs" })}
            id="border-opacity-picker"
            label="Opacity"
            value={paramsBorder.opacity * 100}
            min="0"
            max="100"
            step="10"
            onChange={(value) => setBorderParams({ opacity: value / 100 })}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
        </div>
      </div>
    </div>
  );
};
