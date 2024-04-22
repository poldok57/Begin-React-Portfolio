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

  return (
    <div className="flex flex-row gap-4 border-2 border-secondary p-2">
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
          hidden: mode != DRAWING_MODES.SQUARE && mode != DRAWING_MODES.CIRCLE,
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
        htmlFor="draw-opacity-picker"
        className={clsx("flex items-center justify-center gap-2", {
          hidden: mode != DRAWING_MODES.SQUARE,
        })}
      >
        Radius
        <input
          id="draw-size-picker"
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
          hidden: mode != DRAWING_MODES.SQUARE && mode != DRAWING_MODES.CIRCLE,
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
  );
};
