import React, { useRef } from "react";
import { PokerTable } from "./PokerTable";
import { TableData, TableSettings, TableColors } from "./types";
import { useGroupStore } from "./stores/groups";
import { Trash2 } from "lucide-react";
import clsx from "clsx";

interface RoomTableProps {
  table: TableData;
  btnSize: number;
  onDelete: (id: string) => void;
  changeSelected: (id: string, selected: boolean) => void;
}

export const RoomTable = ({
  table,
  btnSize,
  onDelete,
  changeSelected,
}: RoomTableProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const group = useGroupStore((state) => state.groups).find(
    (g) => g.id === table.groupId
  );
  useRef(null);

  const settings: TableSettings = {
    ...table.settings,
    ...(group ? group.settings : {}),
  };
  const colors: TableColors = {
    ...(group ? group.colors : {}),
  };

  return (
    <div
      ref={ref}
      className={clsx("p-0 m-0 border-2", {
        "border-dotted border-red-500": table.selected,
        "border-transparent": !table.selected,
      })}
      onClick={(event) => {
        changeSelected(table.id, !table.selected);
        event.stopPropagation();
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
              onClick={() => {
                onDelete(table.id);
              }}
            >
              <Trash2 size={btnSize} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
