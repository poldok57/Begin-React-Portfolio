import { Button } from "./Button";
import { useRef } from "react";
import clsx from "clsx";

export const ConfirmationModal = ({
  onClose,
  onConfirm = null,
  referrer = null,
  className = null,
  showUnder = false,
  width = "280px",
  children,
}) => {
  const ref = useRef(null);

  const rect =
    referrer && referrer.current
      ? referrer.current.getBoundingClientRect()
      : null;

  // for unedfined referrer, modal will be in the center of the screen
  let top = "20%",
    left = "50%",
    transform = "translate(-50%, -50%)";

  if (rect) {
    if (rect.top <= 200 || showUnder) {
      // Modal under the referrer
      transform = "translate(-50%, 0)";
      top = rect.top + rect.height + 5;
    } else {
      // Modal over the referrer
      transform = "translate(-50%, -100%)";
      top = rect.top - 5;
    }

    left = rect.left + rect.width / 2;

    left = `${Math.floor(left)}px`;
    top = `${Math.floor(top)}px`;
  }

  // console.log("ConfirmationModal", { top, left, transform });

  return (
    <div
      ref={ref}
      className={clsx(
        "z-50 gap-3 rounded-lg h-fit border-2 border-red-700 bg-paper px-3 py-2 shadow-xl",
        className
      )}
      style={{
        position: "fixed",
        left: left,
        top: top,
        width: width,
        transform: transform,
      }}
    >
      <div className="flex flex-col items-center text-lg">{children}</div>
      <div
        className={clsx("flex mt-3", {
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
