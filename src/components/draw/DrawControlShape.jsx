import { useState } from "react";
import { MdRadioButtonUnchecked } from "react-icons/md";
import { BiSquare } from "react-icons/bi";
import { AiOutlineRadiusUpright } from "react-icons/ai";
import { AiOutlineRadiusBottomright } from "react-icons/ai";
import { WiMoonFirstQuarter } from "react-icons/wi";
import { Button } from "../atom/Button";
import ToggleSwitch from "../atom/ToggleSwitch";
import {
  DRAWING_MODES,
  isDrawingShape,
  isDrawingSquare,
} from "../../lib/canvas/canvas-defines";
import clsx from "clsx";

export const DrawControlShape = ({
  mode,
  drawingParams,
  handleParamChange,
  handleModeChange,
  setWithText,
}) => {
  const [withBorder, setWithBorder] = useState(drawingParams.shape.withBorder);
  const handleShape = (param) => {
    drawingParams.shape = { ...drawingParams.shape, ...param };
    handleParamChange({ shape: drawingParams.shape });
  };
  const handleBorder = (param) => {
    drawingParams.border = { ...drawingParams.border, ...param };
    handleParamChange({ border: drawingParams.border });
  };
  const handleWithText = (event) => {
    setWithText(event.target.checked);
    handleShape({ withText: event.target.checked });
  };

  return (
    <div
      className={clsx("flex flex-col border-2 border-secondary p-2", {
        "bg-paper": isDrawingShape(mode),
      })}
    >
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-1">
          <Button
            className="px-2 py-1"
            selected={mode == DRAWING_MODES.CIRCLE}
            onClick={() => handleModeChange(DRAWING_MODES.CIRCLE)}
          >
            <MdRadioButtonUnchecked size="20px" />
          </Button>
          <Button
            className="px-2 py-1"
            selected={mode == DRAWING_MODES.SQUARE}
            onClick={() => handleModeChange(DRAWING_MODES.SQUARE)}
          >
            <BiSquare size="20px" />
          </Button>
          <Button
            className="px-2 py-1"
            selected={mode == DRAWING_MODES.ONE_RADIUS_T}
            onClick={() => handleModeChange(DRAWING_MODES.ONE_RADIUS_T)}
          >
            <AiOutlineRadiusUpright size="20px" />
          </Button>
          <Button
            className="px-2 py-1"
            selected={mode == DRAWING_MODES.ONE_RADIUS_B}
            onClick={() => handleModeChange(DRAWING_MODES.ONE_RADIUS_B)}
          >
            <AiOutlineRadiusBottomright size="20px" />
          </Button>
          <Button
            className="px-2 py-1"
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
              "flex flex-col items-center justify-center font-bold",
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
          <label
            htmlFor="draw-radius-picker"
            className={clsx("flex flex-col items-center justify-center gap-2", {
              hidden: !isDrawingSquare(mode),
            })}
          >
            Radius
            <input
              className="h-2 w-12 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
              id="draw-radius-picker"
              type="range"
              defaultValue={drawingParams.shape.radius}
              min="0"
              max="50"
              step="1"
              onChange={(event) =>
                handleShape({ radius: parseInt(event.target.value) })
              }
            />
          </label>
          <label
            htmlFor="toggle-text"
            className={clsx(
              "flex flex-col items-center justify-center font-bold",
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
          hidden: !isDrawingShape(mode),
        })}
      >
        <label
          htmlFor="toggle-border"
          className="flex flex-col items-center justify-center font-bold"
        >
          Border
          <ToggleSwitch
            id="toggle-Border"
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
            className="flex items-center justify-center gap-2"
          >
            color
            <input
              id="border-color-picker"
              type="color"
              defaultValue={drawingParams.border.color}
              onChange={(e) => handleBorder({ color: e.target.value })}
            />
          </label>
          <label
            htmlFor="border-size-picker"
            className="flex flex-col items-center justify-center gap-1"
          >
            width
            <input
              className="h-2 w-10 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
              id="border-size-picker"
              type="range"
              defaultValue={drawingParams.border.lineWidth}
              min="1"
              max="20"
              step="0.5"
              onChange={(e) =>
                handleBorder({ lineWidth: parseFloat(e.target.value) })
              }
              style={{ width: "50px" }}
            />
          </label>
          <label
            htmlFor="border-interval-picker"
            className="flex flex-col items-center justify-center gap-1"
          >
            Interval
            <input
              className="h-2 w-10 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
              id="border-interval-picker"
              type="range"
              defaultValue={drawingParams.border.interval}
              min="0"
              max="20"
              step="1"
              onChange={(e) =>
                handleBorder({ interval: parseInt(e.target.value) })
              }
              style={{ width: "50px" }}
            />
          </label>
          <label
            htmlFor="border-opacity-picker"
            className="flex flex-col items-center justify-center gap-2"
          >
            Opacity
            <input
              className="h-2 w-8 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
              id="border-opacity-picker"
              type="range"
              defaultValue={drawingParams.border.opacity * 100}
              min="0"
              max="100"
              step="10"
              onChange={(e) =>
                handleBorder({ opacity: parseInt(e.target.value) / 100 })
              }
              style={{ width: "50px" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
