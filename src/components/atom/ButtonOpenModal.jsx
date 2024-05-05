import { useState, useRef } from "react";
import { Button } from "./Button";

import { FullScreenModal } from "./FullScreenModal";

/**
 * ButtonOpenModal component open a full screen modal
 * @param {string} title - The title of the modal
 * @param {string} bgTitle - The background color of the title bar
 * @param {string} children - The content of the modal
 * @param {string} className - The CSS class name for button
 * @param {string} value - The value of the button
 * @param {object} props - The props of the button
 * @returns {JSX.Element}
 */
export const ButtonOpenModal = ({
  title = "Modal",
  bgTitle = null,
  children,
  className = "h-24 text-lg",
  value = "Open Modal",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const frameRef = useRef(null);

  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(true);
        }}
        selected={isOpen}
        className={className}
        {...props}
      >
        {value}
      </Button>
      {isOpen && (
        <FullScreenModal
          ref={frameRef}
          referrer={buttonRef}
          isOpen={isOpen}
          title={title}
          bgTitle={bgTitle}
          onClose={() => setIsOpen(false)}
        >
          {children}
        </FullScreenModal>
      )}
    </>
  );
};
