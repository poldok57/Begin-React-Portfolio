import React, { useState, forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Simple button for the application
 *
 * @param props All props that a button can take
 * @param children Children of the button
 * @param className Class name of the button
 * @returns {JSX.Element}
 * @constructor
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, disabled, selected, className, ...props }, ref) {
    const [isSelected, setIsSelected] = useState(selected || false);
    const [isDisabled, setIsDisabled] = useState(disabled || false);
    const [lastChildren, setLastChildren] = useState(children);

    useEffect(() => {
      setIsSelected(selected || false);
      setIsDisabled(disabled || false);
      setLastChildren(children);
    }, [disabled, selected, children]);

    return (
      <button
        ref={ref}
        className={cn(
          "inline-block text-sm font-medium text-white rounded transition btn btn-primary",
          "disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600",
          className,
          {
            "focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50":
              !isSelected,
            "ring-4 ring-opacity-80 outline-double ring-secondary": isSelected,
            "hover:scale-105 hover:shadow-xl": !isDisabled,
            "active:bg-primary active:opacity-80": !isDisabled,
          }
        )}
        disabled={isDisabled}
        {...props}
      >
        {lastChildren}
      </button>
    );
  }
);
