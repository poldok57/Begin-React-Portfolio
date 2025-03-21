import React, { useState, useRef, useEffect } from "react";
import { AddTables } from "./Tables/AddTables";
import { UpdateSelectedTables } from "./Numbering/UpdateSelectedTables";
import { RoomDesign } from "./Design/RoomDesign";
import { RangeInput } from "@/components/atom/RangeInput";
import { isTouchDevice } from "@/lib/utils/device";
import { useRoomStore } from "@/lib/stores/room";
import { usePlaceStore } from "@/lib/stores/places";
import { TableNumbers } from "./Numbering/TableNumbers";
import { RoomExportImport } from "./Places/RoomExportImport";

import { zustandTableStore } from "@/lib/stores/tables";
import type { TableDataState } from "@/lib/stores/tables";
import {
  showValidationFrame,
  addValidationValidAction,
} from "../ValidationFrame";
import { TypeListTables, Menu, Mode } from "../types";
import { NotepadText, Undo } from "lucide-react";
import { useHistoryStore } from "@/lib/stores/history";
import { GroupCreat } from "./Groups/GroupCreat";
import { PlaceMenu } from "./Places/PlaceMenu";

interface RoomMenu2Props {
  btnSize: number;
  typeListMode: TypeListTables;
  setTypeListMode: (type: TypeListTables) => void;
}

export const RoomMenu2: React.FC<RoomMenu2Props> = ({
  btnSize,
  typeListMode,
  setTypeListMode,
}) => {
  const isTouch = isTouchDevice();
  const ref = useRef<HTMLDivElement>(null);
  const {
    mode,
    setMode,
    defaultMode,
    scale,
    setScale,
    clearSelectedTableIds,
    clearTemporaryCanvas,
    getSelectedRect,
    setSelectedRect,
    maxRowsPerColumn,
    setMaxRowsPerColumn,
    tablesStoreName,
  } = useRoomStore();
  const activeMenuRef = useRef<Menu | null>(null);
  const [activeMenu, setStateActiveMenu] = useState<Menu | null>(null);
  const [isPlanMode, setIsPlanMode] = useState(true);
  const refDetails = useRef<HTMLDetailsElement>(null);

  const namedStoreRef = useRef<TableDataState | null>(null);

  const { canUndo, getLastEntry, removeLastEntry } = useHistoryStore();
  const setActiveMenu = (menu: Menu | null) => {
    setStateActiveMenu(menu);
    activeMenuRef.current = menu;
  };

  const { getCurrentPlace } = usePlaceStore();

  const currentPlace = getCurrentPlace();
  const placeName = currentPlace?.name ?? "Room creator";
  const placeTitle = currentPlace?.title ?? "";

  const handleSelectTypeList = (type: TypeListTables) => {
    setTypeListMode(type);
    refDetails.current?.removeAttribute("open");
  };

  const handleDeleteSelectedTables = () => {
    clearTemporaryCanvas();
    clearSelectedTableIds();
    namedStoreRef.current?.deleteSelectedTable();
    namedStoreRef.current?.setActiveTable(null);
    setSelectedRect(null);
  };

  const handleUndo = () => {
    const lastEntry = getLastEntry();
    if (!lastEntry) return;

    lastEntry.tables.forEach((tableHistory) => {
      namedStoreRef.current?.updateTable(tableHistory.id, {
        center: tableHistory.previousPosition,
        ...(tableHistory.previousRotation !== undefined && {
          rotation: tableHistory.previousRotation,
        }),
      });
    });

    removeLastEntry();
  };

  useEffect(() => {
    namedStoreRef.current = zustandTableStore(tablesStoreName).getState();
  }, [tablesStoreName]);

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
      switch (event.key) {
        case "Escape":
          if (activeMenuRef.current === Menu.roomDesign) {
            break;
          }
          setActiveMenu(null);
          clearSelectedTableIds();
          namedStoreRef.current?.setActiveTable(null);
          break;

        case "a":
        case "A":
          if (event.ctrlKey) {
            event.preventDefault();
            namedStoreRef.current?.tables.forEach((table) => {
              namedStoreRef.current?.updateTable(table.id, { selected: true });
            });
          }
          break;
        case "z":
        case "Z":
          if (event.ctrlKey && typeListMode === TypeListTables.plan) {
            event.preventDefault();
            if (canUndo()) {
              handleUndo();
            }
          }
          break;

        case "Delete":
          const containerSelect = getSelectedRect(true);
          if (!containerSelect) {
            break;
          }
          const count = namedStoreRef.current?.countSelectedTables();
          if (count === 0) {
            break;
          }
          const text = `Delete ${count} tables`;
          showValidationFrame(
            {
              left: containerSelect.left + containerSelect.width - 20,
              top: containerSelect.top + 10,
            },
            text
          );

          if (namedStoreRef.current) {
            addValidationValidAction(handleDeleteSelectedTables);
          }

          event.preventDefault();
          break;
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

  useEffect(() => {
    if (!mode) {
      setMode(defaultMode);
    }
  }, [mode]);

  return (
    <div className="flex items-center w-full align-middle bg-gray-100 min-h-12">
      <div className="navbar-start">
        <div className="z-20 dropdown">
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
                  <PlaceMenu
                    className="flex flex-col p-1 w-full rounded-lg bg-secondary"
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    disabled={false}
                  />
                </li>
                <li>
                  <RoomExportImport
                    className="flex flex-col p-1 w-full rounded-lg bg-secondary"
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    disabled={false}
                  />
                </li>
                <li>
                  <GroupCreat
                    className="flex flex-col p-1 w-full rounded-lg bg-secondary"
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    disabled={false}
                  />
                </li>
                <li>
                  <AddTables
                    className="flex flex-col p-1 w-full rounded-lg"
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                  />
                </li>
                <li>
                  <UpdateSelectedTables
                    className="flex flex-col p-1 w-full rounded-lg"
                    btnSize={btnSize}
                    isTouch={isTouch}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                  />
                </li>
                <li>
                  <TableNumbers
                    className="flex flex-col p-1 w-full rounded-lg"
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                  />
                </li>
              </>
            )}
            {typeListMode !== TypeListTables.list && (
              <li>
                <RoomDesign
                  className="flex flex-col p-1 w-full rounded-lg bg-secondary"
                  isTouch={isTouch}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              </li>
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
        <a
          className="text-xl btn btn-ghost"
          onClick={() => setActiveMenu(Menu.place)}
        >
          {placeName}
        </a>
        <p className="text-sm btn btn-ghost">{placeTitle}</p>
      </div>
      {/* large screen menu */}
      <div className="hidden navbar-center lg:flex">
        <ul className="items-center px-1 menu menu-horizontal">
          <li className="flex items-center">
            <PlaceMenu
              className="px-2 bg-secondary"
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              disabled={currentPlace ? false : true}
            />
          </li>
          <li className="flex items-center pr-1">
            <RoomExportImport
              className="px-2"
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              disabled={false}
            />
          </li>
          <li className="flex items-center pr-1 border-r-2 border-gray-400">
            <GroupCreat
              className="px-2 bg-secondary"
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              disabled={currentPlace ? false : true}
            />
          </li>
          {typeListMode === TypeListTables.plan && currentPlace && (
            <>
              <li className="flex items-center pl-1">
                <AddTables
                  className="px-2"
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              </li>
              <li className="flex items-center">
                <UpdateSelectedTables
                  className="px-2"
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  btnSize={btnSize}
                  isTouch={isTouch}
                />
              </li>
              <li className="flex items-center pr-1">
                <TableNumbers
                  className="px-2"
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              </li>
            </>
          )}
          {typeListMode !== TypeListTables.list && currentPlace && (
            <>
              <li className="flex items-center pl-1 border-l-2 border-gray-400">
                <RoomDesign
                  className="px-2 bg-secondary"
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  isTouch={isTouch}
                />
              </li>
            </>
          )}

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
          {mode === Mode.create && typeListMode === TypeListTables.plan && (
            <li className="flex items-center">
              <button
                className="border-gray-300 shadow-md btn btn-square border-1"
                onClick={handleUndo}
                disabled={!canUndo()}
                title="Undo last move"
              >
                <Undo size={btnSize + 2} />
              </button>
            </li>
          )}
        </ul>
      </div>
      <div className="flex flex-row gap-3 items-center px-4 navbar-end">
        {typeListMode === TypeListTables.list && (
          <div className="flex flex-row items-center">
            <label htmlFor="maxRows" className="mr-2 text-nowrap">
              Max rows
            </label>
            <select
              id="maxRows"
              className="w-full max-w-xs select select-bordered"
              value={maxRowsPerColumn}
              onChange={(e) => setMaxRowsPerColumn(Number(e.target.value))}
            >
              <option value="10">10 rows</option>
              <option value="12">12 rows</option>
              <option value="16">16 rows</option>
              <option value="20">20 rows</option>
              <option value="25">25 rows</option>
              <option value="30">30 rows</option>
              <option value="40">40 rows</option>
              <option value="50">50 rows</option>
            </select>
          </div>
        )}
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

        {mode}
      </div>
    </div>
  );
};
