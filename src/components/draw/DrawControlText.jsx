import React, { useState } from "react";
import { Button } from "../atom/Button";
import clsx from "clsx";

export const DrawControlText = ({
  hidden,
  drawingParams,
  handleTextParams,
}) => {
  // const [bold, setBold] = useState(drawingParams.bold);
  const [italic, setItalic] = useState(drawingParams.italic);

  const handleText = (param) => {
    drawingParams.text = { ...drawingParams.text, ...param };
    handleTextParams({ text: drawingParams.text });
  };

  return (
    <div
      className={clsx("flex flex-col gap-4 border-2 border-secondary p-2", {
        hidden: hidden,
      })}
    >
      <div className="flex flex-row gap-2">
        <label
          htmlFor="text-font-selector"
          className="flex items-center justify-center gap-2"
        >
          Font:
          <select
            id="text-font-selector"
            defaultValue={drawingParams.text.font}
            onChange={(event) => handleText({ font: event.target.value })}
          >
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </label>
        <label
          htmlFor="text-size-picker"
          className="flex items-center justify-center gap-2"
        >
          Font size :
          <input
            id="text-size-picker"
            type="range"
            defaultValue={drawingParams.text.fontSize}
            min="12"
            max="64"
            step="2"
            onChange={(event) => handleText({ fontSize: event.target.value })}
            style={{ width: "80px" }}
          />
        </label>
        <label
          htmlFor="text-size-picker"
          className="flex items-center justify-center gap-2"
        >
          Bold :
          <input
            id="text-bold-picker"
            type="range"
            defaultValue={drawingParams.text.bold}
            min="100"
            max="900"
            step="100"
            onChange={(event) => handleText({ bold: event.target.value })}
            style={{ width: "50px" }}
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
