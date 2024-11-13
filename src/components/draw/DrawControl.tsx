import React, { useRef, useMemo, useState, useEffect } from "react";
import { withMousePosition } from "../windows/withMousePosition";
import { isTouchDevice } from "@/lib/utils/device";
import { SlActionUndo } from "react-icons/sl";
import { CiEraser } from "react-icons/ci";
import { PiSelectionPlusLight } from "react-icons/pi";

import { Button } from "../atom/Button";
import {
  DRAWING_MODES,
  isDrawingSelect,
  isDrawingShape,
  AllParams,
  GroupParams,
  EventDetail,
  EventModeAction,
  isDrawingLine,
} from "../../lib/canvas/canvas-defines";
import { DrawControlText } from "./DrawControlText";
import { DrawControlShape } from "./DrawControlShape";
import { DrawControlLine } from "./DrawControlLine";
import { DrawControlGeneral } from "./DrawControlGeneral";
import { eraseHistory } from "../../lib/canvas/canvas-history";

import { alertMessage } from "../alert-messages/alertMessage";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";
import { ToggleSwitch } from "../atom/ToggleSwitch";
import { DrawControlSelect } from "./DrawControlSelect";
import { MutableRefObject } from "react";

interface DrawControlProps {
  setParams: (params: GroupParams) => void;
  mode: string;
  setMode: (mode: string) => void;
  // changeMode: (mode: string) => void;
  drawingParams: AllParams;
}

export const DrawControl: React.FC<DrawControlProps> = ({
  setParams,
  mode,
  setMode,
  // changeMode,
  drawingParams,
}) => {
  const modeRef = useRef(mode);
  const [withText, setWithText] = useState(false);
  const [lockRatio, setLockRatio] = useState(false);
  const [opacity, setOpacity] = useState(drawingParams.general.opacity * 100);

  const filenameRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const defaultFilename = useRef("my-drawing");
  const saveFormatRef = useRef("png");
  const [isTouch, setIsTouch] = useState(false);

  const addEvent = (detail: EventDetail) => {
    const event = new CustomEvent("modeChanged", detail);
    document.dispatchEvent(event);
  };
  const addEventDetail = (detail: EventModeAction) => {
    addEvent({ detail } as EventDetail);
  };

  const addEventAction = (action: string) => {
    addEventDetail({ mode: DRAWING_MODES.ACTION, action });
  };
  const addEventMode = (mode: string) => {
    addEventDetail({ mode });
  };
  const addEventSaveFile = (
    action: string,
    filename: string,
    name: string | null = null
  ) => {
    const format = saveFormatRef.current;
    addEventDetail({
      mode: DRAWING_MODES.ACTION,
      action,
      filename,
      format,
      ...(name ? { name } : {}),
    });
  };

  const handleConfirmReset = () => {
    alertMessage("Reset confirmed");
    // changeMode(DRAWING_MODES.INIT); // mode send to DrawCanvas
    addEventAction(DRAWING_MODES.INIT);
    // Mode for the control panel
    setMode(DRAWING_MODES.INIT);
    eraseHistory();
  };

  const handleParamChange = (newParams: GroupParams) => {
    setParams(newParams);
    addEventDetail({ mode: DRAWING_MODES.CHANGE });
  };
  const handleOpacity = (value: number) => {
    setOpacity(value);
    drawingParams.general.opacity = value / 100;
    handleParamChange({ general: drawingParams.general });
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    addEventMode(newMode);
  };

  const handleImage = (mode: string) => {
    setMode(DRAWING_MODES.IMAGE);
    addEventAction(mode);
  };

  const handleSelectZone = () => {
    if (mode !== DRAWING_MODES.SELECT) {
      // active selection mode
      handleModeChange(DRAWING_MODES.SELECT);
      handleChangeRatio(false);
      return;
    }
    // reselect zone
    addEventAction(DRAWING_MODES.SELECT_AREA);
  };

  const handleChangeRatio = (ratio: boolean) => {
    alertMessage("Locked ratio : " + (ratio ? "ON" : "off"));
    setParams({ lockRatio: ratio });
    setLockRatio(ratio);
    addEventMode(DRAWING_MODES.CHANGE);
  };
  const handleChangeRadius = (radius: number) => {
    drawingParams.shape = { ...drawingParams.shape, radius };
    handleParamChange({ shape: drawingParams.shape });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
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
    setIsTouch(isTouchDevice());
  }, []);

  useEffect(() => {
    modeRef.current = mode;

    if (isTouch) {
      // touch device, no keyboard events
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode]);

  return useMemo(() => {
    return (
      <div
        onMouseEnter={() => addEventAction(DRAWING_MODES.CONTROL_PANEL.IN)}
        onTouchStartCapture={() =>
          addEventAction(DRAWING_MODES.CONTROL_PANEL.IN)
        }
        onMouseLeave={() => addEventAction(DRAWING_MODES.CONTROL_PANEL.OUT)}
        onTouchEndCapture={() =>
          addEventAction(DRAWING_MODES.CONTROL_PANEL.OUT)
        }
        className="flex flex-col gap-1 p-1 min-w-[590px] max-w-[650px] rounded-md border-2 shadow-xl border-secondary bg-background"
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
            Lines
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
          {(isDrawingShape(mode) || isDrawingSelect(mode)) && (
            <label
              htmlFor="toggle-ratio"
              className="flex flex-col justify-center items-center text-sm text-nowrap"
            >
              {lockRatio ? "Ratio locked" : "Lock ratio"}
              <ToggleSwitch
                id="toggle-ratio"
                defaultChecked={drawingParams.lockRatio}
                onChange={(event) => {
                  handleChangeRatio(event.target.checked);
                }}
              />
            </label>
          )}
        </div>
        <DrawControlSelect
          mode={mode}
          setMode={setMode}
          handleImage={handleImage}
          handleChangeRatio={handleChangeRatio}
          handleChangeRadius={handleChangeRadius}
          addEventDetail={addEventDetail}
          isTouch={isTouch}
        />
        <DrawControlText
          mode={mode}
          hidden={
            mode != DRAWING_MODES.TEXT &&
            (withText === false || !isDrawingShape(mode))
          }
          drawingParams={drawingParams}
          handleTextParams={handleParamChange}
          isTouch={isTouch}
        />
        <DrawControlGeneral
          mode={mode}
          handleParamChange={handleParamChange}
          drawingParams={drawingParams}
          opacity={opacity}
          setOpacity={handleOpacity}
          isTouch={isTouch}
        />
        {isDrawingLine(mode) && (
          <DrawControlLine
            mode={mode}
            handleParamChange={handleParamChange}
            handleModeChange={handleModeChange}
            addEventAction={addEventAction}
            drawingParams={drawingParams}
            isTouch={isTouch}
          />
        )}
        <DrawControlShape
          mode={mode}
          drawingParams={drawingParams}
          handleParamChange={handleParamChange}
          handleModeChange={handleModeChange}
          handleChangeRadius={handleChangeRadius}
          setWithText={setWithText}
          isTouch={isTouch}
        />

        <div className="flex relative gap-4 m-auto">
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
            <div className="flex flex-col gap-2 w-full">
              <div className="flex">Do you want to reccord this image ?</div>
              <div className="flex justify-between w-full">
                Name:
                <input
                  className="px-2 mx-2 w-40 h-8 bg-white rounded-md border-2 border-gray-500"
                  type="text"
                  defaultValue={defaultFilename.current}
                  ref={filenameRef}
                />
              </div>
              <div className="flex justify-center w-full">
                <select
                  defaultValue={saveFormatRef.current}
                  onChange={(e) => (saveFormatRef.current = e.target.value)}
                  className="px-2 mx-2 w-20 h-8 text-sm bg-gray-200 rounded-md border-2 border-gray-500"
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
  }, [mode, withText, drawingParams, , lockRatio, opacity]);
};

export const DrawControlWP = withMousePosition(DrawControl);
