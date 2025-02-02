import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { inputRangeVariants } from "@/styles/input-variants";
import { ToggleSwitch } from "@/components/atom/ToggleSwitch";

// import { getContrastColor } from "../colors/colors";
import { useRoomContext } from "./RoomProvider";
import { Mode, Menu } from "./types";
import { withMousePosition } from "../windows/withMousePosition";
import { menuRoomVariants } from "@/styles/menu-variants";

import { ColorPikerBg } from "@/components/colors/ColorPikerBg";
import {
  DRAWING_MODES,
  isDrawingLine,
  isDrawingFreehand,
  isDrawingSelect,
  isDrawingShape,
} from "@/lib/canvas/canvas-defines";
import { useDrawingContext } from "@/context/DrawingContext";
import { useZustandDesignStore } from "@/lib/stores/design";
import { updateParamFromElement } from "@/lib/canvas/updateParamFromElement";

import { DrawList } from "../draw/DrawList";
import { cn } from "@/lib/utils/cn";
import { ColorPicker } from "../atom/ColorPicker";
import { RangeInput } from "../atom/RangeInput";

import { CaseSensitive, MoveUpRight, Pencil } from "lucide-react";
import { TbTimeline } from "react-icons/tb";
import { MdLineWeight } from "react-icons/md";

interface RoomDesignMenuProps {
  isTouch: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  buttonIconSize?: number;
  buttonShapeSize?: number;
}

const RoomDesignMenu: React.FC<RoomDesignMenuProps> = ({
  isTouch,
  activeMenu,
  buttonIconSize = 20,
  // buttonShapeSize = 16,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({
    top: "100%",
  });
  const selectedElementRef = useRef<string | null>(null);

  const { needRefresh, storeName } = useRoomContext();
  const [showList, setShowList] = useState(false);

  const {
    addEventAction,
    mode,
    drawingParams,
    handleChangeMode,
    setGeneralParams,
    setShapeParams,
    setDrawingMode,
    setDrawingParams,
  } = useDrawingContext();

  const paramsGeneral = drawingParams.general;

  const store = useZustandDesignStore(storeName);

  const backgroundColor = store ? store.getState().backgroundColor : null;
  const displayElementsLength = store
    ? store.getState().getDesignElementLength()
    : 0;
  const selectedDesignElement = store
    ? store.getState().selectedDesignElement
    : null;
  const getSelectedDesignElement = store
    ? store.getState().getSelectedDesignElement
    : null;

  const setBackgroundColor = store ? store.getState().setBackgroundColor : null;
  const [background, setBackground] = useState(backgroundColor ?? "#aabbff");

  const onCloseColorPicker = () => {
    setShowColorPicker(false);
    if (setBackgroundColor) {
      setBackgroundColor(background);
    }
    needRefresh();
  };

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
      const newMode = updateParamFromElement(
        setDrawingParams,
        getSelectedDesignElement
      );
      if (newMode) {
        setDrawingMode(newMode);
      }
      needRefresh();
      // alertMessage("selected element changed: " + newMode);
      selectedElementRef.current = selectedDesignElement;
    }
  }, [selectedDesignElement]);

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
        <div className="flex flex-col gap-3 mb-5 border-b-2 border-base-300">
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
                  className="px-2 py-2 text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm appearance-none cursor-pointer w-18 focus:ring-1 focus:ring-blue-400"
                  value={paramsGeneral.lineWidth}
                  onChange={(e) => {
                    // console.log("lineWidth", e.target.value);
                    paramsGeneral.lineWidth = Number(e.target.value);
                    needRefresh();
                    setGeneralParams({ lineWidth: Number(e.target.value) });
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
                    // setReloadControl();
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
          <div className="flex flex-row">
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
          <div className="flex flex-col gap-2">
            <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-secondary">
              <legend>Square and ellipse</legend>
              <Button type="submit">Save square</Button>
            </fieldset>
          </div>
        </div>
        <div className="flex flex-col gap-2"></div>
        <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-accent">
          <legend>Design elements ({displayElementsLength})</legend>
          <div className="flex flex-col gap-2 items-center">
            <Button onClick={() => setShowList(!showList)} className="w-full">
              {showList ? "Hide" : "Show"} elements
            </Button>
            {showList && (
              <DrawList
                className="flex flex-col gap-1 px-0 py-2 w-56 text-sm"
                storeName={storeName}
              />
            )}
          </div>
        </fieldset>
      </div>
    </>
  );
};

const RoomDesignMenuWP = withMousePosition(RoomDesignMenu);

interface RoomDesignProps {
  className: string;
  btnSize?: number;
  isTouch: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const RoomDesign: React.FC<RoomDesignProps> = ({
  className,
  isTouch,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) => {
  const { setMode } = useRoomContext();

  const handleOpen = () => {
    setActiveMenu(Menu.roomDesign);
    setMode(Mode.draw);
  };

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          onClick={() => handleOpen()}
          className={className}
          disabled={disabled}
          selected={activeMenu === Menu.roomDesign}
        >
          Room design
        </Button>
      </div>
      {activeMenu === Menu.roomDesign && (
        <RoomDesignMenuWP
          isTouch={isTouch}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          className="absolute z-30 translate-y-24"
          onClose={() => setActiveMenu(null)}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Room design"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};
