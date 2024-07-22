import { LiaWindowMinimize } from "react-icons/lia";
import { LiaWindowMaximize } from "react-icons/lia";

import React, { useState, useEffect } from "react";

import clsx from "clsx";

interface ToggleMinimizeProps {
  frameMinimize: (minimize: boolean) => void;
  className?: string;
  size?: "2xl" | "xl" | "md" | "sm";
  referrer: React.MutableRefObject<HTMLButtonElement> | null;
}
export const ToggleMinimize: React.FC<ToggleMinimizeProps> = ({
  frameMinimize,
  className,
  size,
  referrer = null,
  ...props
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const btnRef = referrer ? referrer.current : null;

  const toggleMinimize = () => {
    const minimize = !isMinimized;
    setIsMinimized(minimize);
    frameMinimize(minimize);
  };
  useEffect(() => {
    if (!btnRef) return;
    btnRef.addEventListener("mousedown", toggleMinimize);
    return () => {
      btnRef.removeEventListener("mousedown", toggleMinimize);
    };
  });

  return (
    <button
      {...props}
      className={clsx(
        "z-50 rounded border border-black text-lg text-white opacity-30 group-hover:opacity-95",
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
