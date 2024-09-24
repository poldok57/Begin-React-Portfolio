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

export const showValidationFrame = (newPosition?: RectPosition | Rectangle) => {
  const frame = document.getElementById(VALIDATION_ID.FRAME);
  if (frame) {
    frame.classList.remove("hidden");
    if (newPosition) {
      frame.style.left = newPosition.left + "px";
      frame.style.top = Math.max(newPosition.top, 0) + "px";
    }
  }
};

export const ValidationFrame = ({
  btnSize = 20,
  isTouch = false,
  children,
}: {
  btnSize: number;
  isTouch: boolean;
  children?: React.ReactNode;
}) => {
  const hiddenFrame = () => {
    const frame = document.getElementById(VALIDATION_ID.FRAME);
    if (frame) {
      frame.classList.add("hidden");
    }
  };

  // Function to hide the frame when clicking outside of it
  const onClickOutside = (event: MouseEvent) => {
    const frame = document.getElementById(VALIDATION_ID.FRAME);
    if (frame && !frame.contains(event.target as Node)) {
      hiddenFrame();
    }
  };

  // Add event listener to handle clicks outside the frame
  useEffect(() => {
    // Function to hide the frame when pressing the Escape key
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hiddenFrame();
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
          onClick={hiddenFrame}
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
          onClick={hiddenFrame}
        >
          <CircleX size={btnSize} />
        </button>
      </div>
    </div>
  );
};
