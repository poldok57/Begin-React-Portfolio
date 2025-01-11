import React from "react";
import { RangeInput } from "../atom/RangeInput";
import { MoveUpRight } from "lucide-react";
import { useDrawingContext } from "@/context/DrawingContext";
import { cn } from "@/lib/utils/cn";

interface DrawControlArrowProps {
  isTouch?: boolean;
}

export const DrawControlArrow: React.FC<DrawControlArrowProps> = ({
  isTouch = false,
}) => {
  const { setArrowParams, drawingParams } = useDrawingContext();

  const paramsArrow = drawingParams.arrow;

  return (
    <div
      className={cn([
        "flex flex-row gap-5 px-2 py-1 align-middle border border-secondary",
        "bg-paper",
      ])}
    >
      <div className="flex items-center">
        <MoveUpRight size={28} />
      </div>
      <RangeInput
        id="arrow-head-size"
        label="Head Size"
        value={paramsArrow.headSize ?? 30}
        min="10"
        max="100"
        step="1"
        className="w-24 h-8"
        onChange={(value: number) => setArrowParams({ headSize: value })}
        isTouch={isTouch}
      />
      <RangeInput
        id="arrow-padding"
        label="Padding"
        value={paramsArrow.padding ?? 5}
        min="0"
        max="40"
        step="1"
        className="w-24 h-8"
        onChange={(value: number) => setArrowParams({ padding: value })}
        isTouch={isTouch}
      />
      <RangeInput
        id="arrow-curvature"
        label="Curvature"
        value={(paramsArrow.curvature ?? 0.2) * 100}
        min="-24"
        max="24"
        step="2"
        className="w-24 h-8"
        onChange={(value: number) => setArrowParams({ curvature: value / 100 })}
        isTouch={isTouch}
      />
    </div>
  );
};
