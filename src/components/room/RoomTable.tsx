import React, { useRef, useEffect, useState } from "react";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { GroupCreat } from "./menu/GroupCreat";
import { TableData, TableSettings, TableColors, TableType } from "./types";
import { useGroupStore } from "@/lib/stores/groups";
import { Trash2, PowerOff, Power, Settings, X, PencilOff } from "lucide-react";
import { ShowTable, getTableComponent } from "./ShowTable";
import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";
import { isTouchDevice } from "@/lib/utils/device";
import { Mode } from "./types";
import { cn } from "@/lib/utils/cn";

const withButtonStop = false;
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
  updateTable: (id: string, updatedTable: Partial<TableData>) => void;
  selectOneTable: (id: string) => void;
}

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
  updateTable,
  selectOneTable,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const group = useGroupStore((state) => state.groups).find(
    (g) => g.id === table.groupId
  );
  const isTouch = isTouchDevice();

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

  const setGroup = (groupId: string | null) => {
    updateTable(table.id, { groupId: groupId });
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
      className={cn("py-6 px-2 m-0 border-2 rounded-full", {
        "border-dotted border-red-500 bg-gray-200/25":
          table.selected && mode !== Mode.draw,
        "bg-orange-300 opacity-65": table.selected && mode === Mode.numbering,
        "border-transparent": !table.selected,
        "z-10 cursor-pointer": onClick !== undefined,
      })}
      style={style}
    >
      <div
        onClick={(event) => {
          // Do not handle click if it occurred on a button
          if (onClick) {
            onClick(event);
            event.stopPropagation();
          } else {
            changeSelected(table.id, !table.selected);
          }
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
      </div>
      {showButton && (
        <>
          <div className="flex absolute left-0 -top-5 z-40 w-full">
            {table.groupId && (
              <button
                className="absolute -right-2 bg-red-500 btn btn-circle btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTable(table.id, { groupId: null });
                  setActiveTable("");
                }}
              >
                <PowerOff size={btnSize} />
              </button>
            )}
            {!table.groupId && (
              <Dialog blur={true}>
                <DialogOpen>
                  <button
                    className="absolute -right-2 bg-green-500 btn btn-circle btn-sm"
                    onClick={() => selectOneTable(table.id)}
                  >
                    <Power size={btnSize} />
                  </button>
                </DialogOpen>

                <DialogContent position="modal">
                  <GroupCreat onSelect={(groupId) => setGroup(groupId)} />
                </DialogContent>
              </Dialog>
            )}
            {withButtonStop && (
              <button
                className="absolute -left-2 cursor-pointer btn btn-circle btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTable("");
                }}
              >
                <PencilOff size={btnSize} />
              </button>
            )}
          </div>
          <div className="flex absolute left-0 bottom-3 z-40 flex-row justify-between w-full">
            <Dialog blur={true}>
              <DialogOpen>
                <button className="absolute -left-2 btn btn-circle btn-sm">
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
                  size={(table?.size ?? 200) * 2}
                  handleSize={(size) => handleSize(size / 2)}
                  withTopPanel={true}
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
              className="absolute -right-3 btn btn-circle btn-sm bg-warning"
            >
              <Trash2 size={btnSize} />
            </DeleteWithConfirm>
          </div>
        </>
      )}
    </div>
  );
};
