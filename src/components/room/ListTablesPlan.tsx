import React, { useCallback, useEffect } from "react";
import { TableData } from "./types";
import { useZustandTableStore } from "@/lib/stores/tables";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { useRoomStore } from "@/lib/stores/room";
import { Mode } from "./types";
import { useTablePositioning } from "./GroundSelection/hooks/useTablePositioning";

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
    const { scale, mode, tablesStoreName, alignBy } = useRoomStore();

    const tableStore = useZustandTableStore(tablesStoreName);

    const {
      updateTable,
      deleteTable,
      activeTable,
      setActiveTable,
      selectOneTable,
    } = tableStore.getState();

    const { handleMove, isSuperposed } = useTablePositioning();

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
        updateTable(id, { selected: undefined });
      } else {
        // when a table is selected, verify if is is superposed to another table
        isSuperposed(id);

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
      const left = (table.center?.x ?? 10) * scale;
      const top = (table.center?.y ?? 10) * scale;
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
          onMove={editable ? handleMove : undefined}
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
            transform:
              alignBy === "center" ? "translate(-50%, -50%)" : undefined,
          }}
          scale={scale}
          onClick={
            mode !== Mode.draw ? (e) => handleClick?.(e, table.id) : undefined
          }
          isActive={isActive}
          mode={mode}
          showButton={showButton}
          setActiveTable={setActiveTable}
          updateTable={updateTable}
          selectOneTable={selectOneTable}
        />
      );
    });
  }
);

ListTablesPlan.displayName = "ListTablesPlan";
