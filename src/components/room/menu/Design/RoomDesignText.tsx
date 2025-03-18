import React, { useState } from "react";
import { Button } from "@/components/atom/Button";
import { TbRotate2, TbRotateClockwise2, TbItalic } from "react-icons/tb";

import { fontOptions } from "@/lib/canvas/font-family";
import { useDrawingContext } from "@/context/DrawingContext";
import { cn } from "@/lib/utils/cn";
import { inputSelectVariants } from "@/styles/input-variants";

interface RoomDesignTextProps {
  isTouch?: boolean;
  buttonShapeSize?: number;
  buttonIconSize?: number;
}

export const RoomDesignText: React.FC<RoomDesignTextProps> = ({
  // isTouch = false,
  buttonIconSize = 28,
  buttonShapeSize = 20,
}) => {
  const { drawingParams, setTextParams } = useDrawingContext();

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
    <fieldset
      className={cn("flex flex-col gap-4 p-2 border-2 border-secondary", {})}
    >
      <legend>Text</legend>
      <div className={cn("flex flex-row gap-3 justify-between")}>
        <label
          htmlFor="text-font-selector"
          className="flex flex-col justify-center items-center"
        >
          Font
          <select
            className={inputSelectVariants({
              width: "24",
              appearance: "default",
            })}
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
        <label
          htmlFor="text-size-picker"
          className="flex flex-col justify-center items-center"
        >
          <div>Size</div>
          <select
            id="text-size-picker"
            className={inputSelectVariants({ width: "12" })}
            defaultValue={drawingParams.text.fontSize ?? 16}
            onChange={(e) => {
              const size = Number(e.target.value);
              setTextParams({ fontSize: size });
            }}
          >
            {[
              8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72,
              80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 272,
            ].map((size) => (
              <option key={size} value={size}>
                {size} px
              </option>
            ))}
          </select>
        </label>
        <label
          htmlFor="text-bold-selector"
          className="flex flex-col justify-center items-center"
        >
          Bold
          <select
            id="text-bold-selector"
            className={inputSelectVariants({ width: "14" })}
            defaultValue={drawingParams.text.bold ?? 100}
            onChange={(e) => setTextParams({ bold: Number(e.target.value) })}
          >
            <option value={100}>Normal</option>
            <option value={500}>Semi</option>
            <option value={900}>Bold</option>
          </select>
        </label>
      </div>
      <div className="flex flex-row gap-4 justify-between">
        <label
          htmlFor="text"
          className="flex flex-col justify-start items-start"
        >
          Text
          <input
            id="text"
            type="text"
            className="p-2 w-56 rounded-md border-2 border-primary bg-paper"
            defaultValue={drawingParams.text.text}
            onChange={(event) => setTextParams({ text: event.target.value })}
          />
        </label>
      </div>
      <div className="flex flex-row gap-4 justify-between">
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
    </fieldset>
  );
};
