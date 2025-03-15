import { CircleCheckBig, CircleX } from "lucide-react";
import { useEffect } from "react";
import clsx from "clsx";
export const VALIDATION_ID = {
  FRAME: "validation-frame",
  BUTTON: "validation-button",
  CANCEL: "validation-cancel",
  TEXT: "validation-text",
};

import { RectPosition, Rectangle } from "@/lib/canvas/types";
import { isTouchDevice } from "@/lib/utils/device";

let validationCancelAction: null | (() => void) = null;
let validationValidAction: null | (() => void) = null;

export const addValidationText = (text: string) => {
  const validText = document.getElementById(VALIDATION_ID.TEXT);
  if (validText) {
    validText.textContent = text;
  }
};

export const addValidationCancelAction = (action: () => void) => {
  validationCancelAction = action;
};

export const addValidationValidAction = (action: () => void) => {
  validationValidAction = action;
};

export const showValidationFrame = (
  newPosition?: RectPosition | Rectangle,
  validationText?: string
) => {
  const frame = document.getElementById(VALIDATION_ID.FRAME);
  if (frame) {
    frame.classList.remove("hidden");
    if (newPosition) {
      frame.style.left = newPosition.left + "px";
      frame.style.top = Math.max(newPosition.top, 0) + "px";
    }
    if (validationText) {
      addValidationText(validationText);
    }
  }
};

export const hideValidationFrame = () => {
  const frame = document.getElementById(VALIDATION_ID.FRAME);
  if (frame) {
    frame.classList.add("hidden");
  }
  if (validationCancelAction) {
    validationCancelAction = null;
  }
  if (validationValidAction) {
    validationValidAction = null;
  }
};

export const ValidationFrame = ({
  btnSize = 20,
  children,
}: {
  btnSize: number;
  children?: React.ReactNode;
}) => {
  const isTouch = isTouchDevice();
  // Function to hide the frame when clicking outside of it
  const onClickOutside = (event: MouseEvent) => {
    const frame = document.getElementById(VALIDATION_ID.FRAME);
    if (frame && !frame.contains(event.target as Node)) {
      hideValidationFrame();
    }
  };

  const handleCancel = () => {
    if (validationCancelAction) {
      validationCancelAction();
    }
    hideValidationFrame();
  };

  const handleValid = () => {
    if (validationValidAction) {
      validationValidAction();
    }
    hideValidationFrame();
  };

  // Add event listener to handle clicks outside the frame
  useEffect(() => {
    // Function to hide the frame when pressing the Escape key
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCancel();
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === "Enter") {
        handleValid();
      }
    };

    // Add event listener to handle Escape key press
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <div
      id={VALIDATION_ID.FRAME}
      className="hidden z-50 justify-center p-3 text-center bg-white rounded-lg shadow-lg max-w-72"
      style={{ left: "0px", top: "0px", position: "absolute" }}
    >
      <div id={VALIDATION_ID.TEXT} className="mb-2 text-center">
        {children}
      </div>
      <div className="flex gap-3 justify-center">
        <button
          id={VALIDATION_ID.BUTTON}
          className={clsx(
            "px-3 py-1 text-white bg-green-500 rounded",
            "hover:bg-green-600",
            { "btn-lg": isTouch }
          )}
          onClick={(e) => {
            e.preventDefault();
            handleValid();
          }}
        >
          <CircleCheckBig size={btnSize} />
        </button>

        <button
          id={VALIDATION_ID.CANCEL}
          className={clsx(
            "px-3 py-1 text-white bg-red-500 rounded",
            "hover:bg-red-600",
            { "btn-lg": isTouch }
          )}
          onClick={(e) => {
            e.preventDefault();
            handleCancel();
          }}
        >
          <CircleX size={btnSize} />
        </button>
      </div>
    </div>
  );
};
