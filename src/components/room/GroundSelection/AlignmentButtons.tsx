import { Coordinate, Rectangle } from "@/lib/canvas/types";
import React from "react";

interface AlignmentButtonsProps {
  showVerticalBtn: boolean;
  showHorizontalBtn: boolean;
  equalizeSpaces: (type: "vertical" | "horizontal") => void;
  getContainerRect: () => Rectangle | null;
  offset: Coordinate;
}

export const AlignmentButtons: React.FC<AlignmentButtonsProps> = ({
  showVerticalBtn,
  showHorizontalBtn,
  equalizeSpaces,
  getContainerRect,
  offset,
}) => {
  const containerRect = getContainerRect();
  if (!containerRect) return null;

  const handleTouch = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
    type: "vertical" | "horizontal"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    equalizeSpaces(type);
  };

  return (
    <>
      {showVerticalBtn && (
        <button
          className="absolute z-50 px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1/2 translate-y-1 cursor-pointer"
          onClick={(e) => handleTouch(e, "vertical")}
          onTouchStart={(e) => handleTouch(e, "vertical")}
          style={{
            left: containerRect.left - 15 + containerRect.width / 2 + offset.x,
            top: containerRect.top + offset.y,
          }}
        >
          =
        </button>
      )}
      {showHorizontalBtn && (
        <button
          className="absolute z-50 px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1 -translate-y-1/2 cursor-pointer"
          onClick={(e) => handleTouch(e, "horizontal")}
          onTouchStart={(e) => handleTouch(e, "horizontal")}
          style={{
            left: containerRect.left + offset.x,
            top: containerRect.top - 15 + containerRect.height / 2 + offset.y,
          }}
        >
          =
        </button>
      )}
    </>
  );
};
