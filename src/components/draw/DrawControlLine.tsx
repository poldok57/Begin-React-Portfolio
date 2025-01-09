import React, { useState, useEffect } from "react";
import { inputRangeVariants } from "../../styles/input-variants";
import { RangeInput } from "../atom/RangeInput";
import { Button } from "../atom/Button";
import { ColorPicker } from "../atom/ColorPicker";
import {
  DRAWING_MODES,
  GroupParams,
  Params,
  ParamsPath,
} from "@/lib/canvas/canvas-defines";
import { MdTimeline } from "react-icons/md";
import { Spline } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DrawControlLineProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  handleModeChange: (mode: string) => void;
  addEventAction: (action: string) => void;
  paramsPath: ParamsPath;
  getGeneralColor: () => string;
  isFilled: () => boolean;
  isTouch?: boolean;
}

export const DrawControlLine: React.FC<DrawControlLineProps> = ({
  mode,
  handleParamChange,
  handleModeChange,
  addEventAction,
  paramsPath,
  getGeneralColor,
  isFilled,
  isTouch = false,
}) => {
  const [withPathFilled, setWithPathFilledState] = useState(isFilled());
  const handlePath = (param: Params) => {
    paramsPath = { ...paramsPath, ...param };
    handleParamChange({ path: paramsPath });
  };

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

    handleParamChange({ path: paramsPath });
  };

  useEffect(() => {
    if (mode === DRAWING_MODES.END_PATH) {
      handleModeChange(DRAWING_MODES.LINE);

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
          handleModeChange(DRAWING_MODES.LINE);
        }}
        title="Draw lines"
      >
        <MdTimeline size="28px" />
      </Button>
      <Button
        className="px-4 py-1"
        selected={mode == DRAWING_MODES.ARC}
        onClick={() => handleModeChange(DRAWING_MODES.ARC)}
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
                handlePath({ color: c });
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
              handlePath({ opacity: value / 100 });
            }}
            style={{ width: "50px" }}
            isTouch={isTouch}
          />
        </>
      )}
    </div>
  );
};
