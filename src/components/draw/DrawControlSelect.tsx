import React, { useState, useRef, useEffect } from "react";
import { BsCircleHalf } from "react-icons/bs";
import clsx from "clsx";
import { Button } from "../atom/Button";
import { RangeInput } from "../atom/RangeInput";
import {
  DRAWING_MODES,
  isDrawingSelect,
  EventModeAction,
  GroupParams,
  Params,
  AllParams,
} from "../../lib/canvas/canvas-defines";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";
import { MutableRefObject } from "react";

// import clsx from "clsx";
interface DrawControlSelectProps {
  mode: string;
  setMode: (mode: string) => void;
  drawingParams: AllParams;
  handleChangeRatio: (value: boolean) => void;
  handleParamChange: (params: GroupParams) => void;
  handleImage: (action: string) => void;
  addEventDetail: (detail: EventModeAction) => void;
  isTouch?: boolean;
}

export const DrawControlSelect: React.FC<DrawControlSelectProps> = ({
  mode,
  setMode,
  drawingParams,
  handleChangeRatio,
  handleParamChange,
  handleImage,
  addEventDetail,
  isTouch = false,
}) => {
  const [modeImage, setModeImage] = useState(false);
  const [isBlackWhite, setBlackWhite] = useState(false);
  const dialogRef: MutableRefObject<HTMLDialogElement | null> = useRef(null);

  const handleShape = (param: Params) => {
    drawingParams.shape = { ...drawingParams.shape, ...param };
    handleParamChange({ shape: drawingParams.shape });
  };

  useEffect(() => {
    setModeImage(mode === DRAWING_MODES.IMAGE);
    setBlackWhite(drawingParams.shape.blackWhite || false);
  }, [mode, drawingParams.shape]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addEventDetail({
        mode: DRAWING_MODES.ACTION,
        action: DRAWING_MODES.LOAD,
        filename: url,
        name: file.name,
      });

      handleChangeRatio(true);
      handleParamChange({
        general: {
          ...drawingParams.general,
          opacity: 1,
        },
      });
      setMode(DRAWING_MODES.IMAGE);
      // close the dialog box after the file is uploaded
      if (dialogRef.current) {
        dialogRef.current.close();
      }
    }
  };

  return (
    <div
      className={clsx("flex flex-col p-2 border-2 border-secondary", {
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
          className="z-10 px-2 text-white bg-blue-500 hover:bg-blue-600"
          value="Upload image"
          position="modal"
          dialogRef={dialogRef}
        >
          <div className="flex flex-row">Select a file to upload :</div>
          <input
            value=""
            formMethod="dialog"
            className={clsx(
              "py-0 pr-2 w-72 text-sm bg-white rounded-md border-2 border-blue-300 h-fit",
              "file:mr-4 file:rounded-l-md file:border file:bg-blue-500 file:py-2 file:px-2 file:font-semibold file:text-white hover:file:bg-blue-600"
            )}
            type="file"
            onChange={handleFileChange}
          />
        </ButtonConfirmModal>
        {modeImage && (
          <RangeInput
            className="w-20 h-4 bg-gray-300 opacity-70 transition-opacity outline-none hover:opacity-100"
            id="transparency-picker"
            label="Detouring"
            value={drawingParams.shape.transparency || 0}
            min="0"
            max="200"
            step="3"
            onChange={(value) => {
              handleShape({ transparency: value });
            }}
            isTouch={isTouch}
          />
        )}
        <Button
          className={clsx("px-2 py-1 font-bold", {
            "text-white bg-gradient-to-r from-green-400 via-blue-500 to-red-600 hover:from-red-700 hover:via-green-500 hover:to-blue-600":
              !isBlackWhite,
            "bg-gradient-to-r from-gray-800 to-gray-200 hover:from-black hover:to-white":
              isBlackWhite,
          })}
          onClick={() => {
            setBlackWhite(!isBlackWhite);
            handleShape({ blackWhite: !isBlackWhite });
          }}
        >
          <BsCircleHalf />
        </Button>
        <RangeInput
          className="w-20 h-2 bg-gray-300 opacity-70 transition-opacity outline-none hover:opacity-100"
          id="select-radius-picker"
          label="Radius"
          value={drawingParams.shape.radius || 0}
          min="0"
          max="150"
          step="1"
          onChange={(value) => handleShape({ radius: value })}
          isTouch={isTouch}
        />
      </div>
    </div>
  );
};
