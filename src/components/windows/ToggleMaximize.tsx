import React from "react";

import { Expand, Shrink } from "lucide-react";
import {
  buttonMaximizeVariants,
  iconSizeConvertion,
  type IconSize,
} from "../../styles/button-variants";

interface ToggleMaximizeProps {
  className?: string;
  size?: IconSize;
  isMaximized: boolean;
  toggleMaximize: () => void;
}
export const ToggleMaximize: React.FC<ToggleMaximizeProps> = ({
  className,
  size = "md",
  isMaximized,
  toggleMaximize,
  ...props
}) => {
  const iconSize = iconSizeConvertion(size);
  return (
    <button
      {...props}
      className={buttonMaximizeVariants({ size, isMaximized, className })}
      onClick={toggleMaximize}
    >
      {!isMaximized && <Expand size={iconSize} />}
      {isMaximized && <Shrink size={iconSize} />}
    </button>
  );
};
