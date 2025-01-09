import { useRef } from "react";
import { inputRangeVariants } from "@/styles/input-variants";
import { RangeInput } from "@/components/atom/RangeInput";
import { ToggleSwitch } from "@/components/atom/ToggleSwitch";
import { ColorPicker } from "@/components/atom/ColorPicker";
import {
  ParamsGeneral,
  DRAWING_MODES,
  GroupParams,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingSelect,
  Params,
  isDrawingShape,
} from "@/lib/canvas/canvas-defines";
import { cn } from "@/lib/utils/cn";

interface DrawControlGeneralProps {
  mode: string;
  handleParamChange: (params: GroupParams) => void;
  paramsGeneral: ParamsGeneral;
  setGeneralColor: (color: string) => void;
  setFilled: (filled: boolean) => void;
  isTouch?: boolean;
}

export const DrawControlGeneral: React.FC<DrawControlGeneralProps> = ({
  mode,
  handleParamChange,
  paramsGeneral,
  setGeneralColor,
  setFilled,
  isTouch = false,
}) => {
  const paramsGeneralRef = useRef(paramsGeneral);
  const handleGeneral = (param: Params) => {
    paramsGeneralRef.current = { ...paramsGeneralRef.current, ...param };
    handleParamChange({ general: paramsGeneralRef.current });
  };

  return (
    <>
      <div
        className={cn("flex flex-row gap-4 border border-secondary p-2", {
          "bg-paper":
            isDrawingLine(mode) ||
            isDrawingFreehand(mode) ||
            mode === DRAWING_MODES.IMAGE,
          "gap-8": isTouch,
          hidden: mode === DRAWING_MODES.TEXT,
        })}
      >
        <label
          htmlFor="draw-color-picker"
          className={cn("flex items-center justify-center gap-3", {
            hidden: isDrawingSelect(mode) || mode === DRAWING_MODES.ERASE,
          })}
        >
          Color
          <ColorPicker
            className="my-0"
            id="draw-color-picker"
            height={isTouch ? 50 : 40}
            width={isTouch ? 50 : 40}
            defaultValue={paramsGeneral.color}
            onChange={(color) => {
              handleGeneral({ color: color });
              setGeneralColor(color);
            }}
          />
        </label>
        <RangeInput
          id="draw-size-picker"
          label="Line width"
          className={inputRangeVariants({ width: "24", size: "sm" })}
          value={paramsGeneral.lineWidth}
          onChange={(value: number) => handleGeneral({ lineWidth: value })}
          min="2"
          max="32"
          step="2"
          isTouch={isTouch}
        />
        <RangeInput
          className={inputRangeVariants({ width: "20", size: "sm" })}
          label="Opacity"
          id="draw-size-picker"
          value={paramsGeneral.opacity * 100}
          min="5"
          max="100"
          step="5"
          onChange={(value: number) => handleGeneral({ opacity: value / 100 })}
          isTouch={isTouch}
        />
        <label
          htmlFor="toggle-filled"
          className={cn(
            "flex flex-col justify-center items-center font-xs gap-2",
            {
              hidden: !(
                isDrawingShape(mode) ||
                isDrawingLine(mode) ||
                isDrawingFreehand(mode)
              ),
            }
          )}
        >
          Filled
          <ToggleSwitch
            id="toggle-filled"
            defaultChecked={paramsGeneral.filled}
            onChange={(event) => {
              handleGeneral({ filled: event.target.checked });
              setFilled(event.target.checked);
            }}
          />
        </label>
      </div>
    </>
  );
};
