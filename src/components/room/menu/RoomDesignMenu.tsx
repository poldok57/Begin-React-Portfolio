import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import {
  inputRangeVariants,
  inputSelectVariants,
} from "@/styles/input-variants";
import { ToggleSwitch } from "@/components/atom/ToggleSwitch";

// import { getContrastColor } from "../colors/colors";
import { useRoomStore } from "@/lib/stores/room";
import { Menu } from "../types";
import { menuRoomVariants } from "@/styles/menu-variants";

import { ColorPikerBg } from "@/components/colors/ColorPikerBg";
import {
  DRAWING_MODES,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingSelect,
  isDrawingShape,
  ShapeDefinition,
} from "@/lib/canvas/canvas-defines";
import { useDrawingContext } from "@/context/DrawingContext";
import { useZustandDesignStore } from "@/lib/stores/design";
import { updateParamFromElement } from "@/lib/canvas/updateParamFromElement";

import { cn } from "@/lib/utils/cn";
import { ColorPicker } from "../../atom/ColorPicker";
import { RangeInput } from "../../atom/RangeInput";

import { CaseSensitive, MoveUpRight, Pencil, Search } from "lucide-react";
import { TbTimeline } from "react-icons/tb";
import { MdLineWeight, MdOpacity } from "react-icons/md";

import { RoomDesignLine } from "./RoomDesignLine";
import { RoomDesignShape } from "./RoomDesignShape";
import { RoomDesignBorder } from "./RoomDesignBorder";
import { RoomDesignText } from "./RoomDesignText";
import { RoomDesignArrow } from "./RoomDesignArrow";
import { useControlKeyboard } from "@/components/draw/hooks/useControlKeyboard";
import { RoomDesignSelect } from "./RoomDesignSelect";

interface RoomDesignMenuProps {
  isTouch: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  showList: boolean;
  setShowList: (showList: boolean) => void;
  buttonIconSize?: number;
  buttonShapeSize?: number;
}

export const RoomDesignMenu: React.FC<RoomDesignMenuProps> = ({
  isTouch,
  activeMenu,
  showList,
  setShowList,
  buttonIconSize = 20,
  buttonShapeSize = 16,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({
    top: "100%",
  });
  const selectedElementRef = useRef<string | null>(null);

  const { needRefresh, designStoreName } = useRoomStore();

  const {
    addEventAction,
    mode,
    drawingParams,
    handleChangeMode,
    setGeneralParams,
    setShapeParams,
    setDrawingMode,
    setDrawingParams,
    needReloadControl,
  } = useDrawingContext();

  const paramsGeneral = drawingParams.general;

  const store = useZustandDesignStore(designStoreName);

  const { backgroundColor, getDesignElementLength, selectedDesignElement } =
    store.getState();

  const displayElementsLength = getDesignElementLength();

  const getSelectedDesignElement = store.getState().getSelectedDesignElement;

  const setBackgroundColor = store ? store.getState().setBackgroundColor : null;
  const [background, setBackground] = useState(backgroundColor ?? "#aabbff");

  const onCloseColorPicker = () => {
    setShowColorPicker(false);
    if (setBackgroundColor) {
      setBackgroundColor(background);
    }
    needRefresh();
  };

  useControlKeyboard(isTouch);

  useEffect(() => {
    if (activeMenu === Menu.roomDesign) {
      if (!ref.current) return;
      const rectDiv = ref.current.getBoundingClientRect();
      const menu = document.getElementById("menu-design");
      if (menu) {
        const rect = menu.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          setMenuPosition({
            top: "auto",
            left: "20%",
            bottom: `${rectDiv.top - window.innerHeight + 60}px`,
          });
        } else {
          setMenuPosition({ top: "100%", bottom: "auto" });
        }
      }
    }
  }, [activeMenu]);

  // update controle panel when an element is selected
  useEffect(() => {
    if (
      selectedDesignElement &&
      selectedDesignElement !== selectedElementRef.current &&
      getSelectedDesignElement
    ) {
      const selectedElement: ShapeDefinition | null =
        getSelectedDesignElement() as ShapeDefinition | null;
      if (!selectedElement) {
        return;
      }

      const newMode = updateParamFromElement(setDrawingParams, selectedElement);
      if (newMode) {
        setDrawingMode(newMode);
      }
      needRefresh();
      // alertMessage("selected element changed: " + newMode);
      selectedElementRef.current = selectedDesignElement;
    }
  }, [selectedDesignElement]);

  // console.log("redrawing mode", mode);

  return (
    <>
      <div
        id="menu-design"
        className={menuRoomVariants({ width: 64 })}
        style={menuPosition}
        onMouseEnter={() => addEventAction(DRAWING_MODES.CONTROL_PANEL.IN)}
        onTouchStartCapture={() =>
          addEventAction(DRAWING_MODES.CONTROL_PANEL.IN)
        }
        onMouseLeave={() => addEventAction(DRAWING_MODES.CONTROL_PANEL.OUT)}
        onTouchEndCapture={() =>
          addEventAction(DRAWING_MODES.CONTROL_PANEL.OUT)
        }
      >
        <div className="flex flex-col gap-2 mb-5 border-b-2 border-base-300">
          <div className="flex flex-col">
            <fieldset className="flex flex-col gap-2 items-center p-2 rounded-lg border-2 border-secondary">
              <legend>Background</legend>
              <div
                className="w-11/12 h-6 rounded-md border border-gray-400 cursor-pointer hover:border-gray-500"
                style={{ backgroundColor: background }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker(!showColorPicker);
                }}
              />
              {showColorPicker && (
                <ColorPikerBg
                  isTouchDevice={isTouch}
                  className="relative z-10 p-2 rounded-lg border border-gray-400 shadow-xl bg-base-100"
                  title="Background Color"
                  closeColorPicker={onCloseColorPicker}
                  color={background}
                  setColor={setBackground}
                />
              )}
            </fieldset>
          </div>
          <div
            className={cn("flex flex-row", {
              hidden: mode === DRAWING_MODES.TEXT,
            })}
          >
            <fieldset className="flex flex-row gap-2 justify-between p-2 w-full rounded-lg border-2 border-secondary">
              <label
                htmlFor="draw-color-picker"
                className={cn("flex items-center justify-center gap-", {
                  hidden: isDrawingSelect(mode) || mode === DRAWING_MODES.ERASE,
                })}
              >
                <ColorPicker
                  className="my-0"
                  id="draw-color-picker"
                  height={isTouch ? 50 : 40}
                  width={40}
                  defaultValue={paramsGeneral.color}
                  onChange={(color) => {
                    setGeneralParams({ color: color });
                    if (isDrawingSelect(mode)) {
                      setShapeParams({ blackChangeColor: color });
                    }
                  }}
                />
              </label>
              <div className="flex flex-col gap-1 items-center">
                <label htmlFor="line-width-select" className="text-center">
                  <MdLineWeight size={16} />
                </label>
                <select
                  id="line-width-select"
                  className={inputSelectVariants({ width: "18" })}
                  value={paramsGeneral.lineWidth}
                  onChange={(e) => {
                    // console.log("lineWidth", e.target.value);
                    paramsGeneral.lineWidth = Number(e.target.value);
                    setGeneralParams({ lineWidth: Number(e.target.value) });
                    needRefresh();
                  }}
                >
                  {[
                    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
                    36, 40,
                  ].map((width) => (
                    <option key={width} value={width}>
                      {width} px
                    </option>
                  ))}
                </select>
              </div>
              <RangeInput
                className={inputRangeVariants({ width: "16", size: "sm" })}
                label={<MdOpacity size={16} />}
                id="draw-size-picker"
                value={paramsGeneral.opacity * 100}
                min="5"
                max="100"
                step="5"
                onChange={(value: number) =>
                  setGeneralParams({ opacity: value / 100 })
                }
                isTouch={false}
              />
              <label
                htmlFor="toggle-filled"
                className={cn(
                  "flex flex-col justify-center items-center font-xs gap-2",
                  {
                    hidden:
                      !(
                        isDrawingShape(mode) ||
                        isDrawingLine(mode) ||
                        isDrawingFreehand(mode)
                      ) || mode === DRAWING_MODES.ARROW,
                  }
                )}
              >
                Filled
                <ToggleSwitch
                  id="toggle-filled"
                  defaultChecked={paramsGeneral.filled}
                  onChange={(event) => {
                    setGeneralParams({ filled: event.target.checked });
                    needReloadControl();
                  }}
                />
              </label>
              <label
                htmlFor="toggle-black"
                className={cn(
                  "flex flex-col gap-2 justify-center items-center font-xs",
                  {
                    hidden: !isDrawingSelect(mode),
                  }
                )}
              ></label>
            </fieldset>
          </div>
          <div className="flex flex-col">
            <fieldset className="flex flex-row gap-2 justify-between p-2 w-full rounded-lg border-2 border-secondary">
              <legend>Drawing</legend>
              <Button
                className="px-3"
                selected={mode == DRAWING_MODES.DRAW}
                onClick={() => handleChangeMode(DRAWING_MODES.DRAW)}
                title="Free hand drawing"
              >
                <Pencil size={buttonIconSize} />
              </Button>
              <Button
                className="px-3"
                selected={isDrawingLine(mode) && mode !== DRAWING_MODES.ARROW}
                onClick={() => {
                  handleChangeMode(DRAWING_MODES.LINE);
                }}
                title="Draw lines"
              >
                <TbTimeline size={buttonIconSize} />
              </Button>
              <Button
                className="px-3"
                selected={mode == DRAWING_MODES.ARROW}
                onClick={() => handleChangeMode(DRAWING_MODES.ARROW)}
                title="Arrow"
              >
                <MoveUpRight size={buttonIconSize} />
              </Button>
              <Button
                className="px-3"
                selected={mode == DRAWING_MODES.TEXT}
                onClick={() => handleChangeMode(DRAWING_MODES.TEXT)}
              >
                <CaseSensitive size={buttonIconSize} />
              </Button>
            </fieldset>
          </div>
          {mode === DRAWING_MODES.ARROW && (
            <RoomDesignArrow isTouch={isTouch} />
          )}
          {isDrawingLine(mode) && mode !== DRAWING_MODES.ARROW && (
            <div className="flex flex-col">
              <RoomDesignLine buttonIconSize={buttonIconSize} />
            </div>
          )}
          {((isDrawingShape(mode) && drawingParams.shape.withText) ||
            mode === DRAWING_MODES.TEXT) && (
            <RoomDesignText
              buttonShapeSize={buttonShapeSize}
              buttonIconSize={buttonIconSize}
              isTouch={isTouch}
            />
          )}
          <RoomDesignShape
            buttonShapeSize={buttonShapeSize}
            buttonIconSize={buttonIconSize}
            isTouch={isTouch}
          />
          {(isDrawingShape(mode) || isDrawingSelect(mode)) && (
            <RoomDesignBorder
              buttonIconSize={buttonIconSize}
              isTouch={isTouch}
            />
          )}
          <RoomDesignSelect buttonIconSize={buttonIconSize} />
        </div>
        <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-accent">
          <legend>Design elements ({displayElementsLength})</legend>
          <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-2 justify-between items-center w-full">
              <Button
                onClick={() => setShowList(!showList)}
                className={cn("w-3/4", {
                  "bg-gray-300": showList,
                  "hover:bg-gray-400": showList,
                })}
                title={showList ? "Hide" : "Show"}
              >
                {showList ? "Hide" : "Show"} elements
              </Button>
              <button
                onClick={() => handleChangeMode(DRAWING_MODES.FIND)}
                className={cn(
                  "btn  btn-circle bg-gray-300 transition hover:bg-accent",
                  {
                    "bg-accent": mode == DRAWING_MODES.FIND,
                  }
                )}
                title="Find element by clicking on canvas"
              >
                <Search size={buttonIconSize} />
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    </>
  );
};
