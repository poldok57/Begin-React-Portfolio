import React from "react";

import { Minus, BookUp } from "lucide-react";

import {
  buttonMinimizeVariants,
  iconSizeConvertion,
  type IconSize,
} from "../../styles/button-variants";

interface ToggleMinimizeProps {
  className?: string;
  size?: IconSize;
  isMinimized: boolean;
  toggleMinimize: () => void;
}
export const ToggleMinimize: React.FC<ToggleMinimizeProps> = ({
  className,
  size = "md",
  isMinimized,
  toggleMinimize,
  ...props
}) => {
  const iconSize = iconSizeConvertion(size);
  return (
    <button
      {...props}
      className={buttonMinimizeVariants({ size, isMinimized, className })}
      onClick={toggleMinimize}
    >
      {isMinimized && <BookUp size={iconSize} />}
      {!isMinimized && <Minus size={iconSize} />}
    </button>
  );
};
