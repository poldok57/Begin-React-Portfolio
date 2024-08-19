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
        "shadow-xl animate-in fade-in-50 bg-transparent z-50",
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
          "gap-3 px-3 py-2 rounded-2xl border-2 border-red-700 shadow-xl card h-fit bg-paper",
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
