import clsx from "clsx";
import {
  DRAWING_MODES,
  isDrawingAllLines,
  isDrawingSelect,
} from "../../lib/canvas/canvas-defines";
import { ColorPicker } from "../atom/ColorPicker";

export const DrawControlLine = ({
  mode,
  handleParamChange,
  drawingParams,
  opacity,
  setOpacity,
}) => {
  const handleGeneral = (param) => {
    drawingParams.general = { ...drawingParams.general, ...param };
    handleParamChange({ general: drawingParams.general });
  };
  return (
    <div
      className={clsx("flex flex-row gap-4 border border-secondary p-2", {
        "bg-paper": isDrawingAllLines(mode) || mode === DRAWING_MODES.IMAGE,
      })}
    >
      <label
        htmlFor="draw-color-picker"
        className={clsx("flex items-center justify-center gap-3", {
          hidden: isDrawingSelect(mode) || mode === DRAWING_MODES.ERASE,
        })}
      >
        Color
        <ColorPicker
          className="my-0"
          id="draw-color-picker"
          height="40"
          width="40"
          defaultValue={drawingParams.general.color}
          onChange={(color) => handleGeneral({ color: color })}
        />
      </label>
      <label
        htmlFor="draw-size-picker"
        className={clsx(
          "flex flex-col items-center justify-center gap-1 whitespace-nowrap",
          { hidden: isDrawingSelect(mode) }
        )}
      >
        Line width
        <input
          className="h-2 w-24 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
          id="draw-size-picker"
          type="range"
          defaultValue={drawingParams.general.lineWidth}
          min="2"
          max="32"
          step="2"
          onChange={(event) => handleGeneral({ lineWidth: event.target.value })}
        />
      </label>
      <label
        htmlFor="draw-opacity-picker"
        className={clsx("flex flex-col items-center justify-center gap-1", {
          hidden: mode === DRAWING_MODES.SELECT,
        })}
      >
        Opacity
        <input
          className="h-2 w-20 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
          id="draw-size-picker"
          type="range"
          value={opacity}
          min="5"
          max="100"
          step="5"
          onChange={(event) => setOpacity(event.target.value)}
        />
      </label>
    </div>
  );
};
