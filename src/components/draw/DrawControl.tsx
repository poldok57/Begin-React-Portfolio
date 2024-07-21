import React, { useRef, useMemo, useState, useEffect } from "react";
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
import { MutableRefObject } from "react";

// import clsx from "clsx";

export const DrawControl = ({ setParams, changeMode, drawingParams }) => {
  const [mode, setMode] = useState(drawingParams.mode);
  const modeRef = useRef(mode);
  const [withText, setWithText] = useState(false);
  const [lockRatio, setLockRatio] = useState(false);
  const [opacity, setOpacity] = useState(drawingParams.general.opacity * 100);

  const filenameRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const defaultFilename = useRef("my-drawing");
  const saveFormatRef = useRef("png");

  const addEvent = (detail) => {
    const event = new CustomEvent("modeChanged", detail);
    document.dispatchEvent(event);
  };
  const addEventDetail = (detail) => addEvent({ detail });

  const addEventAction = (action) => {
    addEventDetail({ mode: DRAWING_MODES.ACTION, action });
  };
  const addEventMode = (mode) => {
    addEventDetail({ mode });
  };
  const addEventSaveFile = (action, filename, name = null) => {
    const format = saveFormatRef.current;
    addEventDetail({
      mode: DRAWING_MODES.ACTION,
      action,
      filename,
      name,
      format,
    });
  };

  const handleConfirmReset = () => {
    alertMessage("Reset confirmed");
    changeMode(DRAWING_MODES.INIT);
    addEventAction(DRAWING_MODES.INIT);
    setMode(DRAWING_MODES.DRAW);
    eraseHistory();
  };

  const handleParamChange = (newParams) => {
    setParams(newParams);
    addEventDetail({ mode: DRAWING_MODES.CHANGE });
  };
  const handleOpacity = (value) => {
    setOpacity(value);
    drawingParams.general.opacity = value / 100;
    handleParamChange({ general: drawingParams.general });
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    changeMode(newMode);
    addEventMode(newMode);
  };

  const handleImage = (mode) => {
    setMode(DRAWING_MODES.IMAGE);
    changeMode(DRAWING_MODES.IMAGE);
    addEventAction(mode);
  };

  const handleSelectZone = () => {
    handleModeChange(DRAWING_MODES.SELECT);
    handleChangeRatio(false);
  };

  const handleChangeRatio = (ratio) => {
    alertMessage("Locked ratio : " + (ratio ? "ON" : "off"));
    setParams({ lockRatio: ratio });
    setLockRatio(ratio);
    addEventMode(DRAWING_MODES.CHANGE);
  };
  const handleChangeRadius = (radius) => {
    drawingParams.shape = { ...drawingParams.shape, radius };
    handleParamChange({ shape: drawingParams.shape });
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Escape":
        addEventAction(DRAWING_MODES.ABORT);
        break;
      case "Enter":
        addEventAction(DRAWING_MODES.VALID);
        break;
      case "z":
      case "Z":
        if (event.ctrlKey) {
          addEventAction(DRAWING_MODES.UNDO);
        }
        break;
      case "a":
      case "A":
        if (event.ctrlKey) {
          event.preventDefault();
          handleSelectZone();
        }
        break;

      case "c":
      case "C":
        // console.log("Ctrl-c", mode);
        if (isDrawingSelect(modeRef.current) && event.ctrlKey) {
          handleImage(DRAWING_MODES.COPY);
        }
        break;
      case "v":
      case "V":
        if (isDrawingSelect(modeRef.current) && event.ctrlKey) {
          handleImage(DRAWING_MODES.PASTE);
        }
        break;
      case "x":
      case "X":
        if (isDrawingSelect(modeRef.current) && event.ctrlKey) {
          handleImage(DRAWING_MODES.CUT);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    modeRef.current = mode;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode]);

  return useMemo(() => {
    return (
      <div
        onMouseEnter={() => addEventAction(DRAWING_MODES.CONTROL_PANEL.IN)}
        onMouseLeave={() => addEventAction(DRAWING_MODES.CONTROL_PANEL.OUT)}
        className="flex flex-col w-auto gap-1 p-1 border-2 rounded-md shadow-xl border-secondary bg-background"
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
            title="Draw lines"
          >
            <MdTimeline size="28px" />
          </Button>
          <Button
            className="px-5 py-1"
            selected={mode == DRAWING_MODES.ARC}
            onClick={() => handleModeChange(DRAWING_MODES.ARC)}
            title="Draw arcs"
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
            className="px-5 bg-teal-400 hover:bg-teal-500"
            selected={mode == DRAWING_MODES.ERASE}
            onClick={() => {
              handleModeChange(DRAWING_MODES.ERASE);
              handleOpacity(100);
            }}
            title="Erase"
          >
            <CiEraser size="20px" />
          </Button>
          <Button
            className="px-5 bg-blue-500 hover:bg-blue-600"
            selected={isDrawingSelect(mode)}
            onClick={() => {
              handleSelectZone();
            }}
            title="Select zone (Ctrl-A)"
          >
            <PiSelectionPlusLight size="20px" />
          </Button>
          <Button
            className={clsx("px-5", {
              hidden: !(isDrawingShape(mode) || isDrawingSelect(mode)),
              "bg-green-600 hover:bg-green-400": !lockRatio,
              "bg-red-600 hover:bg-red-400": lockRatio,
            })}
            title={!lockRatio ? "Lock ratio" : "Ratio locked"}
            selected={lockRatio}
            onClick={() => handleChangeRatio(!lockRatio)}
          >
            <MdAspectRatio size="20px" />
          </Button>
        </div>
        <DrawControlSelect
          mode={mode}
          setMode={setMode}
          handleImage={handleImage}
          handleChangeRatio={handleChangeRatio}
          handleChangeRadius={handleChangeRadius}
          addEventDetail={addEventDetail}
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
          handleChangeRadius={handleChangeRadius}
          setWithText={setWithText}
        />
        <DrawControlText
          mode={mode}
          hidden={mode != DRAWING_MODES.TEXT && withText === false}
          drawingParams={drawingParams}
          handleTextParams={handleParamChange}
        />

        <div className="relative flex gap-4 m-auto">
          <Button
            className="bg-pink-500 hover:bg-pink-600"
            title="Ctrl-Z"
            onClick={() => addEventAction(DRAWING_MODES.UNDO)}
          >
            <SlActionUndo size="20px" />
          </Button>
          <ButtonConfirmModal
            position="over"
            className="bg-red-500 hover:bg-red-600"
            value="Reset"
            onConfirm={handleConfirmReset}
          >
            Do you want to erase all your drawing ?
          </ButtonConfirmModal>
          <ButtonConfirmModal
            position="modal"
            className="bg-blue-500 hover:bg-blue-600"
            value="Save my drawing"
            onConfirm={() => {
              if (filenameRef.current != null) {
                addEventSaveFile(DRAWING_MODES.SAVE, filenameRef.current.value);
                defaultFilename.current = filenameRef.current.value;
              }
            }}
          >
            <div className="flex flex-col w-full gap-2">
              <div className="flex">Do you want to reccord this image ?</div>
              <div className="flex justify-between w-full">
                Name:
                <input
                  className="w-40 h-8 px-2 mx-2 bg-white border-2 border-gray-500 rounded-md"
                  type="text"
                  defaultValue={defaultFilename.current}
                  ref={filenameRef}
                />
              </div>
              <div className="flex justify-center w-full">
                <select
                  defaultValue={saveFormatRef.current}
                  onChange={(e) => (saveFormatRef.current = e.target.value)}
                  className="w-20 h-8 px-2 mx-2 text-sm bg-gray-200 border-2 border-gray-500 rounded-md"
                >
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                  <option value="gif">GIF</option>
                </select>
              </div>
            </div>
          </ButtonConfirmModal>
        </div>
      </div>
    );
  }, [mode, withText, drawingParams, changeMode, lockRatio, opacity]);
};

export const DrawControlWP = withMousePosition(DrawControl);
