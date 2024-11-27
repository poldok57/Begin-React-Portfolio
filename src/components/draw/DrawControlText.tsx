import React, { useState } from "react";
import { Button } from "../atom/Button";
import { RangeInput } from "../atom/RangeInput";
import { TbRotate2 } from "react-icons/tb";
import { TbRotateClockwise2 } from "react-icons/tb";

import { fontOptions } from "../../lib/canvas/font-family";
import {
  DRAWING_MODES,
  Params,
  GroupParams,
  AllParams,
} from "../../lib/canvas/canvas-defines";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";

interface DrawControlTextProps {
  mode: string;
  hidden: boolean;
  drawingParams: AllParams;
  handleTextParams: (params: GroupParams) => void;
  isTouch?: boolean;
}

export const DrawControlText: React.FC<DrawControlTextProps> = ({
  mode,
  hidden,
  drawingParams,
  handleTextParams,
  isTouch = false,
}) => {
  const [italic, setItalic] = useState(drawingParams.text.italic);

  const handleText = (param: Params) => {
    drawingParams.text = { ...drawingParams.text, ...param };
    handleTextParams({ text: drawingParams.text });
  };

  /**
   *  Handle the text rotation
   * @param {number} angle - The angle to rotate the text in grad
   */
  const handleTextRotation = (angle: number) => {
    const newAngle = (drawingParams.text.rotation + angle + 360) % 360;
    handleText({ rotation: newAngle });
  };

  return (
    <div
      className={clsx("flex flex-col gap-4 border-2 border-secondary p-2", {
        hidden: hidden,
        "bg-paper": mode === DRAWING_MODES.TEXT,
      })}
    >
      <div className={clsx("flex flex-row gap-3 justify-between")}>
        <label
          htmlFor="text-font-selector"
          className="flex gap-2 justify-center items-center"
        >
          Font
          <select
            className="p-2 w-32 rounded-md border-2 border-primary bg-paper focus:ring-blue-500"
            id="text-font-selector"
            defaultValue={drawingParams.text.font}
            onChange={(event) => handleText({ font: event.target.value })}
          >
            {fontOptions.map((font, index) => (
              <option
                key={index}
                value={font}
                style={{ fontFamily: font }}
                className="py-2"
              >
                {font}
              </option>
            ))}
          </select>
        </label>
        <RangeInput
          className={inputRangeVariants({ width: "20", size: "sm" })}
          id="text-size-picker"
          value={drawingParams.text.fontSize}
          onChange={(value) => handleText({ fontSize: value })}
          min="12"
          max="64"
          step="2"
          label="Size"
          isTouch={isTouch}
        />
        <RangeInput
          className={inputRangeVariants({ width: "12", size: "sm" })}
          id="text-bold-picker"
          value={drawingParams.text.bold / 100}
          min="1"
          max="9"
          step="1"
          onChange={(value) => handleText({ bold: value * 100 })}
          label="Bold"
          isTouch={isTouch}
        />
        <Button
          className="px-2"
          selected={italic}
          onClick={() => {
            const i = !italic;
            setItalic(i);
            handleText({ italic: i });
          }}
        >
          Italic
        </Button>
      </div>
      <div className="flex flex-row gap-4 justify-between">
        <label
          htmlFor="text"
          className="flex gap-2 justify-center items-center"
        >
          Text
          <input
            id="text"
            type="text"
            className="p-2 w-72 rounded-md border-2 border-primary bg-paper"
            defaultValue={drawingParams.text.text}
            onChange={(event) => handleText({ text: event.target.value })}
          />
        </label>
        <label
          htmlFor="text-color-picker"
          className="flex flex-col gap-1 justify-center items-center"
        >
          Color
          <input
            id="text-color-picker"
            type="color"
            defaultValue={drawingParams.text.color}
            onChange={(e) => handleText({ color: e.target.value })}
          />
        </label>
        <div className="flex flex-row gap-3">
          <Button className="px-3 py-1" onClick={() => handleTextRotation(-15)}>
            <TbRotate2 size="20px" />
          </Button>
          <Button className="px-3 py-1" onClick={() => handleTextRotation(15)}>
            <TbRotateClockwise2 size="20px" />
          </Button>
        </div>
      </div>
    </div>
  );
};
