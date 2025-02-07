import { useRef, useEffect } from "react";
import { useDrawingContext } from "@/context/DrawingContext";
import { DRAWING_MODES, isDrawingSelect } from "@/lib/canvas/canvas-defines";

export const useControlKeyboard = (isTouch: boolean) => {
  const {
    setDrawingMode,
    mode,
    addEventAction,
    handleChangeMode,
    setLockRatio,
  } = useDrawingContext();

  const modeRef = useRef(mode);

  const handleImage = (mode: string) => {
    setDrawingMode(DRAWING_MODES.IMAGE);
    addEventAction(mode);
  };

  const handleSelectZone = () => {
    if (mode !== DRAWING_MODES.SELECT) {
      // active selection mode
      handleChangeMode(DRAWING_MODES.SELECT);
      setLockRatio(false);
      return;
    }
    // reselect zone
    addEventAction(DRAWING_MODES.SELECT_AREA);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "Escape":
        addEventAction(DRAWING_MODES.ABORT);
        break;
      case "Enter":
        console.log("Enter -> actionValid");
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

    if (isTouch) {
      // touch device, no keyboard events
      return;
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, isTouch]);
};
