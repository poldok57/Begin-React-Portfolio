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
  const handleRadiusChange = (event) => {
    handleParamChange({ radius: event.target.value });
  };
  const handleFilled = (event) => {
    handleParamChange({ filled: event.target.checked });
  };
  const handleWithText = (event) => {
    setWithText(event.target.checked);
    handleParamChange({ withText: event.target.checked });
  };
  const handleWithBorder = (event) => {
    handleParamChange({ withBorder: event.target.checked });
  };
  const handleBorder = (param) => {
    drawingParams.border = { ...drawingParams.border, ...param };
    handleParamChange({ border: drawingParams.border });
  };

  return (
    <div className="flex flex-col border-2 border-secondary p-2">
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
            defaultChecked={drawingParams.filled}
            onChange={(event) => handleFilled(event)}
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
            id="draw-radius-picker"
            type="range"
            defaultValue={drawingParams.radius}
            min="0"
            max="50"
            step="1"
            onChange={handleRadiusChange}
            style={{ width: "60px" }}
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
            defaultChecked={drawingParams.withText}
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
            defaultChecked={drawingParams.withBorder}
            onChange={(event) => handleWithBorder(event)}
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
