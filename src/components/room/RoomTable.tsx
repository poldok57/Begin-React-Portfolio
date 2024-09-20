import React, { useRef, useState } from "react";
import { PokerTable } from "./svg/PokerTable";
import { TableData, TableSettings, TableColors } from "./types";
import { useGroupStore } from "./stores/groups";
import { useTableDataStore } from "./stores/tables";
import { Trash2, PowerOff, Settings, X, PencilOff } from "lucide-react";
import { ShowTable } from "./ShowTable";
import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";
import { isTouchDevice } from "@/lib/utils/device";

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
  setActiveTable: (id: string | null) => void;
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
  isActive,
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
    // console.log("newSettings:", newSettings);

    setEditSettings(newSettings);
    setSettings(newSettings);

    updateTable(table.id, { settings: newSettings });
  };

  const [localSize, setLocalSize] = React.useState(table.size ?? 100);

  const handleRotation = (rotation: number) => {
    updateTable(table.id, { rotation: rotation });
  };

  const handleSize = (step: number) => {
    const size = Math.max(50, Math.min(500, localSize + step));
    updateTable(table.id, { size: size });
  };

  React.useEffect(() => {
    setLocalSize((table.size ?? 100) * scale);
  }, [scale, table.size]);

  return (
    <div
      id={id}
      ref={ref}
      className={clsx("p-0 m-0 border-2 cursor-pointer z-10", {
        "border-dotted border-red-500": table.selected,
        "border-transparent": !table.selected,
      })}
      style={style}
      onClick={(event) => {
        changeSelected(table.id, !table.selected);
        onClick?.(event);
        event.stopPropagation();
      }}
    >
      <PokerTable
        size={localSize}
        rotation={table.rotation ?? 0}
        tableNumber={table.tableNumber ?? ""}
        tableText={table.tableText ?? ""}
        {...settings}
        {...colors}
      />
      {isActive && (
        <>
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
          <button
            className="absolute -top-4 -left-4 btn btn-circle btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTable("");
            }}
          >
            <PencilOff size={btnSize} />
          </button>
          <button
            className="absolute -bottom-2 -right-4 btn btn-circle btn-sm"
            onClick={() => {
              onDelete(table.id);
            }}
          >
            <Trash2 size={btnSize} />
          </button>
          <Dialog blur={true}>
            <DialogOpen>
              <button className="absolute -bottom-2 -left-4 btn btn-circle btn-sm">
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
                className="p-4 rounded-lg bg-background"
                colors={colors}
                settings={editSettings}
                title={table.tableText}
                saveSettings={saveSettings}
                rotation={table.rotation ?? 0}
                rotationStep={5}
                handleRotation={handleRotation}
                handleSize={handleSize}
                resetTable={() => {
                  saveSettings(null);
                  // updateTable(table.id, { settings: null });
                }}
                editing={true}
                isTouch={isTouch}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};
