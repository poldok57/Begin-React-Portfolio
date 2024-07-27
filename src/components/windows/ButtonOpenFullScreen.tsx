import React, { useState, useRef } from "react";
import { Button } from "../atom/Button";
import { Expand } from "lucide-react";

import { FullScreenWindow } from "./FullScreenWindow";

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
interface ButtonFullScreenProps {
  title?: string;
  bgTitle?: string;
  children?: React.ReactNode;
  className?: string;
  value?: string;
}
export const ButtonOpenFullScreen: React.FC<ButtonFullScreenProps> = ({
  title = "Modal",
  bgTitle = undefined,
  children,
  className = "p-2",
  value = null,
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
        {value ? value : <Expand size={16} />}
      </Button>
      {isOpen && (
        <FullScreenWindow
          ref={frameRef}
          referrer={buttonRef}
          title={title}
          bgTitle={bgTitle}
          maximize={true}
          withMinimize={true}
          onClose={() => setIsOpen(false)}
        >
          {children}
        </FullScreenWindow>
      )}
    </>
  );
};
