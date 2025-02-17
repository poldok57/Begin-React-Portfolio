import React, { useCallback, useEffect } from "react";
import { RectPosition as Position } from "@/lib/canvas/types";
import { TableData } from "./types";
import { useTableDataStore } from "./stores/tables";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { useRoomContext } from "./RoomProvider";
import { Mode } from "./types";
const RoomTableWP = withMousePosition(RoomTable);

interface ListTablesProps {
  tables: TableData[];
  btnSize: number;
  editable?: boolean;
  onClick?: ((id: string) => void) | null;
}

export const ListTablesPlan = React.memo(
  ({ tables, btnSize, editable = false, onClick = null }: ListTablesProps) => {
    // const [activeTable, setActiveTable] = useState<string | null>(null);
    const { scale, getScale, mode } = useRoomContext();
    const { updateTable, deleteTable, activeTable, setActiveTable } =
      useTableDataStore((state) => state);

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
      if (activeTable === id) {
        setActiveTable(null);
        updateTable(id, { selected: false });
      } else {
        setActiveTable(id);
        updateTable(id, { selected: true });
      }
      if (!editable) {
        // For numberinf mode
        onClick?.(id);
        return;
      }
    };

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setActiveTable(null);
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
      const isActive = table.id === activeTable;
      const showButton = mode === Mode.create && isActive;

      const TableComponent =
        isActive && mode === Mode.create ? RoomTableWP : RoomTable;

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
          onClick={
            mode !== Mode.draw ? (e) => handleClick?.(e, table.id) : undefined
          }
          isActive={isActive}
          mode={mode}
          showButton={showButton}
          setActiveTable={setActiveTable}
        />
      );
    });
  }
);

ListTablesPlan.displayName = "ListTablesPlan";
