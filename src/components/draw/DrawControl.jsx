import { useRef, useMemo, useState } from "react";
import { withMousePosition } from "../../hooks/withMousePosition";
import { MdTimeline } from "react-icons/md";
// import { MdRadioButtonUnchecked } from "react-icons/md";
import { SlActionUndo } from "react-icons/sl";
import { AiOutlineLoading } from "react-icons/ai";
import { CiEraser } from "react-icons/ci";
import { PiSelectionPlusLight } from "react-icons/pi";
import { MdAspectRatio } from "react-icons/md";
import clsx from "clsx";

import { Button } from "../atom/Button";
import {
  DRAWING_MODES,
  isDrawingSelect,
  isDrawingShape,
} from "../../lib/canvas/canvas-defines";
import { DrawControlText } from "./DrawControlText";
import { DrawControlShape } from "./DrawControlShape";
import { DrawControlLine } from "./DrawControlLine";
import { eraseHistory } from "../../lib/canvas/canvas-history";

import { alertMessage } from "../../hooks/alertMessage";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";
import { DrawControlSelect } from "./DrawControlSelect";

// import clsx from "clsx";

export const DrawControl = ({
  setParams,
  changeMode,
  defaultMode,
  drawingParams,
}) => {
  const [mode, setMode] = useState(defaultMode);
  const [withText, setWithText] = useState(false);
  const [lockRatio, setLockRatio] = useState(false);
  const [opacity, setOpacity] = useState(drawingParams.general.opacity * 100);

  const filenameRef = useRef(null);
  const defaultFilename = useRef("my-drawing");

  const addEvent = (detail) => {
    const event = new CustomEvent("modeChanged", detail);
    document.dispatchEvent(event);
  };
  const addEventChangeMode = (mode) => {
    addEvent({ detail: { mode } });
  };
  const addEventSaveFile = (mode, filename, name = null) => {
    addEvent({ detail: { mode, filename, name } });
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
  const handleOpacity = (value) => {
    setOpacity(value);
    drawingParams.general.opacity = value / 100;
    handleParamChange({ general: drawingParams.general });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    changeMode(newMode);
    addEventChangeMode(newMode);
  };

  const handleUndo = () => {
    addEventChangeMode(DRAWING_MODES.UNDO);
  };

  const handleChangeRatio = (ratio) => {
    alertMessage("Locked ratio : " + (ratio ? "ON" : "off"));
    drawingParams.ratio = ratio;
    setParams({ lockRatio: ratio });
    setLockRatio(ratio);
    addEventChangeMode(DRAWING_MODES.DRAWING_CHANGE);
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
            onClick={() => {
              handleModeChange(DRAWING_MODES.ERASE);
              handleOpacity(100);
            }}
          >
            <CiEraser size="20px" />
          </Button>
          <Button
            className="bg-blue-500 px-5"
            selected={isDrawingSelect(mode)}
            onClick={() => {
              handleModeChange(DRAWING_MODES.SELECT);
              handleChangeRatio(false);
            }}
          >
            <PiSelectionPlusLight size="20px" />
          </Button>
          <Button
            className={clsx("px-5", {
              hidden: !(isDrawingShape(mode) || isDrawingSelect(mode)),
              "bg-green-600": !lockRatio,
              "bg-red-600": lockRatio,
            })}
            selected={lockRatio}
            onClick={() => handleChangeRatio(!lockRatio)}
          >
            <MdAspectRatio size="20px" />
          </Button>
        </div>
        <DrawControlSelect
          mode={mode}
          setMode={setMode}
          changeMode={changeMode}
          handleChangeRatio={handleChangeRatio}
          addEvent={addEvent}
        />
        <DrawControlLine
          mode={mode}
          handleParamChange={handleParamChange}
          drawingParams={drawingParams}
          opacity={opacity}
          setOpacity={handleOpacity}
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
          <Button
            className="bg-pink-500"
            title="Ctrl-Z"
            onClick={() => handleUndo()}
          >
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
              addEventSaveFile(DRAWING_MODES.SAVE, filenameRef.current.value);
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
  }, [mode, withText, drawingParams, changeMode, lockRatio, opacity]);
};

export const DrawControlWP = withMousePosition(DrawControl);
