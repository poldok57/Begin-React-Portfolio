import React, { useCallback, useEffect } from "react";
import { RectPosition as Position } from "@/lib/canvas/types";
import { TableData } from "./types";
import { useZustandTableStore } from "../../lib/stores/tables";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { useRoomStore } from "@/lib/stores/room";
import { Mode } from "./types";
import { generateUniqueId } from "@/lib/utils/unique-id";
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
    const { scale, getScale, mode, tablesStoreName } = useRoomStore();

    const tableStore = useZustandTableStore(tablesStoreName);

    const {
      updateTable,
      deleteTable,
      activeTable,
      setActiveTable,
      getTable,
      selectOneTable,
    } = tableStore.getState();

    const { changeCoordinates } = useTablePositioning();

    const handleMove = useCallback(
      (id: string, position: Position) => {
        if (!editable) return;
        const currentScale = getScale();
        const scalePosition = {
          left: position.left / currentScale,
          top: position.top / currentScale,
        };

        const withHistory = true;

        const movedTable = tables.find((table) => table.id === id);
        if (!movedTable) return;

        // Get table dimensions from HTML element
        const tableElement = document.getElementById(id);
        if (!tableElement) return;

        const tableIntervalMin = {
          width: tableElement.offsetWidth / (2 * currentScale),
          height: tableElement.offsetHeight / (2 * currentScale),
        };

        // Adjust the position based on other tables
        tables.forEach((otherTable) => {
          if (otherTable.id === id) return;

          const otherPos = otherTable.position;
          const horizontalDistance = scalePosition.left - otherPos.left;
          const verticalDistance = scalePosition.top - otherPos.top;
          const absHorizontal = Math.abs(horizontalDistance);
          const absVertical = Math.abs(verticalDistance);

          // Determine the main axis of movement
          const isHorizontalMain = absHorizontal > absVertical;

          if (
            absHorizontal < tableIntervalMin.width &&
            absVertical < tableIntervalMin.height
          ) {
            if (isHorizontalMain) {
              // Adjust horizontally only
              const sign = horizontalDistance > 0 ? 1 : -1;
              scalePosition.left =
                otherPos.left + tableIntervalMin.width * sign;
            } else {
              // Adjust vertically only
              const sign = verticalDistance > 0 ? 1 : -1;
              scalePosition.top = otherPos.top + tableIntervalMin.height * sign;
            }
          }
        });

        if (withHistory) {
          // changeCoordinates use center of the table to adjust position
          changeCoordinates?.({
            position: {
              left:
                scalePosition.left +
                tableElement.offsetWidth / (2 * currentScale),
              top:
                scalePosition.top +
                tableElement.offsetHeight / (2 * currentScale),
            },
            tableIds: [id],
            uniqueId: generateUniqueId("mv"),
          });
        } else {
          updateTable(id, { position: scalePosition });
        }
      },
      [getScale, tables, scale, changeCoordinates, updateTable, tablesStoreName]
    );

    const handleChangeSelected = useCallback(
      (id: string, selected: boolean) => {
        if (!editable) return;
        updateTable(id, { selected });
      },
      [updateTable]
    );

    const isSuperposed = (id: string) => {
      const tableElement = document.getElementById(id);
      if (!tableElement) return;
      const tableIntervalMin = {
        width: tableElement.offsetWidth / (2 * scale),
        height: tableElement.offsetHeight / (2 * scale),
      };
      const selectedTable = getTable(id);
      if (!selectedTable) return;
      const tablePos = selectedTable.position;
      const otherTables = tables.filter((table) => table.id !== id);
      const isSuperposed = otherTables.some((table) => {
        const otherPos = table.position;
        const horizontalDistance = tablePos.left - otherPos.left;
        const verticalDistance = tablePos.top - otherPos.top;
        const absHorizontal = Math.abs(horizontalDistance);
        const absVertical = Math.abs(verticalDistance);
        return (
          absHorizontal < tableIntervalMin.width &&
          absVertical < tableIntervalMin.height
        );
      });
      if (isSuperposed) {
        // console.log("table is superposed to another table");
        // Move the selected table up by the minimum distance
        const newTop = tablePos.top - tableIntervalMin.height;
        updateTable(id, {
          position: {
            left: tablePos.left,
            top: newTop,
          },
        });
        return;
      }
    };

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
          updateTable={updateTable}
          selectOneTable={selectOneTable}
        />
      );
    });
  }
);

ListTablesPlan.displayName = "ListTablesPlan";
