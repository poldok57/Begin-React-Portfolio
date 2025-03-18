import React, { useEffect, useState } from "react";
import { MdLineWeight, MdOpacity } from "react-icons/md";
import { CgDisplaySpacing } from "react-icons/cg";

import { RangeInput } from "../../../atom/RangeInput";
import { ColorPicker } from "../../../atom/ColorPicker";
import { useDrawingContext } from "@/context/DrawingContext";

import {
  isDrawingSelect,
  isDrawingShape,
} from "../../../../lib/canvas/canvas-defines";
import {
  inputRangeVariants,
  inputSelectVariants,
} from "../../../../styles/input-variants";
import {
  designFieldsetVariants,
  designLabelVariants,
} from "@/styles/menu-variants";

interface RoomDesignBorderProps {
  isTouch?: boolean;
  buttonIconSize?: number;
}

export const RoomDesignBorder: React.FC<RoomDesignBorderProps> = ({
  isTouch = false,
  buttonIconSize = 20,
}) => {
  const {
    mode,
    drawingParams,
    // addEventAction,
    setBorderParams,
    needRefresh,
  } = useDrawingContext();

  const paramsBorder = drawingParams.border;
  const [withBorder, setWithBorder] = useState(drawingParams.shape.withBorder);

  useEffect(() => {
    setWithBorder(drawingParams.shape.withBorder);
  }, [drawingParams.shape.withBorder]);

  return (
    <>
      {withBorder && (isDrawingShape(mode) || isDrawingSelect(mode)) && (
        <fieldset
          className={designFieldsetVariants({
            gap: isTouch ? "4" : "2",
            flex: "row",
          })}
        >
          <legend className={designLabelVariants()}>Border</legend>

          <label
            htmlFor="border-color-picker"
            className="flex flex-col gap-1 justify-center items-center text-sm font-bold"
          >
            color
            <ColorPicker
              id="border-color-picker"
              width={40}
              defaultValue={paramsBorder.color}
              onChange={(color) => setBorderParams({ color: color })}
            />
          </label>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="line-width-select" className="text-center">
              <MdLineWeight size={buttonIconSize} />
            </label>
            <select
              id="line-width-select"
              className={inputSelectVariants({ width: "18" })}
              value={paramsBorder.lineWidth}
              onChange={(e) => {
                // console.log("lineWidth", e.target.value);
                paramsBorder.lineWidth = Number(e.target.value);
                setBorderParams({ lineWidth: Number(e.target.value) });
                needRefresh();
              }}
            >
              {[
                2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36,
                40,
              ].map((width) => (
                <option key={width} value={width}>
                  {width} px
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <label htmlFor="interval-select" className="text-center">
              <CgDisplaySpacing size={buttonIconSize} />
            </label>
            <select
              id="interval-select"
              className={inputSelectVariants({ width: "18" })}
              value={paramsBorder.interval || 0}
              onChange={(e) => {
                paramsBorder.interval = Number(e.target.value);
                setBorderParams({ interval: Number(e.target.value) });
                needRefresh();
              }}
            >
              {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map((interval) => (
                <option key={interval} value={interval}>
                  {interval} px
                </option>
              ))}
            </select>
          </div>
          <RangeInput
            className={inputRangeVariants({ width: "8", size: "xs" })}
            id="border-opacity-picker"
            label={<MdOpacity size={16} />}
            value={paramsBorder.opacity * 100}
            min="0"
            max="100"
            step="10"
            onChange={(value) => setBorderParams({ opacity: value / 100 })}
            style={{ width: "50px" }}
            isTouch={false}
          />
        </fieldset>
      )}
    </>
  );
};
