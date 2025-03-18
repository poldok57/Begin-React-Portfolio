import { BiSquare } from "react-icons/bi";
import {
  AiOutlineRadiusUpright,
  AiOutlineRadiusBottomright,
} from "react-icons/ai";
import { WiMoonFirstQuarter } from "react-icons/wi";
import { Button } from "../../../atom/Button";
import { RangeInput } from "../../../atom/RangeInput";
import ToggleSwitch from "../../../atom/ToggleSwitch";
import { useDrawingContext } from "@/context/DrawingContext";

import {
  DRAWING_MODES,
  isDrawingSelect,
  isDrawingShape,
} from "../../../../lib/canvas/canvas-defines";
import { inputRangeVariants } from "../../../../styles/input-variants";
import { cn } from "@/lib/utils/cn";
import { MdRadioButtonUnchecked } from "react-icons/md";
import { useRoomStore } from "@/lib/stores/room";
interface RoomDesignShapeProps {
  isTouch?: boolean;
  buttonShapeSize?: number;
  buttonIconSize?: number;
}

export const RoomDesignShape: React.FC<RoomDesignShapeProps> = ({
  isTouch = false,
  buttonShapeSize = 20,
}) => {
  const {
    mode,
    drawingParams,
    handleChangeMode,
    setShapeParams,
    needReloadControl,
  } = useDrawingContext();
  const { getCtxTemporary } = useRoomStore();

  const btnClassName = "px-2 py-1";
  const paramsShape = drawingParams.shape;

  const handleWithText = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShapeParams({ withText: event.target.checked });
    needReloadControl();
  };

  const handleChangeModeWithEvent = (
    event: React.MouseEvent<HTMLButtonElement>,
    mode: string
  ) => {
    const parentElement = event.currentTarget.parentElement;
    const rect =
      parentElement?.getBoundingClientRect() ??
      event.currentTarget.getBoundingClientRect();

    // Determine if menu should appear on left or right based on canvas center
    const ctxTemporary = getCtxTemporary();
    const canvasWidth = ctxTemporary?.canvas.width ?? window.innerWidth;
    const margin = 20;
    const positionX =
      rect.left > canvasWidth / 2
        ? Math.round(rect.left - margin) // Position left of container
        : Math.round(rect.right + margin); // Position right of container

    handleChangeMode(mode, {
      x: positionX,
      y: Math.round(event.clientY),
    });
  };

  return (
    <>
      <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-secondary">
        <legend>Square and ellipse</legend>
        <div className="flex flex-row gap-3">
          <div className="flex flex-row gap-2 justify-between w-full">
            <Button
              className={btnClassName}
              selected={mode == DRAWING_MODES.CIRCLE}
              onClick={(event) =>
                handleChangeModeWithEvent(event, DRAWING_MODES.CIRCLE)
              }
            >
              <MdRadioButtonUnchecked size={buttonShapeSize} />
            </Button>

            <Button
              className={btnClassName}
              selected={mode == DRAWING_MODES.SQUARE}
              onClick={(event) =>
                handleChangeModeWithEvent(event, DRAWING_MODES.SQUARE)
              }
            >
              <BiSquare size={buttonShapeSize} />
            </Button>

            <Button
              className={btnClassName}
              selected={mode == DRAWING_MODES.ONE_RADIUS_T}
              onClick={(event) =>
                handleChangeModeWithEvent(event, DRAWING_MODES.ONE_RADIUS_T)
              }
            >
              <AiOutlineRadiusUpright size={buttonShapeSize} />
            </Button>
            <Button
              className={btnClassName}
              selected={mode == DRAWING_MODES.ONE_RADIUS_B}
              onClick={(event) =>
                handleChangeModeWithEvent(event, DRAWING_MODES.ONE_RADIUS_B)
              }
            >
              <AiOutlineRadiusBottomright size={buttonShapeSize} />
            </Button>
            <Button
              className={btnClassName}
              selected={mode == DRAWING_MODES.TWO_RADIUS}
              onClick={(event) =>
                handleChangeModeWithEvent(event, DRAWING_MODES.TWO_RADIUS)
              }
            >
              <WiMoonFirstQuarter size={buttonShapeSize} />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div
            className={cn("mt-1 flex flex-row border-secondary px-2", {
              hidden: !isDrawingShape(mode) && !isDrawingSelect(mode),
              "gap-4": isTouch,
            })}
          >
            <label
              htmlFor="toggle-border"
              className="flex flex-col gap-1 justify-center items-center p-2 text-sm font-bold text-nowrap"
            >
              Border
              <ToggleSwitch
                id="toggle-border"
                defaultChecked={paramsShape.withBorder}
                onChange={(event) => {
                  setShapeParams({ withBorder: event.target.checked });
                  needReloadControl();
                }}
              />
            </label>
            {!isDrawingSelect(mode) && (
              <label
                htmlFor="toggle-text"
                className={cn(
                  "flex flex-col gap-1 justify-center items-center p-2 font-bold text-nowrap",
                  {
                    hidden: !isDrawingShape(mode),
                  }
                )}
              >
                Text
                <ToggleSwitch
                  id="toggle-text"
                  defaultChecked={paramsShape.withText}
                  onChange={(event) => handleWithText(event)}
                />
              </label>
            )}
            <div className="flex flex-row gap-2 p-2">
              {isDrawingShape(mode) && mode !== DRAWING_MODES.CIRCLE && (
                <RangeInput
                  className={inputRangeVariants({
                    width: "16",
                    size: "xs",
                  })}
                  id="draw-radius-picker"
                  label="Radius"
                  value={paramsShape.radius || 0}
                  min="0"
                  max="50"
                  step="2"
                  onChange={(value) => setShapeParams({ radius: value })}
                  isTouch={false}
                />
              )}
            </div>
          </div>
        </div>
      </fieldset>
    </>
  );
};
