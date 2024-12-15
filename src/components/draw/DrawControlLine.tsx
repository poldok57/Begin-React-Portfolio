import React, { useState, useEffect } from "react";
import { inputRangeVariants } from "../../styles/input-variants";
import { RangeInput } from "../atom/RangeInput";
import { Button } from "../atom/Button";
import { ToggleSwitch } from "../atom/ToggleSwitch";
import { ColorPicker } from "../atom/ColorPicker";
import {
  DRAWING_MODES,
  GroupParams,
  Params,
  ParamsArrow,
  ParamsPath,
} from "@/lib/canvas/canvas-defines";
import { MdTimeline } from "react-icons/md";
import { MoveUpRight } from "lucide-react";
import { Spline } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DrawControlLineProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  handleModeChange: (mode: string) => void;
  addEventAction: (action: string) => void;
  paramsPath: ParamsPath;
  paramsArrow: ParamsArrow;

  isTouch?: boolean;
}

export const DrawControlLine: React.FC<DrawControlLineProps> = ({
  mode,
  handleParamChange,
  handleModeChange,
  addEventAction,
  paramsPath,
  paramsArrow,
  isTouch = false,
}) => {
  const [withPathFilled, setWithPathFilled] = useState(paramsPath.filled);
  const handlePath = (param: Params) => {
    paramsPath = { ...paramsPath, ...param };
    handleParamChange({ path: paramsPath });
  };
  const handleArrow = (param: ParamsArrow) => {
    paramsArrow = { ...paramsArrow, ...param };
    handleParamChange({ arrow: paramsArrow });
  };
  useEffect(() => {
    if (mode === DRAWING_MODES.END_PATH) {
      handleModeChange(DRAWING_MODES.LINE);

      setWithPathFilled(false);
    }
  }, [mode]);

  useEffect(() => {
    setWithPathFilled(paramsPath.filled);
  }, [paramsPath.filled]);

  return (
    <>
      {mode == DRAWING_MODES.ARROW && (
        <div
          className={cn([
            "flex flex-row gap-5 px-2 py-1 align-middle border border-secondary",
            "bg-paper",
          ])}
        >
          <div className="flex items-center">
            <MoveUpRight size={28} />
          </div>
          <RangeInput
            id="arrow-head-size"
            label="Head Size"
            value={paramsArrow.headSize ?? 30}
            min="10"
            max="100"
            step="1"
            className="w-24 h-8"
            onChange={(value: number) => handleArrow({ headSize: value })}
            isTouch={isTouch}
          />
          <RangeInput
            id="arrow-padding"
            label="Padding"
            value={paramsArrow.padding ?? 5}
            min="0"
            max="40"
            step="1"
            className="w-24 h-8"
            onChange={(value: number) => handleArrow({ padding: value })}
            isTouch={isTouch}
          />
          <RangeInput
            id="arrow-curvature"
            label="Curvature"
            value={(paramsArrow.curvature ?? 0.2) * 100}
            min="-25"
            max="25"
            step="2"
            className="w-24 h-8"
            onChange={(value: number) =>
              handleArrow({ curvature: value / 100 })
            }
            isTouch={isTouch}
          />
        </div>
      )}
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
        <>
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
            Filled
            <ToggleSwitch
              id="toggle-border"
              defaultChecked={withPathFilled}
              onChange={(event) => {
                setWithPathFilled(event.target.checked);
                handlePath({ filled: event.target.checked });
              }}
            />
          </label>
        </>

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
                onChange={(c) => handlePath({ color: c })}
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
              value={paramsPath.opacity * 100}
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
    </>
  );
};
