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

  return (
    <>
      {showVerticalBtn && (
        <button
          className="absolute z-30 px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1/2 translate-y-1 cursor-pointer"
          onClick={() => {
            equalizeSpaces("vertical");
          }}
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
          className="absolute z-30 px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1 -translate-y-1/2 cursor-pointer"
          onClick={() => {
            equalizeSpaces("horizontal");
          }}
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
