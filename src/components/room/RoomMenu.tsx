import React, { useState, useRef, useEffect } from "react";
import { RoomAddTables } from "./RoomAddTables";
import { UpdateSelectedTables } from "./UpdateSelectedTables";
import { RoomDesign } from "./RoomDesign";
import { Rectangle } from "@/lib/canvas/types";
import { RangeInput } from "@/components/atom/RangeInput";
import { isTouchDevice } from "@/lib/utils/device";
import { useRoomContext } from "./RoomProvider";
import { DesignType } from "./types";
import { TableNumbers } from "./TableNumbers";
import { useTableDataStore } from "./stores/tables";

export enum Menu {
  addTable = "addTable",
  updateTable = "updateTable",
  tableNumbers = "tableNumbers",
  roomDesign = "roomDesign",
  scale = "scale",
}

interface RoomMenuProps {
  btnSize: number;
  recordDesign: (
    type: DesignType,
    color: string,
    name: string,
    opacity: number
  ) => void;
  addSelectedRect: (rect: Rectangle) => void;
  resetSelectedTables: () => void;
}

export const RoomMenu: React.FC<RoomMenuProps> = ({
  btnSize,
  recordDesign,
  addSelectedRect,
  resetSelectedTables,
}) => {
  const isTouch = isTouchDevice();
  const ref = useRef<HTMLDivElement>(null);
  const { scale, setScale, clearSelectedTableIds } = useRoomContext();
  const activeMenuRef = useRef<Menu | null>(null);
  const [activeMenu, setStateActiveMenu] = useState<Menu | null>(null);
  const { tables, updateTable } = useTableDataStore();
  const setActiveMenu = (menu: Menu | null) => {
    setStateActiveMenu(menu);
    activeMenuRef.current = menu;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (activeMenuRef.current === Menu.updateTable) {
          setActiveMenu(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        clearSelectedTableIds();
        return;
      }
      // Sélectionner toutes les tables avec Ctrl+A
      if (event.ctrlKey && event.key === "a") {
        event.preventDefault();
        tables.forEach((table) => {
          updateTable(table.id, { selected: true });
        });
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={ref}
      id="room-menu"
      className="flex inset-1 z-10 flex-col gap-2 p-2 mx-2 w-56 rounded-xl border-2 bg-base-200 border-base-300"
      onMouseOver={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <RoomAddTables
        className="flex flex-col p-1 w-full rounded-lg"
        addSelectedRect={addSelectedRect}
        resetSelectedTables={resetSelectedTables}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <UpdateSelectedTables
        className="flex flex-col p-1 w-full rounded-lg"
        btnSize={btnSize}
        isTouch={isTouch}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <TableNumbers
        className="flex flex-col p-1 w-full rounded-lg"
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        btnSize={btnSize}
      />
      <RoomDesign
        className="flex flex-col p-1 w-full rounded-lg"
        recordDesign={recordDesign}
        isTouch={isTouch}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <RangeInput
        id="scale"
        label="Scale"
        value={scale}
        min="0.4"
        max="2"
        step="0.1"
        className="mx-1 w-full h-4"
        isTouch={isTouch}
        onChange={(value: number) => setScale(value)}
      />
    </div>
  );
};
