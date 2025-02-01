import React, { useState, useRef, useEffect } from "react";
import { RoomAddTables } from "./RoomAddTables";
import { UpdateSelectedTables } from "./UpdateSelectedTables";
import { RoomDesign } from "./RoomDesign";
import { Rectangle } from "@/lib/canvas/types";
import { RangeInput } from "@/components/atom/RangeInput";
import { isTouchDevice } from "@/lib/utils/device";
import { useRoomContext } from "./RoomProvider";
import { TableNumbers } from "./TableNumbers";
import { useTableDataStore } from "./stores/tables";
import {
  showValidationFrame,
  addValidationValidAction,
} from "./ValidationFrame";
import { TypeListTables, Menu } from "./types";
import { NotepadText } from "lucide-react";

interface RoomMenu2Props {
  btnSize: number;
  addSelectedRect: (rect: Rectangle) => void;
  typeListMode: TypeListTables;
  setTypeListMode: (type: TypeListTables) => void;
}

export const RoomMenu2: React.FC<RoomMenu2Props> = ({
  btnSize,
  addSelectedRect,
  typeListMode,
  setTypeListMode,
}) => {
  const isTouch = isTouchDevice();
  const ref = useRef<HTMLDivElement>(null);
  const { mode, scale, setScale, clearSelectedTableIds, getSelectedRect } =
    useRoomContext();
  const activeMenuRef = useRef<Menu | null>(null);
  const [activeMenu, setStateActiveMenu] = useState<Menu | null>(null);
  const [isPlanMode, setIsPlanMode] = useState(true);
  const refDetails = useRef<HTMLDetailsElement>(null);
  const {
    tables,
    updateTable,
    resetSelectedTables,
    deleteSelectedTable,
    countSelectedTables,
  } = useTableDataStore();
  const setActiveMenu = (menu: Menu | null) => {
    setStateActiveMenu(menu);
    activeMenuRef.current = menu;
  };

  const handleSelectTypeList = (type: TypeListTables) => {
    setTypeListMode(type);
    refDetails.current?.removeAttribute("open");
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
      // Delete table with Delete key
      if (event.key === "Delete") {
        const containerSelect = getSelectedRect(true);
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

  useEffect(() => {
    setIsPlanMode(typeListMode === TypeListTables.plan);
  }, [typeListMode]);

  return (
    <div className="flex items-center w-full align-middle bg-gray-100 min-h-12">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <NotepadText size={24} />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {isPlanMode && (
              <>
                <li>
                  <RoomAddTables
                    className="flex flex-col p-1 w-full rounded-lg"
                    addSelectedRect={addSelectedRect}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    disabled={!isPlanMode}
                  />
                </li>
                <li>
                  <UpdateSelectedTables
                    className="flex flex-col p-1 w-full rounded-lg"
                    btnSize={btnSize}
                    isTouch={isTouch}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    disabled={!isPlanMode}
                  />
                </li>
                <li>
                  <TableNumbers
                    className="flex flex-col p-1 w-full rounded-lg"
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                  />
                </li>
                <li>
                  <RoomDesign
                    className="flex flex-col p-1 w-full rounded-lg"
                    isTouch={isTouch}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                  />
                </li>
              </>
            )}
            <li>
              <details open>
                <summary>View type</summary>
                <ul>
                  <li>
                    <a
                      className={
                        typeListMode === TypeListTables.plan ? "active" : ""
                      }
                      onClick={() => handleSelectTypeList(TypeListTables.plan)}
                    >
                      Floor plan
                    </a>
                  </li>
                  <li>
                    <a
                      className={
                        typeListMode === TypeListTables.list ? "active" : ""
                      }
                      onClick={() => handleSelectTypeList(TypeListTables.list)}
                    >
                      List tables
                    </a>
                  </li>
                  <li>
                    <a
                      className={
                        typeListMode === TypeListTables.hide ? "active" : ""
                      }
                      onClick={() => handleSelectTypeList(TypeListTables.hide)}
                    >
                      Hide tables
                    </a>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
        <a className="text-xl btn btn-ghost">Room creator</a>
      </div>
      <div className="hidden navbar-center lg:flex">
        <ul className="items-center px-1 menu menu-horizontal">
          <li className="flex items-center">
            <RoomAddTables
              className="px-2"
              addSelectedRect={addSelectedRect}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              disabled={!isPlanMode}
            />
          </li>
          <li className="flex items-center">
            <UpdateSelectedTables
              className="px-2"
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              btnSize={btnSize}
              isTouch={isTouch}
              disabled={!isPlanMode}
            />
          </li>

          <li className="flex items-center">
            <TableNumbers
              className="px-2"
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              disabled={!isPlanMode}
            />
          </li>
          <li className="flex items-center">
            <RoomDesign
              className="px-2"
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              isTouch={isTouch}
              disabled={typeListMode === "list"}
            />
          </li>
          <li className="flex z-40 items-center mx-2">
            <details ref={refDetails}>
              <summary>Table view</summary>
              <ul className="p-2 w-32 bg-base-100 rounded-box">
                <li>
                  <a
                    className={
                      typeListMode === TypeListTables.plan ? "active" : ""
                    }
                    onClick={() => handleSelectTypeList(TypeListTables.plan)}
                  >
                    Floor plan
                  </a>
                </li>
                <li>
                  <a
                    className={
                      typeListMode === TypeListTables.list ? "active" : ""
                    }
                    onClick={() => handleSelectTypeList(TypeListTables.list)}
                  >
                    Tables list
                  </a>
                </li>
                <li>
                  <a
                    className={
                      typeListMode === TypeListTables.hide ? "active" : ""
                    }
                    onClick={() => handleSelectTypeList(TypeListTables.hide)}
                  >
                    Hide tables
                  </a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
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
      {mode}
    </div>
  );
};
