import React, { useState, useEffect } from "react";
import { inputRangeVariants } from "../../styles/input-variants";
import { RangeInput } from "../atom/RangeInput";
import { Button } from "../atom/Button";
import { ColorPicker } from "../atom/ColorPicker";
import { DRAWING_MODES, ParamsPath } from "@/lib/canvas/canvas-defines";
import { useDrawingContext } from "@/context/DrawingContext";
import { MdTimeline } from "react-icons/md";
import { Spline } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DrawControlLineProps {
  isTouch?: boolean;
}

export const DrawControlLine: React.FC<DrawControlLineProps> = ({
  isTouch = false,
}) => {
  const {
    mode,
    addEventAction,
    handleChangeParams,
    handleChangeMode,
    setPathParams,
    drawingParams,
    isFilled,
    getGeneralColor,
  } = useDrawingContext();
  const paramsPath: ParamsPath = drawingParams.path;
  const [withPathFilled, setWithPathFilledState] = useState(isFilled());

  const setWithPathFilled = (value: boolean) => {
    if (value) {
      const color = getGeneralColor();
      if (paramsPath.opacity === undefined) {
        paramsPath.opacity = 1;
      }
      paramsPath.color = color;
    } else {
      paramsPath.color = undefined;
      paramsPath.opacity = undefined;
    }
    setWithPathFilledState(value);

    handleChangeParams({ path: paramsPath });
  };

  useEffect(() => {
    if (mode === DRAWING_MODES.END_PATH) {
      handleChangeMode(DRAWING_MODES.LINE);

      setWithPathFilledState(false);
    }
  }, [mode]);

  useEffect(() => {
    const filled = isFilled();
    setWithPathFilled(filled);
  }, [isFilled()]);

  return (
    <div
      className={cn([
        "flex flex-row gap-2 px-2 py-1 align-middle border border-secondary",
        "bg-paper",
      ])}
    >
      <Button
        className="px-4 py-1"
        selected={mode == DRAWING_MODES.LINE}
        onClick={() => {
          handleChangeMode(DRAWING_MODES.LINE);
        }}
        title="Draw lines"
      >
        <MdTimeline size="28px" />
      </Button>
      <Button
        className="px-4 py-1"
        selected={mode == DRAWING_MODES.ARC}
        onClick={() => handleChangeMode(DRAWING_MODES.ARC)}
        title="Draw arcs"
      >
        <Spline size={28} />
      </Button>
      <Button
        onClick={() => addEventAction(DRAWING_MODES.STOP_PATH)}
        className="w-16 h-8"
        title="Stop path"
      >
        Stop path
      </Button>
      <Button
        onClick={() => addEventAction(DRAWING_MODES.CLOSE_PATH)}
        className="w-16 h-8"
        title="Close path"
      >
        Close path
      </Button>
      <label
        htmlFor="toggle-border"
        className="flex flex-col gap-2 justify-center items-center p-2 text-sm font-bold"
      >
        {withPathFilled ? "Filled path: " : "Not filled"}
      </label>

      {withPathFilled && (
        <>
          <label
            htmlFor="path-color-picker"
            className="flex flex-col gap-1 justify-center items-center text-sm"
          >
            color
            <ColorPicker
              id="path-color-picker"
              defaultValue={paramsPath.color}
              onChange={(c) => {
                setPathParams({ color: c });
              }}
            />
          </label>
          <RangeInput
            className={inputRangeVariants({
              width: "8",
              size: "xs",
              class: "justify-center mt-2",
            })}
            id="path-opacity-picker"
            label="Opacity"
            value={paramsPath?.opacity ? paramsPath.opacity * 100 : 100}
            min="0"
            max="100"
            step="10"
            onChange={(value: number) => {
              setPathParams({ opacity: value / 100 });
            }}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
        </>
      )}
    </div>
  );
};
