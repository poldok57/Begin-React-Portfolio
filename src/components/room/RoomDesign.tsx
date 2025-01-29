import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { RangeInput } from "@/components/atom/RangeInput";
import { X } from "lucide-react";
import { useTableDataStore } from "./stores/tables";
import { ModifyColor } from "./ModifyColor";
import { DesignType } from "./types";
import { getContrastColor } from "../colors/colors";
import { useRoomContext } from "./RoomProvider";
import { Mode } from "./types";
import { Menu } from "./RoomMenu";
import { withMousePosition } from "../windows/withMousePosition";
import { menuRoomVariants } from "@/styles/menu-variants";

import { ColorPikerBg } from "@/components/colors/ColorPikerBg";
import { useZustandDesignStore } from "@/lib/stores/design";
// import { useDrawingContext } from "@/context/DrawingContext";

import clsx from "clsx";

interface RoomDesignMenuProps {
  isTouch: boolean;
  recordDesign: (
    type: DesignType,
    color: string,
    name: string,
    opacity: number
  ) => void;
  withName?: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
}

const RoomDesignMenu: React.FC<RoomDesignMenuProps> = ({
  isTouch,
  recordDesign,
  withName = false,
  activeMenu,
}) => {
  const [color, setColor] = useState("#e0aaaa");
  const [name, setName] = useState("");
  const [opacity, setOpacity] = useState(50);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const {
    designElements,
    deleteDesignElement,
    selectedDesignElement,
    setSelectedDesignElement,
  } = useTableDataStore((state) => state);
  const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({
    top: "100%",
  });

  const { needRefresh, storeName } = useRoomContext();

  const store = useZustandDesignStore(storeName);

  const backgroundColor = store ? store.getState().backgroundColor : null;

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

  const handleSquareColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get("type") as DesignType;
    recordDesign(type, color, name, opacity);
  };

  return (
    <>
      <div
        id="menu-design"
        className={menuRoomVariants({ width: 64 })}
        style={menuPosition}
      >
        <div className="flex flex-col gap-3 mb-5 border-b-2 border-base-300">
          <div className="flex flex-col gap-2">
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
                  className="relative z-10 p-2 rounded-lg border border-gray-400 shadow-xl bg-base-100"
                  title="Background Color"
                  closeColorPicker={onCloseColorPicker}
                  color={background}
                  setColor={setBackground}
                />
              )}
            </fieldset>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input type="hidden" name="type" value={DesignType.square} />
            <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-secondary">
              <legend>Square</legend>
              {withName && (
                <div className="flex justify-between items-center">
                  <label htmlFor="backgroundName" className="mr-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="backgroundName"
                    name="backgroundName"
                    placeholder="Background name"
                    required={true}
                    className="w-full max-w-xs input input-bordered"
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </div>
              )}
              <ModifyColor
                label="Color:"
                name="square"
                value={color}
                defaultValue={color}
                onChange={handleSquareColorChange}
                className="z-10 w-24 h-6"
              />
              <RangeInput
                id="opacity"
                value={opacity}
                onChange={(value) => setOpacity(value)}
                label="Opacité"
                min="0"
                max="100"
                step="5"
                className="w-20 h-4"
                isTouch={isTouch}
              />
              <Button type="submit">Save square</Button>
            </fieldset>
          </form>
        </div>
        <fieldset className="flex flex-col gap-2 p-2 rounded-lg border-2 border-secondary">
          <legend>Design elements ({designElements.length})</legend>
          <div className="flex overflow-y-auto flex-col p-2 h-32 rounded-lg bg-base-200">
            {designElements.length > 0 ? (
              designElements.map((element) => (
                <div
                  key={element.id}
                  className={clsx(
                    "flex flex-row justify-between items-center p-1 mb-1 w-full rounded-md",
                    {
                      "border-2 border-red-500 border-dashed border-opacity-100":
                        selectedDesignElement === element.id,
                    }
                  )}
                  style={{
                    backgroundColor: element.color,
                    opacity: element.opacity ?? 1,
                  }}
                >
                  <span
                    className={clsx("text-sm cursor-pointer w-full", {
                      "border-1 border-dashed border-red-500 font-semibold text-opacity-100":
                        selectedDesignElement === element.id,
                    })}
                    style={{
                      color: getContrastColor(element.color),
                    }}
                    onClick={() => setSelectedDesignElement(element.id)}
                  >
                    {element.type}: {element.name}
                  </span>
                  <button
                    className="btn btn-circle btn-xs bg-base-100"
                    onClick={() => {
                      deleteDesignElement(element.id);
                      if (selectedDesignElement === element.id) {
                        setSelectedDesignElement("");
                      }
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-base-content">No design elements</p>
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
  recordDesign: (
    type: DesignType,
    color: string,
    name: string,
    opacity: number
  ) => void;
  disabled?: boolean;
}

export const RoomDesign: React.FC<RoomDesignProps> = ({
  className,
  isTouch,
  recordDesign,
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
          recordDesign={recordDesign}
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
