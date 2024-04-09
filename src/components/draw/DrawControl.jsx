import React, { useState } from "react";
import { MdTimeline } from "react-icons/md";
import { SlActionUndo } from "react-icons/sl";
import { BiSquare } from "react-icons/bi";

import { Button } from "../atom/Button";
import { DRAWING_MODES } from "./Draw";

export const DrawControl = ({
  setParams,
  defaultMode,
  color,
  width,
  opacity,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const handleColorChange = (event) => {
    setParams({ color: event.target.value });
  };
  const handleSizeChange = (event) => {
    setParams({ width: event.target.value });
  };
  const handleOpacityChange = (event) => {
    setParams({ opacity: event.target.value });
  };
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setParams({ mode: newMode });
  };
  const handleModeAction = (newMode) => {
    setParams({ mode: newMode });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-4">
        <Button
          selected={mode == DRAWING_MODES.DRAW}
          onClick={() => handleModeChange(DRAWING_MODES.DRAW)}
        >
          Draw
        </Button>
        <Button
          selected={mode == DRAWING_MODES.LINE}
          onClick={() => handleModeChange(DRAWING_MODES.LINE)}
        >
          <MdTimeline />
        </Button>
        <Button
          selected={mode == DRAWING_MODES.SQUARE}
          onClick={() => handleModeChange(DRAWING_MODES.SQUARE)}
        >
          <BiSquare />
        </Button>
        <Button onClick={() => handleModeAction(DRAWING_MODES.UNDO)}>
          <SlActionUndo />
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <label
          htmlFor="draw-color-picker"
          className="flex items-center justify-center gap-4"
        >
          Color
          <input
            id="draw-color-picker"
            type="color"
            defaultValue={color}
            onChange={handleColorChange}
          />
        </label>
        <label
          htmlFor="draw-size-picker"
          className="flex items-center justify-center gap-4"
        >
          Line size
          <input
            className="h-2 w-full bg-gray-300 opacity-75 outline-none transition-opacity hover:opacity-100"
            id="draw-size-picker"
            type="range"
            defaultValue={width}
            min="2"
            max="32"
            step="2"
            onChange={handleSizeChange}
            style={{ width: "100px" }}
          />
        </label>
        <label
          htmlFor="draw-opacity-picker"
          className="flex items-center justify-center gap-4"
        >
          Line opacity
          <input
            id="draw-size-picker"
            type="range"
            defaultValue={opacity}
            min="5"
            max="100"
            step="5"
            onChange={handleOpacityChange}
            style={{ width: "80px" }}
          />
        </label>
      </div>
      <div className="relative m-auto flex gap-4">
        <Button
          onClick={() => {
            handleModeAction(DRAWING_MODES.ERASE);
            setMode(DRAWING_MODES.DRAW);
            // if (canvas.current) {} canvas.current.getContext("2d").reset();
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            handleModeAction(DRAWING_MODES.UNDO);
          }}
        >
          Save my drawing
        </Button>
      </div>
    </div>
  );
};
