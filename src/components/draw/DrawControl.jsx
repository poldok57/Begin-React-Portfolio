import React, { useState } from "react";
import { MdTimeline } from "react-icons/md";
// import { MdRadioButtonUnchecked } from "react-icons/md";
import { SlActionUndo } from "react-icons/sl";

import { Button } from "../atom/Button";
import { DRAWING_MODES } from "./Draw";
import { DrawControlText } from "./DrawControlText";
import { DrawControlShape } from "./DrawControlShape";
import { DrawControlLine } from "./DrawControlLine";

// import clsx from "clsx";

export const DrawControl = ({
  setParams,
  changeMode,
  defaultMode,
  drawingParams,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [withText, setWithText] = useState(false);

  const addEventChangeMode = (mode) => {
    const event = new CustomEvent("modeChanged", { detail: { mode } });
    document.dispatchEvent(event);
  };
  const handleParamChange = (newParams) => {
    setParams(newParams);
    addEventChangeMode(DRAWING_MODES.DRAWING_CHANGE);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    changeMode(newMode);
    addEventChangeMode(newMode);
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
          selected={mode == DRAWING_MODES.TEXT}
          onClick={() => handleModeChange(DRAWING_MODES.TEXT)}
        >
          Text
        </Button>
      </div>
      <DrawControlLine
        handleParamChange={handleParamChange}
        drawingParams={drawingParams}
      />
      <DrawControlShape
        mode={mode}
        drawingParams={drawingParams}
        handleParamChange={handleParamChange}
        handleModeChange={handleModeChange}
        setWithText={setWithText}
      />
      <DrawControlText
        mode={mode}
        hidden={mode != DRAWING_MODES.TEXT && withText === false}
        drawingParams={drawingParams}
        handleTextParams={handleParamChange}
      />

      <div className="relative m-auto flex gap-4">
        <Button onClick={() => changeMode(DRAWING_MODES.UNDO)}>
          <SlActionUndo />
        </Button>
        <Button
          onClick={() => {
            changeMode(DRAWING_MODES.ERASE);
            setMode(DRAWING_MODES.DRAW);
            // if (canvas.current) {} canvas.current.getContext("2d").reset();
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            changeMode(DRAWING_MODES.SAVE);
          }}
        >
          Save my drawing
        </Button>
      </div>
    </div>
  );
};
