import React from "react";

interface SelectionContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  containerId: string;
  rotation: number;
}

export const SelectionContainer: React.FC<SelectionContainerProps> = ({
  containerRef,
  containerId,
  rotation,
}) => {
  return (
    <div
      ref={containerRef}
      id={containerId}
      className="absolute bg-gray-200 bg-opacity-20 border border-gray-500 border-dashed cursor-move"
      style={{
        display: "none",
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
};

export default SelectionContainer;
