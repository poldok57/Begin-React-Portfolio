import clsx from "clsx";
import { isDrawingAllLines } from "../../lib/canvas/canvas-defines";

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
        "bg-paper": isDrawingAllLines(mode),
      })}
    >
      <label
        htmlFor="draw-color-picker"
        className="flex items-center justify-center gap-4"
      >
        Color
        <input
          id="draw-color-picker"
          type="color"
          defaultValue={drawingParams.general.color}
          onChange={(event) => handleGeneral({ color: event.target.value })}
        />
      </label>
      <label
        htmlFor="draw-size-picker"
        className="flex items-center justify-center gap-4 whitespace-nowrap"
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
        className="flex items-center justify-center gap-4"
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
