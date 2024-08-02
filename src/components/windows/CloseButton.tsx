import { X } from "lucide-react";
import {
  buttonCloseVariants,
  iconSizeConvertion,
  type IconSize,
} from "../../styles/button-variants";
import React, { MouseEventHandler } from "react";

interface CloseButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  size?: IconSize;
  color?:
    | "red"
    | "blue"
    | "green"
    | "darkred"
    | "darkblue"
    | "transparent"
    | "none";
  layout?: "square" | "circle" | "rounded";
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className,
  size = "md",
  color = "red",
  layout = "square",
  ...props
}) => {
  const iconSize = iconSizeConvertion(size);

  return (
    <button
      {...props}
      className={buttonCloseVariants({
        layout,
        color,
        size,
        className,
      })}
      onClick={onClick}
    >
      <X size={iconSize} />
    </button>
  );
};
