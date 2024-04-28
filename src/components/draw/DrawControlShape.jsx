import { MdRadioButtonUnchecked } from "react-icons/md";

import { BiSquare } from "react-icons/bi";
import { Button } from "../atom/Button";
import ToggleSwitch from "../atom/ToggleSwitch";
import { DRAWING_MODES } from "./Draw";
import clsx from "clsx";

export const DrawControlShape = ({
  mode,
  drawingParams,
  handleParamChange,
  handleModeChange,
  setWithText,
}) => {
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
        "bg-paper":
          mode === DRAWING_MODES.CIRCLE || mode === DRAWING_MODES.SQUARE,
      })}
    >
      <div className="flex flex-row gap-4">
        <Button
          selected={mode == DRAWING_MODES.CIRCLE}
          onClick={() => handleModeChange(DRAWING_MODES.CIRCLE)}
        >
          <MdRadioButtonUnchecked />
        </Button>
        <Button
          selected={mode == DRAWING_MODES.SQUARE}
          onClick={() => handleModeChange(DRAWING_MODES.SQUARE)}
        >
          <BiSquare />
        </Button>

        <label
          htmlFor="toggle-filled"
          className={clsx("flex items-center justify-center gap-2", {
            hidden:
              mode != DRAWING_MODES.SQUARE && mode != DRAWING_MODES.CIRCLE,
          })}
        >
          <ToggleSwitch
            id="toggle-filled"
            defaultChecked={drawingParams.shape.filled}
            onChange={(event) => handleShape({ filled: event.target.checked })}
          />
          Filled
        </label>
        <label
          htmlFor="draw-radius-picker"
          className={clsx("flex items-center justify-center gap-2", {
            hidden: mode != DRAWING_MODES.SQUARE,
          })}
        >
          Radius
          <input
            className="h-2 w-16 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
            id="draw-radius-picker"
            type="range"
            defaultValue={drawingParams.shape.radius}
            min="0"
            max="50"
            step="1"
            onChange={(event) => handleShape({ radius: event.target.value })}
          />
        </label>
        <label
          htmlFor="toggle-text"
          className={clsx("flex items-center justify-center gap-2", {
            hidden:
              mode != DRAWING_MODES.SQUARE && mode != DRAWING_MODES.CIRCLE,
          })}
        >
          <ToggleSwitch
            id="toggle-text"
            defaultChecked={drawingParams.shape.withText}
            onChange={(event) => handleWithText(event)}
          />
          With Text
        </label>
      </div>
      <div
        className={clsx("flex flex-row gap-4 p-2", {
          hidden: mode != DRAWING_MODES.SQUARE && mode != DRAWING_MODES.CIRCLE,
        })}
      >
        <label
          htmlFor="toggle-border"
          className="flex items-center justify-center gap-2"
        >
          <ToggleSwitch
            id="toggle-Border"
            defaultChecked={drawingParams.shape.withBorder}
            onChange={(event) =>
              handleShape({ withBorder: event.target.checked })
            }
          />
          Border
        </label>
        <label
          htmlFor="border-color-picker"
          className="flex items-center justify-center gap-4"
        >
          border color :
          <input
            id="border-color-picker"
            type="color"
            defaultValue={drawingParams.border.color}
            onChange={(e) => handleBorder({ color: e.target.value })}
          />
        </label>
        <label
          htmlFor="border-size-picker"
          className="flex items-center justify-center gap-2"
        >
          size
          <input
            className="h-2 w-12 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
            id="border-size-picker"
            type="range"
            defaultValue={drawingParams.border.width}
            min="1"
            max="20"
            step="0.5"
            onChange={(e) => handleBorder({ width: e.target.value })}
            style={{ width: "50px" }}
          />
        </label>
        <label
          htmlFor="border-interval-picker"
          className="flex items-center justify-center gap-2"
        >
          Interval
          <input
            className="h-2 w-12 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
            id="border-interval-picker"
            type="range"
            defaultValue={drawingParams.border.interval}
            min="0"
            max="30"
            step="1"
            onChange={(e) => handleBorder({ interval: e.target.value })}
            style={{ width: "50px" }}
          />
        </label>
      </div>
    </div>
  );
};
