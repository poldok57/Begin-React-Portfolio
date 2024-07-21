import React, { useRef } from "react";
import { Button } from "./Button";
import { ConfirmationModal } from "./ConfirmationModal";
import { MutableRefObject } from "react";
import { DialogHTMLAttributes } from "react";

/**
 * ButtonConfirmModal component is a button that opens a confirmation modal when clicked.
 * @param {object} props - The props object for button
 * @param {string} props.value - The value of the button
 * @param {string} props.className - The class name of the button
 * @param {function} props.onConfirm - The function to be called when the confirmation is confirmed
 * @param {function} props.onClose - The function to be called when the confirmation is closed
 * @param {function} props.onOpen - The function to be called when the confirmation is opened
 * @param {object} props.children - The children of the confirmation modal
 * @param {string} props.position - The position of the confirmation modal
 *
 * @returns The ButtonConfirmModal component
 */
interface ButtonConfirmModalProps {
  value: string;
  className?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  onOpen?: () => void;
  dialogRef?: MutableRefObject<HTMLDialogElement | null>;
  children: React.ReactNode;
  isModalOpen?: boolean;
  position?: "over" | "under" | "modal";
}
export const ButtonConfirmModal: React.FC<ButtonConfirmModalProps> = ({
  value,
  children,
  onConfirm,
  onClose,
  onOpen,
  dialogRef,
  className,
  isModalOpen = false,
  position = "over",
  ...props
}) => {
  const ref = useRef(null);
  const localDialogRef: MutableRefObject<HTMLDialogElement | null> =
    useRef(null);

  if (dialogRef) {
    dialogRef.current = localDialogRef.current;
  }

  const handleConfirm = () => {
    onConfirm?.();
    if (localDialogRef.current) {
      localDialogRef.current.close();
    }
  };
  const handleClose = () => {
    onClose?.();
    if (localDialogRef.current) {
      localDialogRef.current.close();
    }
  };
  const handleOpen = () => {
    onOpen?.();
    if (localDialogRef.current) {
      if (position === "modal") {
        localDialogRef.current.showModal();
        return;
      }
      localDialogRef.current.show();
    }
  };

  return (
    <>
      <Button
        ref={ref}
        className={className}
        onClick={() => handleOpen()}
        {...props}
      >
        {value}
      </Button>

      <ConfirmationModal
        ref={localDialogRef}
        onClose={() => handleClose()}
        onConfirm={() => handleConfirm()}
        isModalOpen={isModalOpen}
        position={position}
      >
        {children}
      </ConfirmationModal>
    </>
  );
};
