import clsx from "clsx";
import { DRAWING_MODES } from "./Draw";
export const DrawControlLine = ({ mode, handleParamChange, drawingParams }) => {
  const handleColorChange = (event) => {
    handleParamChange({ color: event.target.value });
  };
  const handleSizeChange = (event) => {
    handleParamChange({ lineWidth: event.target.value });
  };
  const handleOpacityChange = (event) => {
    handleParamChange({ opacity: event.target.value });
  };

  return (
    <div
      className={clsx("flex flex-row gap-4 border border-secondary p-2", {
        "bg-paper": mode === DRAWING_MODES.LINE || mode === DRAWING_MODES.DRAW,
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
          defaultValue={drawingParams.color}
          onChange={handleColorChange}
        />
      </label>
      <label
        htmlFor="draw-size-picker"
        className="flex items-center justify-center gap-4"
      >
        Line width
        <input
          className="h-2 w-24 bg-gray-300 opacity-70 outline-none transition-opacity hover:opacity-100"
          id="draw-size-picker"
          type="range"
          defaultValue={drawingParams.lineWidth}
          min="2"
          max="32"
          step="2"
          onChange={handleSizeChange}
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
          defaultValue={drawingParams.opacity * 100}
          min="5"
          max="100"
          step="5"
          onChange={handleOpacityChange}
        />
      </label>
    </div>
  );
};
