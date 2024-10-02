import React from "react";

interface AlignmentButtonsProps {
  showVerticalBtn: boolean;
  showHorizontalBtn: boolean;
  equalizeSpaces: (type: "vertical" | "horizontal") => void;
  container: HTMLDivElement | null;
  offsetX: number;
  offsetY: number;
}

export const AlignmentButtons: React.FC<AlignmentButtonsProps> = ({
  showVerticalBtn,
  showHorizontalBtn,
  equalizeSpaces,
  container,
  offsetX,
  offsetY,
}) => {
  const containerRect = container?.getBoundingClientRect();
  if (!containerRect) return null;

  return (
    <>
      {showVerticalBtn && (
        <button
          className="absolute px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1/2 translate-y-1"
          onClick={() => equalizeSpaces("vertical")}
          style={{
            left: containerRect.left - 15 + containerRect.width / 2 + offsetX,
            top: containerRect.top + offsetY,
          }}
        >
          =
        </button>
      )}
      {showHorizontalBtn && (
        <button
          className="absolute px-2 py-1 text-white bg-blue-500 rounded transform -translate-x-1 -translate-y-1/2"
          onClick={() => equalizeSpaces("horizontal")}
          style={{
            left: containerRect.left + offsetX,
            top: containerRect.top - 15 + containerRect.height / 2 + offsetY,
          }}
        >
          =
        </button>
      )}
    </>
  );
};
