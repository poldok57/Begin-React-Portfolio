import React, { forwardRef, ForwardedRef } from "react";

import { Button } from "./Button";
import clsx from "clsx";

interface ConfirmationModalProps {
  onClose: () => void;
  onConfirm?: () => void;
  className?: string;
  isModalOpen?: boolean;
  position?: "over" | "under" | "modal";
  children: React.ReactNode;
}
export const ConfirmationModal = forwardRef<
  HTMLDialogElement,
  ConfirmationModalProps
>(function ConfirmationModal(
  { onClose, onConfirm, className, isModalOpen, position, children },
  ref: ForwardedRef<HTMLDialogElement>
) {
  // console.log("ConfirmationModal", { top, left, transform });

  return (
    <dialog
      ref={ref}
      open={isModalOpen}
      className={clsx(
        "shadow-xl animate-in fade-in-50 bg-transparent",
        {
          "absolute -top-1 -translate-y-full": position === "over",
          "absolute  translate-y-12": position === "under",
          modal: position === "modal",
        },
        className
      )}
    >
      <div
        className={clsx(
          "card gap-3 rounded-2xl h-fit border-2 border-red-700 bg-paper px-3 py-2 shadow-xl",
          className
        )}
      >
        <div className="flex flex-col items-center text-lg">{children}</div>
        <div
          className={clsx("flex mt-3", {
            "items-center justify-between": onConfirm !== null,
            "justify-center": onConfirm === null,
          })}
        >
          {onConfirm && (
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={onConfirm}
            >
              Confirm
            </Button>
          )}
          <Button className="bg-red-500 hover:bg-red-600" onClick={onClose}>
            {onConfirm ? "Cancel" : "Close"}
          </Button>
        </div>
      </div>
    </dialog>
  );
});
