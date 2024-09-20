import React from "react";
import { RotateCcw, RotateCw } from "lucide-react";

interface RotationButtonsProps {
  btnSize: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
}

export const RotationButtons: React.FC<RotationButtonsProps> = ({
  btnSize,
  onRotateLeft,
  onRotateRight,
}) => (
  <div className="flex flex-row gap-1 justify-center">
    <button className="btn btn-circle btn-sm" onClick={onRotateLeft}>
      <RotateCcw size={btnSize} />
    </button>
    <button className="btn btn-circle btn-sm" onClick={onRotateRight}>
      <RotateCw size={btnSize} />
    </button>
  </div>
);
