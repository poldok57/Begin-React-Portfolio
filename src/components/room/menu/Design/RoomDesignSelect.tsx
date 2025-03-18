import React, { useState, useRef, useEffect } from "react";
import { BsCircleHalf } from "react-icons/bs";
import { Button } from "@/components/atom/Button";
import { RangeInput } from "@/components/atom/RangeInput";
import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";

import { useDrawingContext } from "@/context/DrawingContext";
import { ButtonConfirmModal } from "@/components/atom/ButtonConfirmModal";
import { MutableRefObject } from "react";
import { ImageUp, X } from "lucide-react";
import { PiSelectionPlusLight } from "react-icons/pi";
import { cn } from "@/lib/utils/cn";
import {
  designFieldsetVariants,
  designLabelVariants,
} from "@/styles/menu-variants";
interface RoomDesignSelectProps {
  buttonIconSize?: number;
}

export const RoomDesignSelect: React.FC<RoomDesignSelectProps> = ({
  buttonIconSize = 20,
}) => {
  const {
    mode,
    setDrawingMode,
    drawingParams,
    handleImage,
    addEventDetail,
    setShapeParams,
    setGeneralParams,
    setLockRatio,
    handleSelectZone,
    needReloadControl,
  } = useDrawingContext();

  const [modeImage, setModeImage] = useState(false);
  const [modeSelect, setModeSelect] = useState(false);
  const [isBlackWhite, setBlackWhite] = useState(false);
  const dialogRef: MutableRefObject<HTMLDialogElement | null> = useRef(null);

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

      setGeneralParams({
        opacity: 1,
      });
      setLockRatio(true);
      setDrawingMode(DRAWING_MODES.IMAGE);
      needReloadControl();

      // close the dialog box after the file is uploaded
      if (dialogRef.current) {
        dialogRef.current.close();
      }
    }
  };

  return (
    <fieldset
      className={designFieldsetVariants({
        gap: "2",
        className: "relative",
      })}
    >
      <div className="flex absolute right-0 -top-4 justify-end">
        <button
          onClick={() => {
            setModeSelect(false);
            setModeImage(false);
          }}
          className={cn(
            "transition btn btn-sm btn-circle hover:bg-accent border-2 border-secondary",
            {
              hidden: !(modeSelect || modeImage),
            }
          )}
          title="Reset selection modes"
        >
          <X size={16} />
        </button>
      </div>
      <legend className={designLabelVariants({ bold: true })}>
        Files and selection
      </legend>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-3">
          <div
            className={cn("flex flex-row gap-2", {
              hidden: modeSelect || modeImage,
            })}
          >
            <Button
              className={cn("px-2 py-1", {})}
              title="Ctrl+A"
              onClick={() => {
                setModeSelect(true);
                setModeImage(false);
                handleSelectZone();
              }}
            >
              <PiSelectionPlusLight size={buttonIconSize} />
            </Button>

            <Button
              className={cn("px-2 py-1", {})}
              // title="Ctrl+I"
              onClick={() => {
                setModeSelect(false);
                setModeImage(true);
              }}
            >
              <ImageUp size={buttonIconSize} />
            </Button>
          </div>
          {modeSelect && (
            <>
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
            </>
          )}
          {modeImage && (
            <>
              <div>
                {!modeSelect && (
                  <ButtonConfirmModal
                    className="z-10 px-2 text-white bg-blue-500 hover:bg-blue-600"
                    value="Upload image"
                    position="modal"
                    dialogRef={dialogRef}
                  >
                    <div className="flex flex-row">
                      Select a file to upload :
                    </div>
                    <input
                      value=""
                      formMethod="dialog"
                      className={cn(
                        "py-0 pr-2 w-72 text-sm bg-white rounded-md border-2 border-blue-300 h-fit",
                        "file:mr-4 file:rounded-l-md file:border file:bg-blue-500 file:py-2 file:px-2 file:font-semibold file:text-white hover:file:bg-blue-600"
                      )}
                      type="file"
                      onChange={handleFileChange}
                    />
                  </ButtonConfirmModal>
                )}
              </div>
              <Button
                className={cn("px-2 py-1 font-bold", {
                  "text-white bg-gradient-to-r from-green-400 via-blue-500 to-red-600 hover:from-red-700 hover:via-green-500 hover:to-blue-600":
                    !isBlackWhite,
                  "bg-gradient-to-r from-gray-800 to-gray-200 hover:from-black hover:to-white":
                    isBlackWhite,
                })}
                onClick={() => {
                  setBlackWhite(!isBlackWhite);
                  setShapeParams({ blackWhite: !isBlackWhite });
                }}
              >
                <BsCircleHalf />
              </Button>
            </>
          )}
        </div>
        {modeImage && (
          <div className="flex flex-row gap-3">
            <RangeInput
              className="w-20 h-4 bg-gray-300 opacity-70 transition-opacity outline-none hover:opacity-100"
              id="transparency-picker"
              label="Detouring"
              value={drawingParams.shape.transparency || 0}
              min="0"
              max="198"
              step="3"
              onChange={(value) => {
                setShapeParams({ transparency: value });
              }}
              isTouch={false}
            />
            <RangeInput
              className="w-20 h-2 bg-gray-300 opacity-70 transition-opacity outline-none hover:opacity-100"
              id="select-radius-picker"
              label="Radius"
              value={drawingParams.shape.radius || 0}
              min="0"
              max="150"
              step="2"
              onChange={(value) => setShapeParams({ radius: value })}
              isTouch={false}
            />
          </div>
        )}
      </div>
    </fieldset>
  );
};
