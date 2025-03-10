import React, { useCallback, useEffect } from "react";
import { Coordinate, RectPosition as Position } from "@/lib/canvas/types";
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
    const { scale, getScale, mode, tablesStoreName, alignBy } = useRoomStore();

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
          x: position.left / currentScale,
          y: position.top / currentScale,
        };

        const withHistory = true;
        const adjustNeeded = true;

        // console.log(
        //   "move table",
        //   id,
        //   position,
        //   withHistory ? "with history" : "",
        //   adjustNeeded ? "adjust needed" : "",
        //   "align:" + alignBy
        // );

        const movedTable = tables.find((table) => table.id === id);
        if (!movedTable) return;

        // Get table dimensions from HTML element
        const tableElement = document.getElementById(id);
        if (!tableElement) return;

        const halfSize = {
          width: tableElement.offsetWidth / (2 * currentScale),
          height: tableElement.offsetHeight / (2 * currentScale),
        };

        const tableIntervalMin = {
          width: tableElement.offsetWidth / (2 * currentScale),
          height: tableElement.offsetHeight / (2 * currentScale),
        };

        if (adjustNeeded) {
          // Adjust the position based on other tables
          tables.forEach((otherTable) => {
            if (otherTable.id === id) return;

            const otherPos = otherTable.center;
            const horizontalDistance = scalePosition.x - otherPos.x;
            const verticalDistance = scalePosition.y - otherPos.y;
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
                scalePosition.x = otherPos.x + tableIntervalMin.width * sign;
              } else {
                // Adjust vertically only
                const sign = verticalDistance > 0 ? 1 : -1;
                scalePosition.y = otherPos.y + tableIntervalMin.height * sign;
              }
            }
          });
        }

        if (withHistory) {
          // changeCoordinates use center of the table to adjust position
          if (alignBy === "topLeft") {
            scalePosition.x = scalePosition.x + halfSize.width;
            scalePosition.y = scalePosition.y + halfSize.height;
          }
          changeCoordinates?.({
            position: {
              left: scalePosition.x,
              top: scalePosition.y,
            },
            tableIds: [id],
            uniqueId: generateUniqueId("mv"),
          });
        } else {
          updateTable(id, { center: scalePosition });
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
      const tablePos = selectedTable.center;
      const otherTables = tables.filter((table) => table.id !== id);
      const isSuperposed = otherTables.some((table) => {
        const otherPos: Coordinate = table.center;
        const horizontalDistance = tablePos.x - otherPos.x;
        const verticalDistance = tablePos.y - otherPos.y;
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
        const newTop = tablePos.y - tableIntervalMin.height;
        updateTable(id, {
          center: {
            x: tablePos.x,
            y: newTop,
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
