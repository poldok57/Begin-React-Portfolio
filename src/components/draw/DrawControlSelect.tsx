import React, { useState, useRef } from "react";
import { BsCircleHalf } from "react-icons/bs";
import clsx from "clsx";
import { Button } from "../atom/Button";
import {
  DRAWING_MODES,
  isDrawingSelect,
} from "../../lib/canvas/canvas-defines";
import { ButtonConfirmModal } from "../atom/ButtonConfirmModal";
import { MutableRefObject } from "react";

// import clsx from "clsx";

export const DrawControlSelect = ({
  mode,
  setMode,
  handleChangeRatio,
  handleChangeRadius,
  handleImage,
  addEventDetail,
}) => {
  const [isBlackWhite, setBlackWhite] = useState(false);
  const dialogRef: MutableRefObject<HTMLDialogElement | null> = useRef(null);

  const addEventActionValue = (action, value) => {
    addEventDetail({ mode: DRAWING_MODES.ACTION, action, value });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      addEventDetail({
        mode: DRAWING_MODES.ACTION,
        action: DRAWING_MODES.LOAD,
        filename: url,
        file: file.name,
      });

      handleChangeRatio(true);
      setMode(DRAWING_MODES.IMAGE);
      if (dialogRef.current) {
        dialogRef.current.close();
      }
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
          className="z-10 px-2 text-white bg-blue-500 hover:bg-blue-600"
          value="Upload image"
          position="modal"
          dialogRef={dialogRef}
        >
          <div className="flex flex-row">Select a file to upload :</div>
          <input
            formMethod="dialog"
            className={clsx(
              "h-fit w-72 rounded-md border-2 border-blue-300 bg-white py-0 pr-2 text-sm",
              "file:mr-4 file:rounded-l-md file:border file:bg-blue-500 file:py-2 file:px-2 file:font-semibold file:text-white hover:file:bg-blue-600"
            )}
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
          Detouring
          <input
            className="w-20 h-4 transition-opacity bg-gray-300 outline-none opacity-70 hover:opacity-100"
            id="transparency-picker"
            type="range"
            defaultValue={0}
            min="0"
            max="200"
            step="3"
            onChange={(event) =>
              addEventActionValue(
                DRAWING_MODES.TRANSPARENCY,
                event.target.value
              )
            }
          />
        </label>
        <Button
          className={clsx("px-2 py-1  font-bold", {
            "bg-gradient-to-r from-green-400 via-blue-500 to-red-600  text-white hover:from-red-700 hover:via-green-500 hover:to-blue-600":
              !isBlackWhite,
            "bg-gradient-to-r from-gray-800 to-gray-200  hover:from-black  hover:to-white":
              isBlackWhite,
          })}
          onClick={() => {
            setBlackWhite(!isBlackWhite);
            addEventActionValue(DRAWING_MODES.BLACK_WHITE, !isBlackWhite);
          }}
        >
          <BsCircleHalf />
        </Button>
        <label
          htmlFor="select-radius-picker"
          className={clsx("flex flex-col items-center justify-center gap-1", {
            hidden: mode !== DRAWING_MODES.IMAGE,
          })}
        >
          Radius
          <input
            className="w-20 h-2 transition-opacity bg-gray-300 outline-none opacity-70 hover:opacity-100"
            id="select-radius-picker"
            type="range"
            defaultValue={0}
            min="0"
            max="150"
            step="1"
            onChange={(event) =>
              handleChangeRadius(parseInt(event.target.value))
            }
          />
        </label>
      </div>
    </div>
  );
};
