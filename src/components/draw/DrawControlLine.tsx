import React, { useState } from "react";
import clsx from "clsx";
import { inputRangeVariants } from "../../styles/input-variants";
import { RangeInput } from "../atom/RangeInput";
import { Button } from "../atom/Button";
import { ToggleSwitch } from "../atom/ToggleSwitch";
import {
  AllParams,
  DRAWING_MODES,
  GroupParams,
  Params,
} from "@/lib/canvas/canvas-defines";
import { MdTimeline } from "react-icons/md";
import { Spline } from "lucide-react";

interface DrawControlLineProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  handleModeChange: (mode: string) => void;
  addEventAction: (action: string) => void;
  drawingParams: AllParams;
  isTouch?: boolean;
}

export const DrawControlLine: React.FC<DrawControlLineProps> = ({
  mode,
  handleParamChange,
  handleModeChange,
  addEventAction,
  drawingParams,
  isTouch = false,
}) => {
  const [withPathFilled, setWithPathFilled] = useState(false);
  const [withPath, setWithPath] = useState(false);
  const handlePath = (param: Params) => {
    drawingParams.path = { ...drawingParams.path, ...param };
    handleParamChange({ path: drawingParams.path });
  };
  return (
    <div
      className={clsx(
        [
          "flex flex-row gap-4 px-2 py-1 align-middle border border-secondary",
          "bg-paper",
        ],
        {
          "gap-8": isTouch,
        }
      )}
    >
      <Button
        className="px-5 py-1"
        selected={mode == DRAWING_MODES.LINE}
        onClick={() => {
          handleModeChange(DRAWING_MODES.LINE);
        }}
        title="Draw lines"
      >
        <MdTimeline size="28px" />
      </Button>

      <Button
        className="px-5 py-1"
        selected={mode == DRAWING_MODES.ARC}
        onClick={() => handleModeChange(DRAWING_MODES.ARC)}
        title="Draw arcs"
      >
        <Spline size={28} />
      </Button>
      <Button
        onClick={() => {
          handleModeChange(DRAWING_MODES.PATH);
          setWithPathFilled(false);
          setWithPath(true);
        }}
        className="w-20 h-8"
        title="Start path"
      >
        Start path
      </Button>
      {withPath && (
        <>
          <Button
            onClick={() => addEventAction(DRAWING_MODES.CLOSE_PATH)}
            className="w-20 h-8"
            title="Close path"
          >
            Close path
          </Button>
          <label
            htmlFor="toggle-border"
            className="flex flex-col gap-2 justify-center items-center p-2 text-sm font-bold"
          >
            Filled
            <ToggleSwitch
              id="toggle-border"
              defaultChecked={drawingParams.path.filled}
              onChange={(event) => {
                setWithPathFilled(event.target.checked);
                handlePath({ filled: event.target.checked });
              }}
            />
          </label>
        </>
      )}
      {withPathFilled && (
        <>
          <label
            htmlFor="path-color-picker"
            className="flex flex-col gap-1 justify-center items-center text-sm"
          >
            color
            <input
              id="path-color-picker"
              type="color"
              defaultValue={drawingParams.path.color}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => handlePath({ color: e.target.value })}
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
            value={drawingParams.path.opacity * 100}
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
