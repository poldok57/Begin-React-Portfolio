import { Button } from "./Button";
import { useRef } from "react";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  referrer,
  children,
}) => {
  const ref = useRef(null);
  if (!isOpen) return null;

  const rect =
    referrer && referrer.current
      ? referrer.current.getBoundingClientRect()
      : null;

  let top = "20%",
    left = "50%";

  if (rect) {
    top = rect.top > 180 ? rect.top - 180 : rect.top + rect.height + 5;
    left = rect.left + rect.width / 2;

    left = `${Math.floor(left)}px`;
    top = `${Math.floor(top)}px`;
  }

  const transform = rect ? "translate(-50%, 0)" : "translate(-50%, -50%)";

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
      <div className="flex items-center justify-between">
        <Button className="bg-green-500" onClick={onConfirm}>
          Confirm
        </Button>
        <Button className="bg-red-500" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
