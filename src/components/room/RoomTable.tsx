import React, { useRef, useEffect, useState } from "react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";

import { TableData, TableSettings, TableColors, TableType } from "./types";
import { useGroupStore } from "./stores/groups";
import { useTableDataStore } from "./stores/tables";
import { Trash2, PowerOff, Settings, X, PencilOff } from "lucide-react";
import { ShowTable, getTableComponent } from "./ShowTable";
import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";
import { isTouchDevice } from "@/lib/utils/device";
import { Mode } from "./types";
import clsx from "clsx";

interface RoomTableProps {
  id?: string;
  table: TableData;
  btnSize: number;
  scale?: number;
  onDelete: (id: string) => void;
  changeSelected: (id: string, selected: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  isActive: boolean;
  showButton: boolean;
  mode?: Mode | null;
  setActiveTable: (id: string | null) => void;
}

const withButtonStop = false;

export const RoomTable: React.FC<RoomTableProps> = ({
  id,
  table,
  btnSize,
  scale = 1,
  onDelete,
  changeSelected,
  onClick,
  style,
  showButton,
  mode = Mode.create,
  setActiveTable,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const group = useGroupStore((state) => state.groups).find(
    (g) => g.id === table.groupId
  );
  const isTouch = isTouchDevice();

  const { updateTable } = useTableDataStore();

  const colors: TableColors = {
    ...(group ? group.colors : {}),
  };

  const [settings, setSettings] = useState<TableSettings | null>({
    ...(group ? group.settings : {}),
    ...table.settings,
  });
  const [editSettings, setEditSettings] = useState<TableSettings | null>(
    table?.settings ?? null
  );

  const saveSettings = (newSettings: TableSettings | null) => {
    console.log("newSettings:", newSettings);

    setEditSettings(newSettings);
    setSettings(newSettings);

    updateTable(table.id, { settings: newSettings });
  };

  const [localSize, setLocalSize] = React.useState(table.size ?? 100);

  const handleRotation = (rotation: number) => {
    updateTable(table.id, { rotation: rotation });
  };

  const handleSize = (newSize: number) => {
    updateTable(table.id, { size: newSize });
  };

  const setTableType = (type: TableType) => {
    updateTable(table.id, { type: type });
  };

  useEffect(() => {
    setLocalSize((table.size ?? 100) * scale);
  }, [scale, table.size]);

  useEffect(() => {
    setSettings({
      ...(group ? group.settings : {}),
      ...table.settings,
    });
  }, [table?.settings, group?.settings]);

  const TableComponent = getTableComponent(table.type);

  return (
    <div
      id={id}
      ref={ref}
      className={clsx("p-0 m-0 border-2 cursor-pointer z-10", {
        "border-dotted border-red-500": table.selected,
        "bg-orange-300": table.selected && mode === Mode.numbering,
        "border-transparent": !table.selected,
      })}
      style={style}
      onClick={(event) => {
        changeSelected(table.id, !table.selected);
        onClick?.(event);
        event.stopPropagation();
      }}
    >
      <TableComponent
        size={localSize}
        rotation={table.rotation ?? 0}
        tableNumber={table.tableNumber ?? ""}
        tableText={table.tableText ?? ""}
        {...settings}
        {...colors}
        type={table.type}
      />
      {showButton && (
        <div>
          {table.groupId && (
            <button
              className="absolute -top-4 -right-4 btn btn-circle btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                updateTable(table.id, { groupId: null });
                setActiveTable("");
              }}
            >
              <PowerOff size={btnSize} />
            </button>
          )}
          {withButtonStop && (
            <button
              className="absolute -top-4 -left-4 btn btn-circle btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTable("");
              }}
            >
              <PencilOff size={btnSize} />
            </button>
          )}
          <div className="flex absolute left-0 -bottom-1 flex-row justify-between w-full">
            <Dialog blur={true}>
              <DialogOpen>
                <button className="absolute -left-4 btn btn-circle btn-sm">
                  <Settings size={btnSize} />
                </button>
              </DialogOpen>
              <DialogContent position="modal">
                <DialogClose>
                  <button className="absolute top-5 right-5 btn btn-circle btn-sm">
                    <X size={btnSize} />
                  </button>
                </DialogClose>
                <ShowTable
                  className="p-4 rounded-lg bg-background min-h-96"
                  colors={colors}
                  settings={editSettings}
                  title={table.tableText}
                  saveSettings={saveSettings}
                  rotation={table.rotation ?? 0}
                  rotationStep={5}
                  handleRotation={handleRotation}
                  size={table.size}
                  handleSize={handleSize}
                  tableNumber={table.tableNumber}
                  resetTable={() => {
                    saveSettings(null);
                    // updateTable(table.id, { settings: null });
                  }}
                  tableType={table.type}
                  setTableType={setTableType}
                  editing={true}
                  isTouch={isTouch}
                />
              </DialogContent>
            </Dialog>
            <DeleteWithConfirm
              position="right"
              onConfirm={() => onDelete(table.id)}
              confirmMessage="Delete this table?"
              confirmClassName="p-0 w-36 btn btn-warning"
              className="absolute -right-4 btn btn-circle btn-sm"
            >
              <Trash2 size={btnSize} />
            </DeleteWithConfirm>
          </div>
        </div>
      )}
    </div>
  );
};
