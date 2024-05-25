// import { useRef, useMemo, useState } from "react";
import clsx from "clsx";
import { Button } from "../atom/Button";
import {
  DRAWING_MODES,
  isDrawingSelect,
} from "../../lib/canvas/canvas-defines";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";

// import clsx from "clsx";

export const DrawControlSelect = ({
  mode,
  changeMode,
  setMode,
  handleChangeRatio,
  addEvent,
}) => {
  const addEventChangeMode = (mode) => {
    addEvent({ detail: { mode } });
  };
  const addEventSaveFile = (mode, filename, name = null) => {
    addEvent({ detail: { mode, filename, name } });
  };

  const handleImage = (value) => {
    changeMode(DRAWING_MODES.IMAGE);
    setMode(DRAWING_MODES.IMAGE);
    addEventChangeMode(value);
  };
  const handleTransparency = (value) => {
    addEvent({
      detail: { mode: DRAWING_MODES.TRANSPARENCY, value },
    });
  };
  const handleRadius = (value) => {
    addEvent({ detail: { mode: DRAWING_MODES.IMAGE_RADIUS, value } });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addEventSaveFile(DRAWING_MODES.LOAD, url, file.name);
      handleChangeRatio(true);
      setMode(DRAWING_MODES.IMAGE);
    }
  };

  return (
    <div
      className={clsx("flex flex-col border-2 border-secondary p-2", {
        "bg-paper": isDrawingSelect(mode),
        hidden: !isDrawingSelect(mode),
      })}
    >
      <div className="flex flex-row gap-3">
        <Button
          className="px-2 py-1"
          title="Ctrl+C"
          selected={mode === DRAWING_MODES.COPY}
          onClick={() => handleImage(DRAWING_MODES.COPY)}
        >
          Copy
        </Button>
        <Button
          className="px-2 py-1"
          title="Ctrl+V"
          selected={mode === DRAWING_MODES.PASTE}
          onClick={() => handleImage(DRAWING_MODES.PASTE)}
        >
          Paste
        </Button>
        <Button
          className="px-2 py-1"
          title="Ctrl+X"
          onClick={() => handleImage(DRAWING_MODES.CUT)}
        >
          Cut
        </Button>
        <ButtonConfirmModal
          className="z-10 bg-blue-500 px-2"
          value="Upload image"
          width="380px"
          showUnder={false}
        >
          <div className="flex flex-row">Select a file to upload :</div>
          <input
            className="ronded-md my-2 h-8 border-2 border-gray-500 bg-white px-2"
            type="file"
            onChange={handleFileChange}
          />
        </ButtonConfirmModal>
        <label
          className={clsx("flex flex-col items-center justify-center gap-1", {
            hidden: mode !== DRAWING_MODES.IMAGE,
          })}
          htmlFor="transparency-picker"
        >
          Transparency
          <input
            className="h-2 w-24 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
            id="transparency-picker"
            type="range"
            defaultValue={0}
            min="0"
            max="100"
            step="5"
            onChange={(event) => handleTransparency(event.target.value)}
          />
        </label>

        <label
          htmlFor="select-radius-picker"
          className={clsx("flex flex-col items-center justify-center gap-1", {
            hidden: mode !== DRAWING_MODES.IMAGE,
          })}
        >
          Radius image
          <input
            className="h-2 w-20 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
            id="select-radius-picker"
            type="range"
            defaultValue={0}
            min="0"
            max="50"
            step="1"
            onChange={(event) => handleRadius(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
};
