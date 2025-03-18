import React from "react";
import { useDrawingContext } from "@/context/DrawingContext";
import { inputSelectVariants } from "@/styles/input-variants";
import {
  designFieldsetVariants,
  designLabelVariants,
} from "@/styles/menu-variants";

interface RoomDesignArrowProps {
  isTouch?: boolean;
}

export const RoomDesignArrow: React.FC<RoomDesignArrowProps> = ({}) => {
  const { setArrowParams, drawingParams } = useDrawingContext();

  const paramsArrow = drawingParams.arrow;

  return (
    <fieldset
      className={designFieldsetVariants({
        gap: "2",
        justify: "between",
        flex: "row",
        className: "px-2 py-1 align-middle",
      })}
    >
      <legend className={designLabelVariants()}>Arrow</legend>

      <div className="flex flex-col gap-0 items-center">
        <label htmlFor="arrow-head-size" className="text-nowrap">
          Head Size
        </label>
        <select
          id="arrow-head-size"
          className={inputSelectVariants({ width: "16" })}
          defaultValue={paramsArrow.headSize ?? 30}
          onChange={(e) =>
            setArrowParams({ headSize: parseInt(e.target.value) })
          }
        >
          <option value="20">X-Small</option>
          <option value="30">Small</option>
          <option value="40">Medium</option>
          <option value="50">Large</option>
          <option value="60">X-Large</option>
        </select>
      </div>
      <div className="flex flex-col gap-0 items-center">
        <label htmlFor="arrow-padding" className="text-nowrap">
          Padding
        </label>
        <select
          id="arrow-padding"
          className={inputSelectVariants({ width: "16" })}
          defaultValue={paramsArrow.padding ?? 5}
          onChange={(e) =>
            setArrowParams({ padding: parseInt(e.target.value) })
          }
        >
          <option value="0">None</option>
          <option value="5">Small</option>
          <option value="15">Medium</option>
          <option value="30">Large</option>
          <option value="40">X-Large</option>
        </select>
      </div>
      <div className="flex flex-col gap-0 items-center">
        <label htmlFor="arrow-curvature" className="text-nowrap">
          Curvature
        </label>
        <select
          id="arrow-curvature"
          className={inputSelectVariants({ width: "16" })}
          defaultValue={(paramsArrow.curvature ?? 0.04) * 100}
          onChange={(e) =>
            setArrowParams({ curvature: parseInt(e.target.value) / 100 })
          }
        >
          <option value="-24">Left 6</option>
          <option value="-20">Left 5</option>
          <option value="-16">Left 4</option>
          <option value="-12">Left 3</option>
          <option value="-8">Left 2</option>
          <option value="-4">Left 1</option>
          <option value="0">Straight</option>
          <option value="4">Right 1</option>
          <option value="8">Right 2</option>
          <option value="12">Right 3</option>
          <option value="16">Right 4</option>
          <option value="20">Right 5</option>
          <option value="24">Right 6</option>
        </select>
      </div>
    </fieldset>
  );
};
