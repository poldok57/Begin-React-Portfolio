import React, { useState } from "react";
import { Button } from "../atom/Button";
import { fontOptions } from "../../lib/font-family";
import { DRAWING_MODES } from "./Draw";
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
          Font:
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
          Font size :
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
          Bold :
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
          Text:
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
          Text color :
          <input
            id="text-color-picker"
            type="color"
            defaultValue={drawingParams.text.color}
            onChange={(e) => handleText({ color: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
};
