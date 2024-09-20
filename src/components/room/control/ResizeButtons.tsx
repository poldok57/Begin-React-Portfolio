import React from "react";
import { Minus, Plus } from "lucide-react";

interface ResizeButtonsProps {
  btnSize: number;
  onResizeSmaller: () => void;
  onResizeLarger: () => void;
}

export const ResizeButtons: React.FC<ResizeButtonsProps> = ({
  btnSize,
  onResizeSmaller,
  onResizeLarger,
}) => (
  <div className="flex flex-row gap-1 justify-center">
    <button className="btn btn-circle btn-sm" onClick={onResizeSmaller}>
      <Minus size={btnSize} />
    </button>
    <button className="btn btn-circle btn-sm" onClick={onResizeLarger}>
      <Plus size={btnSize} />
    </button>
  </div>
);
