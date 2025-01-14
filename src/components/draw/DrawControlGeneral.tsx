import { inputRangeVariants } from "@/styles/input-variants";
import { RangeInput } from "@/components/atom/RangeInput";
import { ToggleSwitch } from "@/components/atom/ToggleSwitch";
import { ColorPicker } from "@/components/atom/ColorPicker";
import { useDrawingContext } from "@/context/DrawingContext";
import {
  DRAWING_MODES,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingSelect,
  isDrawingShape,
} from "@/lib/canvas/canvas-defines";
import { cn } from "@/lib/utils/cn";

interface DrawControlGeneralProps {
  isTouch?: boolean;
}

export const DrawControlGeneral: React.FC<DrawControlGeneralProps> = ({
  isTouch = false,
}) => {
  const { mode, drawingParams, setGeneralParams, setReloadControl } =
    useDrawingContext();

  const paramsGeneral = drawingParams.general;

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
              setGeneralParams({ color: color });
            }}
          />
        </label>
        <RangeInput
          id="draw-size-picker"
          label="Line width"
          className={inputRangeVariants({ width: "24", size: "sm" })}
          value={paramsGeneral.lineWidth}
          onChange={(value: number) => setGeneralParams({ lineWidth: value })}
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
          onChange={(value: number) =>
            setGeneralParams({ opacity: value / 100 })
          }
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
              setGeneralParams({ filled: event.target.checked });
              setReloadControl();
            }}
          />
        </label>
      </div>
    </>
  );
};
