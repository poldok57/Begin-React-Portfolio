import clsx from "clsx";
import { DRAWING_MODES } from "./Draw";
export const DrawControlLine = ({ mode, handleParamChange, drawingParams }) => {
  const handleGeneral = (param) => {
    drawingParams.general = { ...drawingParams.general, ...param };
    handleParamChange({ general: drawingParams.general });
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
          defaultValue={drawingParams.general.color}
          onChange={(event) => handleGeneral({ color: event.target.value })}
        />
      </label>
      <label
        htmlFor="draw-size-picker"
        className="text-nowrap flex items-center justify-center gap-4"
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
          defaultValue={drawingParams.general.opacity * 100}
          min="5"
          max="100"
          step="5"
          onChange={(event) =>
            handleGeneral({ opacity: parseInt(event.target.value) / 100 })
          }
        />
      </label>
    </div>
  );
};
