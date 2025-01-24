import React, { useState } from "react";
import { Button } from "../atom/Button";
import { RangeInput } from "../atom/RangeInput";
import { TbRotate2, TbRotateClockwise2, TbItalic } from "react-icons/tb";

import { fontOptions } from "../../lib/canvas/font-family";
import { DRAWING_MODES } from "../../lib/canvas/canvas-defines";
import { useDrawingContext } from "@/context/DrawingContext";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";

interface DrawControlTextProps {
  hidden: boolean;
  isTouch?: boolean;
  buttonShapeSize?: number;
  buttonIconSize?: number;
}

export const DrawControlText: React.FC<DrawControlTextProps> = ({
  hidden,
  isTouch = false,
  buttonIconSize = 28,
  buttonShapeSize = 20,
}) => {
  const { mode, drawingParams, setTextParams } = useDrawingContext();

  const [italic, setItalic] = useState(drawingParams.text.italic);

  /**
   *  Handle the text rotation
   * @param {number} angle - The angle to rotate the text in degrees
   */
  const handleTextRotation = (angle: number) => {
    const newAngle = (drawingParams.text.rotation + angle + 360) % 360;
    drawingParams.text.rotation = newAngle;
    setTextParams({ rotation: newAngle });
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
            onChange={(event) => setTextParams({ font: event.target.value })}
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
          onChange={(value) => setTextParams({ fontSize: value })}
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
          onChange={(value) => setTextParams({ bold: value * 100 })}
          label="Bold"
          isTouch={isTouch}
        />
        <Button
          className="px-2"
          selected={italic}
          onClick={() => {
            const i = !italic;
            setItalic(i);
            setTextParams({ italic: i });
          }}
        >
          <TbItalic size={buttonIconSize} />
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
            onChange={(event) => setTextParams({ text: event.target.value })}
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
            onChange={(e) => setTextParams({ color: e.target.value })}
          />
        </label>
        <div className="flex flex-row gap-3">
          <Button
            className="px-3 py-1"
            onClick={() => handleTextRotation(-7.5)}
          >
            <TbRotate2 size={buttonShapeSize} />
          </Button>
          <Button className="px-3 py-1" onClick={() => handleTextRotation(7.5)}>
            <TbRotateClockwise2 size={buttonShapeSize} />
          </Button>
        </div>
      </div>
    </div>
  );
};
