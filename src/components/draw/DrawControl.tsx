import React, { useRef, useMemo, useState, useEffect } from "react";
import { isTouchDevice } from "@/lib/utils/device";
import { SlActionUndo } from "react-icons/sl";
import { CiEraser } from "react-icons/ci";
import { PiSelectionPlusLight } from "react-icons/pi";

import { Button } from "../atom/Button";
import {
  DRAWING_MODES,
  isDrawingSelect,
  isDrawingShape,
  isDrawingLine,
  ShapeDefinition,
} from "../../lib/canvas/canvas-defines";
import { DrawControlText } from "./DrawControlText";
import { DrawControlShape } from "./DrawControlShape";
import { DrawControlLine } from "./DrawControlLine";
import { DrawControlArrow } from "./DrawControlArrow";
import { DrawControlGeneral } from "./DrawControlGeneral";

import { alertMessage } from "../alert-messages/alertMessage";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";
import { ToggleSwitch } from "../atom/ToggleSwitch";
import { DrawControlSelect } from "./DrawControlSelect";
import { MutableRefObject } from "react";
import { useZustandDesignStore } from "@/lib/stores/design";
import { updateParamFromElement } from "@/lib/canvas/updateParamFromElement";
import { DeleteWithConfirm } from "../atom/DeleteWithConfirm";
import { Search, MoveUpRight, Pencil, CaseSensitive } from "lucide-react";
import { TbTimeline } from "react-icons/tb";
import { Save } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useDrawingContext } from "@/context/DrawingContext";
import { useControlKeyboard } from "./hooks/useControlKeyboard";
interface DrawControlProps {
  storeName?: string | null;
  buttonIconSize?: number;
  buttonShapeSize?: number;
}

export const DrawControl: React.FC<DrawControlProps> = ({
  storeName = null,
  buttonIconSize = 28,
  buttonShapeSize = 20,
}) => {
  const {
    drawingParams,
    setDrawingParams,
    setDrawingMode,
    setGeneralParams,
    mode,
    addEventDetail,
    addEventAction,
    handleChangeMode,
    // withText,
    setLockRatio,
    handleSelectZone,
    reloadControl,
    needReloadControl,
  } = useDrawingContext();

  const filenameRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const defaultFilename = useRef("my-drawing");
  const saveFormatRef = useRef("png");
  const [isTouch, setIsTouch] = useState(false);

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

  const store = useZustandDesignStore(storeName);
  if (!store) {
    throw new Error("Design store not found");
  }
  const {
    eraseDesignElement,
    selectedDesignElement,
    getSelectedDesignElement,
  } = store.getState();

  const selectedElementRef: MutableRefObject<string | null> = useRef(null);

  const handleConfirmReset = () => {
    alertMessage("Reset confirmed");
    // changeMode(DRAWING_MODES.INIT); // mode send to DrawCanvas
    addEventAction(DRAWING_MODES.INIT);
    // Mode for the control panel
    setDrawingMode(DRAWING_MODES.INIT);
    // eraseHistory();
    eraseDesignElement();
  };

  useControlKeyboard(isTouch);

  // update controle panel when an element is selected
  useEffect(() => {
    if (
      selectedDesignElement &&
      selectedDesignElement !== selectedElementRef.current
    ) {
      const selectedElement: ShapeDefinition =
        getSelectedDesignElement() as ShapeDefinition;
      if (!selectedElement) {
        return;
      }
      const newMode = updateParamFromElement(setDrawingParams, selectedElement);

      if (newMode) {
        setDrawingMode(newMode);
      }
      needReloadControl();
      alertMessage("selected element changed: " + newMode);
      selectedElementRef.current = selectedDesignElement;
    }
  }, [selectedDesignElement]);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

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
            className="px-4"
            selected={mode == DRAWING_MODES.DRAW}
            onClick={() => handleChangeMode(DRAWING_MODES.DRAW)}
            title="Free hand drawing"
          >
            <Pencil size={buttonIconSize} />
          </Button>
          <Button
            className="px-4 py-1"
            selected={isDrawingLine(mode) && mode !== DRAWING_MODES.ARROW}
            onClick={() => {
              handleChangeMode(DRAWING_MODES.LINE);
            }}
            title="Draw lines"
          >
            <TbTimeline size={buttonIconSize} />
          </Button>
          <Button
            className="px-4 py-1"
            selected={mode == DRAWING_MODES.ARROW}
            onClick={() => handleChangeMode(DRAWING_MODES.ARROW)}
            title="Arrow"
          >
            <MoveUpRight size={buttonIconSize} />
          </Button>
          <Button
            className="px-4"
            selected={mode == DRAWING_MODES.TEXT}
            onClick={() => handleChangeMode(DRAWING_MODES.TEXT)}
          >
            <CaseSensitive size={buttonIconSize} />
          </Button>
          <Button
            className="px-4 bg-teal-400 hover:bg-teal-500"
            selected={mode == DRAWING_MODES.ERASE}
            onClick={() => {
              setGeneralParams({ opacity: 1 });
              handleChangeMode(DRAWING_MODES.ERASE);
            }}
            title="Erase"
          >
            <CiEraser size={buttonIconSize} />
          </Button>
          <Button
            className="px-4 bg-blue-500 hover:bg-blue-600"
            selected={isDrawingSelect(mode)}
            onClick={() => {
              handleSelectZone();
            }}
            title="Select zone (Ctrl-A)"
          >
            <PiSelectionPlusLight size={buttonShapeSize} />
          </Button>
          {(isDrawingShape(mode) || isDrawingSelect(mode)) && (
            <label
              htmlFor="toggle-ratio"
              className="flex flex-col justify-center items-center text-sm text-nowrap"
            >
              {drawingParams.lockRatio ? "Ratio locked" : "Lock ratio"}
              <ToggleSwitch
                id="toggle-ratio"
                defaultChecked={drawingParams.lockRatio}
                onChange={(event) => {
                  // setDrawingParams({ lockRatio: event.target.checked });
                  setLockRatio(event.target.checked);
                }}
              />
            </label>
          )}
          <div className="flex justify-end items-center w-full">
            <button
              onClick={() => handleChangeMode(DRAWING_MODES.FIND)}
              className={cn(
                "btn btn-sm btn-circle transition hover:bg-accent",
                {
                  "bg-accent": mode == DRAWING_MODES.FIND,
                }
              )}
              title="Find element by clicking on canvas"
            >
              <Search size={buttonShapeSize} />
            </button>
          </div>
        </div>
        <DrawControlSelect isTouch={isTouch} />
        <DrawControlText
          hidden={
            mode != DRAWING_MODES.TEXT &&
            (!isDrawingShape(mode) || drawingParams.shape.withText === false)
          }
          isTouch={isTouch}
        />
        <DrawControlGeneral isTouch={isTouch} />
        {isDrawingLine(mode) && mode !== DRAWING_MODES.ARROW && (
          <DrawControlLine />
        )}
        {mode === DRAWING_MODES.ARROW && <DrawControlArrow isTouch={isTouch} />}
        <DrawControlShape isTouch={isTouch} />

        <div className="flex relative gap-4 m-auto">
          <Button
            className="bg-pink-500 hover:bg-pink-600"
            title="Ctrl-Z"
            onClick={() => addEventAction(DRAWING_MODES.UNDO)}
          >
            <SlActionUndo size={buttonIconSize} />
          </Button>
          <DeleteWithConfirm
            position="top"
            className="text-sm font-medium text-white bg-red-500 rounded transition btn hover:bg-red-600 border-primary"
            confirmClassName="btn btn-sm w-fit"
            confirmMessage="Erase your drawing?"
            onConfirm={handleConfirmReset}
          >
            Reset
          </DeleteWithConfirm>
          <ButtonConfirmModal
            position="modal"
            className="bg-blue-500 hover:bg-blue-600"
            value={<Save size={buttonIconSize} />}
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
  }, [
    mode,
    reloadControl,
    drawingParams.shape.withText,
    drawingParams.lockRatio,
  ]);
};
