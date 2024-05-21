import { useRef, useMemo, useState } from "react";
import { withMousePosition } from "../../hooks/withMousePosition";
import { MdTimeline } from "react-icons/md";
// import { MdRadioButtonUnchecked } from "react-icons/md";
import { SlActionUndo } from "react-icons/sl";
import { AiOutlineLoading } from "react-icons/ai";
import { CiEraser } from "react-icons/ci";
import { PiSelectionPlusLight } from "react-icons/pi";
import clsx from "clsx";

import { Button } from "../atom/Button";
import {
  DRAWING_MODES,
  isDrawingSelect,
} from "../../lib/canvas/canvas-defines";
import { DrawControlText } from "./DrawControlText";
import { DrawControlShape } from "./DrawControlShape";
import { DrawControlLine } from "./DrawControlLine";
import { eraseHistory } from "../../lib/canvas/canvas-history";

import { alertMessage } from "../../hooks/alertMessage";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";

// import clsx from "clsx";

export const DrawControl = ({
  setParams,
  changeMode,
  defaultMode,
  drawingParams,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [withText, setWithText] = useState(false);

  const filenameRef = useRef(null);
  const defaultFilename = useRef("my-drawing");

  const addEvent = (detail) => {
    const event = new CustomEvent("modeChanged", detail);
    document.dispatchEvent(event);
  };
  const addEventChangeMode = (mode) => {
    addEvent({ detail: { mode } });
  };
  const addEventSaveFile = (filename) => {
    addEvent({ detail: { mode: DRAWING_MODES.SAVE, filename } });
  };

  const handleConfirmReset = () => {
    alertMessage("Reset confirmed");
    changeMode(DRAWING_MODES.INIT);
    addEventChangeMode(DRAWING_MODES.INIT);
    setMode(DRAWING_MODES.DRAW);
    eraseHistory();
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

  const handleImage = (value) => {
    setMode(DRAWING_MODES.SELECT);
    changeMode(DRAWING_MODES.IMAGE);
    addEventChangeMode(value);
  };

  const handleUndo = () => {
    addEventChangeMode(DRAWING_MODES.UNDO);
  };

  return useMemo(() => {
    return (
      <div
        onMouseEnter={() => addEventChangeMode(DRAWING_MODES.CONTROL_PANEL.IN)}
        onMouseLeave={() => addEventChangeMode(DRAWING_MODES.CONTROL_PANEL.OUT)}
        className="flex w-auto flex-col gap-1 rounded-md border-2 border-secondary bg-background p-1 shadow-xl"
      >
        <div className="flex flex-row gap-4">
          <Button
            className="px-5"
            selected={mode == DRAWING_MODES.DRAW}
            onClick={() => handleModeChange(DRAWING_MODES.DRAW)}
          >
            Draw
          </Button>
          <Button
            className="px-5 py-1"
            selected={mode == DRAWING_MODES.LINE}
            onClick={() => handleModeChange(DRAWING_MODES.LINE)}
          >
            <MdTimeline size="28px" />
          </Button>
          <Button
            className="px-5 py-1"
            selected={mode == DRAWING_MODES.ARC}
            onClick={() => handleModeChange(DRAWING_MODES.ARC)}
          >
            <AiOutlineLoading size="28px" />
          </Button>
          <Button
            className="px-5"
            selected={mode == DRAWING_MODES.TEXT}
            onClick={() => handleModeChange(DRAWING_MODES.TEXT)}
          >
            Text
          </Button>
          <Button
            className="bg-pink-500 px-5"
            selected={mode == DRAWING_MODES.ERASE}
            onClick={() => handleModeChange(DRAWING_MODES.ERASE)}
          >
            <CiEraser size="20px" />
          </Button>
          <Button
            className="bg-blue-500 px-5"
            selected={mode == DRAWING_MODES.SELECT}
            onClick={() => handleModeChange(DRAWING_MODES.SELECT)}
          >
            <PiSelectionPlusLight size="20px" />
          </Button>
        </div>
        <div
          className={clsx("flex flex-col border-2 border-secondary p-2", {
            "bg-paper": isDrawingSelect(mode),
            hidden: !isDrawingSelect(mode),
          })}
        >
          <div className="flex flex-row gap-3">
            <div className="flex flex-row gap-1">
              <Button
                className="px-2 py-1"
                selected={mode === DRAWING_MODES.COPY}
                onClick={() => handleImage(DRAWING_MODES.COPY)}
              >
                Copy
              </Button>
            </div>
            <div className="flex flex-row gap-1">
              <Button
                className="px-2 py-1"
                selected={mode === DRAWING_MODES.PASTE}
                onClick={() => handleImage(DRAWING_MODES.PASTE)}
              >
                Paste
              </Button>
            </div>
          </div>
        </div>
        <DrawControlLine
          mode={mode}
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
          <Button className="bg-pink-500" onClick={() => handleUndo()}>
            <SlActionUndo size="20px" />
          </Button>
          <ButtonConfirmModal
            className="bg-red-500"
            value="Reset"
            onConfirm={handleConfirmReset}
          >
            Do you want to erase all your drawing ?
          </ButtonConfirmModal>
          <ButtonConfirmModal
            className="bg-blue-500"
            value="Save my drawing"
            onConfirm={() => {
              addEventSaveFile(filenameRef.current.value);
              defaultFilename.current = filenameRef.current.value;
            }}
          >
            <div className="flex flex-row">
              Do you want to reccord this image ?
            </div>
            <div className="flex flex-row">
              Name:
              <input
                className="mx-2 h-8 w-40 rounded-md border-2 border-gray-500 bg-white px-2"
                type="text"
                defaultValue={defaultFilename.current}
                ref={filenameRef}
              />
            </div>
          </ButtonConfirmModal>
        </div>
      </div>
    );
  }, [mode, withText, drawingParams, changeMode]);
};

export const DrawControlWP = withMousePosition(DrawControl);
