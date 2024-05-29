import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { ConfirmationModal } from "./ConfirmationModal";

/**
 * ButtonConfirmModal component is a button that opens a confirmation modal when clicked.
 * @param {object} props - The props object for button
 * @param {string} props.value - The value of the button
 * @param {string} props.className - The class name of the button
 * @param {function} props.onConfirm - The function to be called when the confirmation is confirmed
 * @param {function} props.onClose - The function to be called when the confirmation is closed
 * @param {function} props.onOpen - The function to be called when the confirmation is opened
 * @param {object} props.children - The children of the confirmation modal
 * @param {string} props.width - The width of the confirmation modal
 * @param {boolean} props.showUnder - The boolean to show the modal under the button
 *
 * @returns The ButtonConfirmModal component
 */
export const ButtonConfirmModal = ({
  children,
  onConfirm,
  onClose,
  onOpen,
  value,
  className,
  width,
  isModalOpen = true,
  showUnder = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleConfirm = () => {
    onConfirm?.();
    setIsOpen(false);
  };
  const handleClose = () => {
    onClose?.();
    setIsOpen(false);
  };
  const handleOpen = () => {
    onOpen?.();
    setIsOpen(true);
  };
  // const close = () => {
  //   setIsOpen(false);
  // };

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
      {isModalOpen && isOpen && (
        <ConfirmationModal
          referrer={ref}
          isOpen={isOpen}
          onClose={() => handleClose()}
          onConfirm={onConfirm ? handleConfirm : undefined}
          width={width}
          showUnder={showUnder}
        >
          {children}
        </ConfirmationModal>
      )}
    </>
  );
};
