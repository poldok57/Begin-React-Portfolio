import { MdOutlineClose } from "react-icons/md";
import clsx from "clsx";

export const CloseButton = ({ onClick, className, size, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        "z-50 rounded border border-black bg-red-600 text-lg text-white opacity-30 group-hover:opacity-95",
        {
          "text-2xl": size === "2xl",
          "text-xl": size === "xl",
          "text-md": size === "md",
          "text-sm": size === "sm",
        },
        className
      )}
      onClick={onClick}
    >
      <MdOutlineClose />
    </button>
  );
};
