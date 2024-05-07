import React, { useState } from "react";
import { Button } from "../atom/Button";
import { TbRotate2 } from "react-icons/tb";
import { TbRotateClockwise2 } from "react-icons/tb";

import { fontOptions } from "../../lib/canvas/font-family";
import { DRAWING_MODES } from "../../lib/canvas/canvas-defines";
import clsx from "clsx";

export const DrawControlText = ({
  mode,
  hidden,
  drawingParams,
  handleTextParams,
}) => {
  const [italic, setItalic] = useState(drawingParams.text.italic);

  const handleText = (param) => {
    drawingParams.text = { ...drawingParams.text, ...param };
    handleTextParams({ text: drawingParams.text });
  };

  /**
   *  Handle the text rotation
   * @param {number} angle - The angle to rotate the text in grad
   */
  const handleTextRotation = (angle) => {
    const newAngle = drawingParams.text.rotation + (angle * Math.PI) / 200;
    handleText({ rotation: newAngle });
  };

  return (
    <div
      className={clsx("flex flex-col gap-4 border-2 border-secondary p-2", {
        hidden: hidden,
        "bg-paper": mode === DRAWING_MODES.TEXT,
      })}
    >
      <div className="flex flex-row gap-2">
        <label
          htmlFor="text-font-selector"
          className="flex items-center justify-center gap-2"
        >
          Font
          <select
            className="w-32 rounded-md border-2 border-primary bg-paper p-2 focus:ring-blue-500"
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
        <label
          htmlFor="text-size-picker"
          className="flex items-center justify-center gap-2"
        >
          Size
          <input
            className="h-2 w-20 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
            id="text-size-picker"
            type="range"
            defaultValue={drawingParams.text.fontSize}
            min="12"
            max="64"
            step="2"
            onChange={(event) => handleText({ fontSize: event.target.value })}
          />
        </label>
        <label
          htmlFor="text-size-picker"
          className="flex items-center justify-center gap-2"
        >
          Bold
          <input
            className="h-2 w-12 bg-gray-300 opacity-50 outline-none transition-opacity hover:opacity-100"
            id="text-bold-picker"
            type="range"
            defaultValue={drawingParams.text.bold}
            min="100"
            max="900"
            step="100"
            onChange={(event) => handleText({ bold: event.target.value })}
          />
        </label>
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
      <div className="flex flex-row gap-2">
        <label
          htmlFor="text"
          className="flex items-center justify-center gap-2"
        >
          Text
          <input
            id="text"
            type="text"
            className="rounded-md border-2 border-primary bg-paper p-2"
            defaultValue={drawingParams.text.text}
            onChange={(event) => handleText({ text: event.target.value })}
          />
        </label>
        <label
          htmlFor="text-color-picker"
          className="flex items-center justify-center gap-4"
        >
          Color
          <input
            id="text-color-picker"
            type="color"
            defaultValue={drawingParams.text.color}
            onChange={(e) => handleText({ color: e.target.value })}
          />
        </label>
        <Button className="px-3" onClick={() => handleTextRotation(-25)}>
          <TbRotate2 />
        </Button>
        <Button className="px-3" onClick={() => handleTextRotation(25)}>
          <TbRotateClockwise2 />
        </Button>
      </div>
    </div>
  );
};
