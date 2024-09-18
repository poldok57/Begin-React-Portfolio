import React, { useCallback, useState, useEffect } from "react";
import { RectPosition as Position } from "@/lib/canvas/types";
import { TableData } from "./types";
import { useTableDataStore } from "./stores/tables";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { useScale } from "./RoomProvider";

const RoomTableWP = withMousePosition(RoomTable);

interface ListTablesProps {
  tables: TableData[];
  btnSize: number;
  editable?: boolean;
  onClick?: ((id: string) => void) | null;
}

export const ListTables = React.memo(
  ({ tables, btnSize, editable = false, onClick = null }: ListTablesProps) => {
    const [tableActive, setTableActive] = useState<string | null>(null);
    const { scale, getScale } = useScale();
    const { updateTable, deleteTable } = useTableDataStore((state) => state);

    const handleMove = useCallback(
      (id: string, position: Position) => {
        if (!editable) return;
        const currentScale = getScale();
        const scalePosition = {
          left: position.left / currentScale,
          top: position.top / currentScale,
        };
        updateTable(id, { position: scalePosition });
      },
      [updateTable, getScale]
    );

    const handleChangeSelected = useCallback(
      (id: string, selected: boolean) => {
        if (!editable) return;
        updateTable(id, { selected });
      },
      [updateTable]
    );

    const handleClick = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
      if (!editable) {
        onClick?.(id);
        return;
      }
      if (tableActive === id) {
        setTableActive(null);
        updateTable(id, { selected: false });
        return;
      }
      setTableActive(id);
      updateTable(id, { selected: true });
    };

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setTableActive(null);
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [tables, updateTable]);

    return tables.map((table: TableData) => {
      const left = table.position.left * scale;
      const top = table.position.top * scale;
      const isActive = table.id === tableActive;

      const TableComponent = isActive ? RoomTableWP : RoomTable;

      return (
        <TableComponent
          key={table.id}
          id={table.id}
          table={table}
          btnSize={btnSize}
          onDelete={deleteTable}
          onMove={handleMove}
          changeSelected={handleChangeSelected}
          draggable={isActive}
          trace={false}
          withTitleBar={false}
          withToggleLock={false}
          titleText={table.tableText}
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
          }}
          scale={scale}
          onClick={(e) => handleClick(e, table.id)}
          isActive={isActive}
          setActiveTable={setTableActive}
        />
      );
    });
  }
);

ListTables.displayName = "ListTables";
