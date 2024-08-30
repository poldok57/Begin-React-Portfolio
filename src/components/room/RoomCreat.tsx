// import React, { useState } from "react";
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
import clsx from "clsx";

interface RoomTableProps {
  table: TableData;
  index: number;
  btnSize: number;
  onDelete: (id: string) => void;
  onUpdate: (table: TableData) => void;
  onMove: (table: TableData, position: Position) => void;
  changeSelected: (table: TableData) => void;
}

const RoomTable = ({
  table,
  // index,
  btnSize,
  onDelete,
  onUpdate,
  // onMove,
  changeSelected,
}: RoomTableProps) => {
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
  return (
    <div
      className={clsx("p-0 m-0", {
        "border-2 border-dotted border-red-500": table.selected,
      })}
      onClick={() => changeSelected(table)}
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
          <div className="absolute -top-5 -left-5">
            <button
              className="btn btn-circle btn-sm"
              onClick={() =>
                onUpdate({ ...table, rotation: (table.rotation || 0) - 15 })
              }
            >
              <RotateCcw size={btnSize} />
            </button>
            <button
              className="ml-2 btn btn-circle btn-sm"
              onClick={() =>
                onUpdate({ ...table, rotation: (table.rotation || 0) + 15 })
              }
            >
              <RotateCw size={btnSize} />
            </button>
          </div>
          <div className="absolute -top-5 -right-5">
            <button
              className="btn btn-circle btn-sm"
              onClick={() =>
                onUpdate({ ...table, size: (table.size || 100) - 10 })
              }
            >
              <Minus size={btnSize} />
            </button>
            <button
              className="ml-2 btn btn-circle btn-sm"
              onClick={() =>
                onUpdate({ ...table, size: (table.size || 100) + 10 })
              }
            >
              <Plus size={btnSize} />
            </button>
          </div>
          <div className="absolute -bottom-5 -left-5">
            <button
              className="btn btn-circle btn-sm"
              onClick={() => {
                /* Logique pour modifier les paramètres */
              }}
            >
              <Settings size={btnSize} />
            </button>
          </div>
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

export const RoomCreat = () => {
  const { tables, addTable, updateTable, deleteTable } = useTableDataStore(
    (state) => state
  );

  const btnSize = isTouchDevice() ? 20 : 16;
  const handleAddTable = () => {
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
  };
  const handleDelete = (id: string) => {
    deleteTable(id);
  };
  const handleUpdate = (table: TableData) => {
    updateTable(table.id, table);
  };
  const handleMove = (table: TableData, position: Position) => {
    updateTable(table.id, { ...table, position });
  };
  const handleChangeSelected = (table: TableData) => {
    updateTable(table.id, { ...table, selected: !table.selected });
  };

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
        </div>
        <div className="relative w-full h-full">
          {tables.map((table, index) => {
            const x = table?.position?.x ?? 50 + index * 10;
            const y = table?.position?.y ?? 50 + index * 10;
            return (
              <div
                key={table.id}
                style={{
                  position: "absolute",
                  left: `${x}px`,
                  top: `${y}px`,
                }}
              >
                <RoomTable
                  table={table}
                  index={index}
                  btnSize={btnSize}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onMove={handleMove}
                  changeSelected={handleChangeSelected}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
