import React, { useState, useRef, useEffect } from "react";
import { RoomAddTables } from "./RoomAddTables";
import { UpdateSelectedTables } from "./UpdateSelectedTables";
import { RoomDesign } from "./RoomDesign";
import { Rectangle } from "@/lib/canvas/types";
import { RangeInput } from "@/components/atom/RangeInput";
import { isTouchDevice } from "@/lib/utils/device";
import { useRoomStore } from "@/lib/stores/room";
import { DesignType, Menu } from "@/components/room/types";
import { TableNumbers } from "./TableNumbers";

import {
  showValidationFrame,
  addValidationValidAction,
} from "../ValidationFrame";
import { useZustandTableStore } from "@/lib/stores/tables";
interface RoomMenuProps {
  btnSize: number;
  recordDesign: (
    type: DesignType,
    color: string,
    name: string,
    opacity: number
  ) => void;
  resetSelectedTables: () => void;
}

export const RoomMenu: React.FC<RoomMenuProps> = ({
  btnSize,
  resetSelectedTables,
}) => {
  const isTouch = isTouchDevice();
  const ref = useRef<HTMLDivElement>(null);
  const {
    scale,
    setScale,
    clearSelectedTableIds,
    getSelectedRect,
    tablesStoreName,
  } = useRoomStore();
  const activeMenuRef = useRef<Menu | null>(null);
  const [activeMenu, setStateActiveMenu] = useState<Menu | null>(null);
  const namedStore = useZustandTableStore(tablesStoreName);
  const { tables, updateTable, deleteSelectedTable, countSelectedTables } =
    namedStore((state) => state);
  const setActiveMenu = (menu: Menu | null) => {
    setStateActiveMenu(menu);
    activeMenuRef.current = menu;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (
          activeMenuRef.current === Menu.updateTable ||
          activeMenuRef.current === Menu.addTable
        ) {
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
        if (activeMenuRef.current !== Menu.tableNumbers) {
          setActiveMenu(null);
        }
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
      // Delete table with Delete key
      if (event.key === "Delete") {
        const containerSelect = getSelectedRect();
        if (!containerSelect) {
          return;
        }
        const count = countSelectedTables();
        if (count === 0) {
          return;
        }
        const text = `Delete ${count} tables`;
        showValidationFrame(
          {
            left: containerSelect.left + containerSelect.width - 20,
            top: containerSelect.top + 10,
          },
          text
        );
        addValidationValidAction(deleteSelectedTable);
        event.preventDefault();
        const selectedTables = tables.filter((table) => table.selected);
        if (selectedTables.length > 0) {
          resetSelectedTables();
        }
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
    >
      <RoomAddTables
        className="w-full"
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <UpdateSelectedTables
        className="w-full"
        btnSize={btnSize}
        isTouch={isTouch}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <TableNumbers
        className="w-full"
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <RoomDesign
        className="w-full"
        isTouch={isTouch}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        btnSize={btnSize}
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
