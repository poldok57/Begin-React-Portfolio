import React from "react";

import { LiaWindowMinimize } from "react-icons/lia";
import { LiaWindowMaximize } from "react-icons/lia";

import clsx from "clsx";

interface ToggleMinimizeProps {
  className?: string;
  size?: "2xl" | "xl" | "md" | "sm";
  isMinimized: boolean;
  toggleMinimize: () => void;
}
export const ToggleMinimize: React.FC<ToggleMinimizeProps> = ({
  className,
  size,
  isMinimized,
  toggleMinimize,
  ...props
}) => {
  return (
    <button
      {...props}
      className={clsx(
        "z-50 rounded border border-black text-lg text-white",
        className,
        {
          "text-2xl": size === "2xl",
          "text-xl": size === "xl",
          "text-md": size === "md",
          "text-sm": size === "sm",
          "bg-blue-700": !isMinimized,
          "bg-green-600": isMinimized,
        }
      )}
      onClick={toggleMinimize}
    >
      {isMinimized && <LiaWindowMaximize />}
      {!isMinimized && <LiaWindowMinimize />}
    </button>
  );
};
