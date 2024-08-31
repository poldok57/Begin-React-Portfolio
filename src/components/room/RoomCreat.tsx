import React, { useEffect, useCallback, useRef, useState } from "react";
import { Button } from "@/components/atom/Button";
import { GroupCreat } from "./GroupCreat";
import {
  TableData,
  TableType,
  TableSettings,
  TableColors,
  Position,
} from "./types";
import { PokerTable } from "./PokerTable";
import { useGroupStore } from "./stores/groups";
import { useTableDataStore } from "./stores/tables";
import {
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  Trash2,
  Settings,
} from "lucide-react";
import { isTouchDevice } from "@/lib/utils/device";
import { useThrottle } from "@/hooks/useThrottle";
import { withMousePosition } from "@/components/windows/withMousePosition";

import clsx from "clsx";

const GROUND_ID = "back-ground";
interface RoomTableProps {
  table: TableData;
  index: number;
  btnSize: number;
  style: React.CSSProperties;
  onDelete: (id: string) => void;
  onUpdate: (id: string, props: Partial<TableData>) => void;
  changeSelected: (id: string, selected: boolean) => void;
}

const RoomTable = ({
  table,
  btnSize,
  onDelete,
  changeSelected,
}: RoomTableProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const group = useGroupStore((state) => state.groups).find(
    (g) => g.id === table.groupId
  );

  const settings: TableSettings = {
    ...table.settings,
    ...(group ? group.settings : {}),
  };
  const colors: TableColors = {
    ...(group ? group.colors : {}),
  };

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const ground = document.getElementById(GROUND_ID);
      if (
        ref.current &&
        ground &&
        ground.contains(event.target as Node) &&
        !ref.current.contains(event.target as Node) &&
        !event.shiftKey &&
        !event.ctrlKey
      ) {
        changeSelected(table.id, false);
      }
    },
    [table.id]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        changeSelected(table.id, false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClickOutside]);
  const [isGreenBorder, setIsGreenBorder] = useState(false);

  useEffect(() => {
    if (isGreenBorder) {
      const ground = document.getElementById(GROUND_ID);
      if (ground) {
        ground.style.border = "2px solid green";
        ground.style.backgroundColor = "rgba(190, 255, 190, 0.3)";
        ground.style.borderRadius = "10px";
        ground.style.boxShadow = "0 0 10px 0 rgba(0, 0, 0, 0.5)";
        ground.style.transform = "scale(1.05)";
        ground.style.transition = "all 0.3s ease-in-out";
      }

      const timer = setTimeout(() => {
        setIsGreenBorder(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isGreenBorder]);

  return (
    <div
      ref={ref}
      className={clsx("p-0 m-0 border-2", {
        "border-dotted border-red-500": table.selected,
        "border-transparent": !table.selected,
      })}
      onClick={() => {
        changeSelected(table.id, true);
        setIsGreenBorder(true);
      }}
    >
      <PokerTable
        size={table.size ?? 100}
        rotation={table.rotation ?? 0}
        tableNumber={table.tableNumber ?? ""}
        tableText={table.tableText ?? ""}
        {...settings}
        {...colors}
      />
      {table.selected && (
        <>
          <div className="absolute -right-5 -bottom-5">
            <button
              className="btn btn-circle btn-sm"
              onClick={() => onDelete(table.id)}
            >
              <Trash2 size={btnSize} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const RoomTableWP = withMousePosition(RoomTable);

export const RoomCreat = () => {
  const {
    addTable,
    updateTable,
    deleteTable,
    rotationSelectedTable,
    sizeSelectedTable,
  } = useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;

  const handleAddTable = useThrottle(() => {
    const newTable: TableData = {
      id: "",
      type: TableType.poker,
      selected: true,
      size: 100,
      rotation: 0,
      tableNumber: `${tables.length + 1}`,
      tableText: `Table ${tables.length + 1}`,
    };
    addTable(newTable);
  }, 2000);

  const handleDelete = (id: string) => {
    deleteTable(id);
  };
  const handleUpdate = (id: string, props: Partial<TableData>) => {
    updateTable(id, props);
  };
  const handleMove = (id: string, position: Position) => {
    updateTable(id, { position });
  };
  const handleChangeSelected = (id: string, selected: boolean) => {
    updateTable(id, { selected });
  };
  const tables = useTableDataStore((state) => state.tables);
  return (
    <div
      className="flex w-full bg-background"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <div className="flex flex-row w-full">
        <GroupCreat />
        <div className="flex flex-col gap-2 p-2">
          <h1>RoomCreate</h1>
          <Button onClick={handleAddTable}>Add table</Button>
          <div className="flex flex-col gap-2">
            <h2>Modifier les tables sélectionnées</h2>
            <div className="flex flex-col gap-2 justify-center">
              <div className="flex flex-row gap-1 justify-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => rotationSelectedTable(-15)}
                >
                  <RotateCcw size={btnSize} />
                </button>
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => rotationSelectedTable(15)}
                >
                  <RotateCw size={btnSize} />
                </button>
              </div>
              <div className="flex flex-row gap-1 justify-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => sizeSelectedTable(-10)}
                >
                  <Minus size={btnSize} />
                </button>
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => sizeSelectedTable(10)}
                >
                  <Plus size={btnSize} />
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  className="btn btn-circle btn-sm"
                  onClick={() => {
                    /* Logique pour modifier les paramètres */
                  }}
                >
                  <Settings size={btnSize} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full h-full" id={GROUND_ID}>
          {tables.map((table, index) => {
            const left = table?.position?.left ?? 50 + index * 10;
            const top = table?.position?.top ?? 50 + index * 10;
            // if (table.selected)
            {
              return (
                <RoomTableWP
                  className="absolute"
                  key={table.id}
                  id={table.id}
                  table={table}
                  index={index}
                  btnSize={btnSize}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onMove={handleMove}
                  changeSelected={handleChangeSelected}
                  draggable={true}
                  // resizable={true}
                  trace={true}
                  withTitleBar={false}
                  withToggleLock={false}
                  titleText={table.tableText}
                  style={{
                    position: "absolute",
                    left: `${left}px`,
                    top: `${top}px`,
                  }}
                />
              );
            }
            return (
              <RoomTable
                key={table.id}
                table={table}
                index={index}
                btnSize={btnSize}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                changeSelected={handleChangeSelected}
                style={{
                  position: "absolute",
                  left: `${left}px`,
                  top: `${top}px`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
