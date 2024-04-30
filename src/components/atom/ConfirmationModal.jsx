import { Button } from "./Button";
import { useRef } from "react";
import clsx from "clsx";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm = null,
  referrer = null,
  children,
}) => {
  const ref = useRef(null);
  if (!isOpen) return null;

  const rect =
    referrer && referrer.current
      ? referrer.current.getBoundingClientRect()
      : null;

  // for unedfined referrer, modal will be in the center of the screen
  let top = "20%",
    left = "50%",
    transform = "translate(-50%, -50%)";

  if (rect) {
    if (rect.top > 200) {
      // Modal over the referrer
      transform = "translate(-50%, -100%)";
      top = rect.top - 5;
    } else {
      // Modal under the referrer
      transform = "translate(-50%, 0)";
      top = rect.top + rect.height + 5;
    }

    left = rect.left + rect.width / 2;

    left = `${Math.floor(left)}px`;
    top = `${Math.floor(top)}px`;
  }

  // console.log("ConfirmationModal", { top, left, transform });

  return (
    <div
      ref={ref}
      className="z-50 gap-3 rounded-lg border-2 border-red-700 bg-paper p-4 shadow-xl"
      style={{
        position: "fixed",
        left: left,
        top: top,
        width: "280px",
        height: "fit-content",
        maxHeight: "200px",
        transform: transform,
      }}
    >
      <div className="mb-5 flex flex-col items-center gap-2 text-lg">
        {children}
      </div>
      <div
        className={clsx("flex", {
          "items-center justify-between": onConfirm !== null,
          "justify-center": onConfirm === null,
        })}
      >
        {onConfirm && (
          <Button className="bg-green-500" onClick={onConfirm}>
            Confirm
          </Button>
        )}
        <Button className="bg-red-500" onClick={onClose}>
          {onConfirm ? "Cancel" : "Close"}
        </Button>
      </div>
    </div>
  );
};
