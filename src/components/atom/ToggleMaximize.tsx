import React from "react";

import { Expand, Shrink } from "lucide-react";
import clsx from "clsx";

interface ToggleMaximizeProps {
  className?: string;
  size?: "2xl" | "xl" | "md" | "sm";
  isMaximized: boolean;
  toggleMaximize: () => void;
}
export const ToggleMaximize: React.FC<ToggleMaximizeProps> = ({
  className,
  size,
  isMaximized,
  toggleMaximize,
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
          "bg-blue-700": !isMaximized,
          "bg-green-600": isMaximized,
        }
      )}
      onClick={toggleMaximize}
    >
      {!isMaximized && <Expand size={16} />}
      {isMaximized && <Shrink size={16} />}
    </button>
  );
};
