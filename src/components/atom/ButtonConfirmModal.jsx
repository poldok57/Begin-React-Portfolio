import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { ConfirmationModal } from "./ConfirmationModal";

/**
 * ButtonConfirmModal component is a button that opens a confirmation modal when clicked.
 * @param {object} props - The props object for button
 * @param {string} props.value - The value of the button
 * @param {string} props.className - The class name of the button
 * @param {function} props.onConfirm - The function to be called when the confirmation is confirmed
 * @param {object} props.children - The children of the confirmation modal
 * @returns The ButtonConfirmModal component
 */
export const ButtonConfirmModal = ({
  children,
  onConfirm,
  value,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const handleConfirm = () => {
    onConfirm?.();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        ref={ref}
        className={className}
        onClick={() => setIsOpen(true)}
        {...props}
      >
        {value}
      </Button>
      <ConfirmationModal
        referrer={ref}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onConfirm ? handleConfirm : undefined}
      >
        {children}
      </ConfirmationModal>
    </>
  );
};
