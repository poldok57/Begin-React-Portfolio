import React, { useState, useRef, useEffect } from "react";
import { RectangleVertical } from "lucide-react";
import clsx from "clsx";

interface SelectionItemsProps {
  handleClose: () => void;
  selectedItems: { width: number; height: number } | null;
  setSelectedItems: (_: { width: number; height: number }) => void;
  addTables: () => void;
  Component?: React.FC<{ size: number; className: string }>;
}

export const SelectionItems: React.FC<SelectionItemsProps> = ({
  handleClose,
  selectedItems,
  setSelectedItems,
  addTables,
  Component = RectangleVertical,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showAddBtn, setShowAddBtn] = useState(false);
  const cellSize = 32;
  const eleWidth = selectedItems?.width || 0;
  const eleHeight = selectedItems?.height || 0;
  const width = cellSize * eleWidth;
  const height = cellSize * eleHeight;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleClose]);

  const handleStart = (clientX: number, clientY: number) => {
    const startX = clientX;
    const startY = clientY;
    setShowAddBtn(false);

    const handleMove = (moveX: number, moveY: number) => {
      const newWidth = Math.min(
        Math.max(
          Math.round((eleWidth * cellSize + moveX - startX) / cellSize),
          1
        ),
        12
      );
      const newHeight = Math.min(
        Math.max(
          Math.round((eleHeight * cellSize + moveY - startY) / cellSize),
          1
        ),
        12
      );
      setSelectedItems({
        width: newWidth,
        height: newHeight,
      });
    };

    const handleEnd = () => {
      setShowAddBtn(true);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = handleEnd;
    const handleTouchEnd = handleEnd;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden absolute left-4 top-full z-40 p-4 mt-2 bg-white rounded-lg shadow-lg min-w-40 min-h-40"
      style={{
        width: `${width + 10 + 2 * cellSize}px`,
        height: `${height + 50 + 2 * cellSize}px`,
      }}
    >
      <h2 className="mb-2 font-semibold">New elements</h2>
      <div className="relative w-[384px] h-[384px] bg-white rounded-md overflow-hidden">
        <div className="grid grid-cols-12 w-full h-full grid-rows-12">
          {Array(144)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className={clsx("border border-gray-200", {
                  "opacity-30":
                    index % 12 >= eleWidth ||
                    Math.floor(index / 12) >= eleHeight,
                })}
              >
                <Component
                  size={cellSize / 2}
                  className="w-full h-full text-gray-400"
                />
              </div>
            ))}
        </div>
        <div
          className="absolute top-0 left-0 bg-blue-200 bg-opacity-30 border-2 border-blue-500 border-dashed"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            cursor: "se-resize",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />
        {showAddBtn && (
          <button
            className="absolute btn btn-sm btn-primary"
            style={{
              left: `${width / 3}px`,
              top: `${height + 8}px`,
            }}
            onClick={addTables}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};
