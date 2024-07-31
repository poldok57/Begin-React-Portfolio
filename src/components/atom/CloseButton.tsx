import { MdOutlineClose } from "react-icons/md";
import clsx from "clsx";
import React, { MouseEventHandler } from "react";

interface CloseButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  size?: "2xl" | "xl" | "md" | "sm" | "xs";
  layout?: "square" | "circle" | "rounded";
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className,
  size = "md",
  layout = "square",
  ...props
}) => {
  return (
    <button
      {...props}
      className={clsx(
        "z-auto rounded border border-black bg-red-600 text-lg text-white",
        {
          "text-2xl": size === "2xl",
          "text-xl": size === "xl",
          "text-md": size === "md",
          "text-sm": size === "sm",
          "text-xs": size === "xs",
          "rounded-full": layout === "circle",
          "rounded-lg": layout === "rounded",
        },
        className
      )}
      onClick={onClick}
    >
      <MdOutlineClose />
    </button>
  );
};
