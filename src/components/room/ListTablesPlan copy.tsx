import React, { useCallback, useEffect } from "react";
import { Coordinate, RectPosition as Position } from "@/lib/canvas/types";
import { TableData } from "./types";
import { useZustandTableStore } from "@/lib/stores/tables";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { useRoomStore } from "@/lib/stores/room";
import { Mode } from "./types";
import { useTablePositioning } from "./GroundSelection/hooks/useTablePositioning";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

const RoomTableWP = withMousePosition(RoomTable);

interface ListTablesProps {
  tables: TableData[];
  btnSize: number;
  editable?: boolean;
  onClick?: ((id: string) => void) | null;
  changeCoordinates: (
    position: Position,
    tableIds: string[],
    uniqueId: string
  ) => void;
}

export const ListTablesPlan: React.FC<ListTablesProps> = ({
  tables,
  btnSize,
  editable = true,
  onClick = null,
}) => {
  // const [activeTable, setActiveTable] = useState<string | null>(null);
  const { scale, mode, tablesStoreName, alignBy } = useRoomStore();

  const tableStore = useZustandTableStore(tablesStoreName);

  const {
    updateTable,
    deleteTable,
    activeTable,
    setActiveTable,
    getTable,
    selectOneTable,
  } = tableStore.getState();

  const { handleMove } = useTablePositioning();

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

  return (
    <div className="relative w-full h-full">
      {tables.map((table) => {
        const left = (table.center?.x ?? 10) * scale;
        const top = (table.center?.y ?? 10) * scale;
        const isActive = table.id === activeTable;
        const showButton = mode === Mode.create && isActive;

        const TableComponent =
          isActive && mode === Mode.create ? RoomTableWP : RoomTable;

        return (
          <Draggable
            key={table.id}
            position={{
              x: table.center.x * scale,
              y: table.center.y * scale,
            }}
            scale={scale}
            onStop={(_e: DraggableEvent, data: DraggableData) => {
              editable && handleMove(table.id, { left: data.x, top: data.y });
            }}
            disabled={!editable}
          >
            <TableComponent
              id={table.id}
              table={table}
              btnSize={btnSize}
              onDelete={deleteTable}
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
                mode !== Mode.draw
                  ? (e) => handleClick?.(e, table.id)
                  : undefined
              }
              isActive={isActive}
              mode={mode}
              showButton={showButton}
              setActiveTable={setActiveTable}
              updateTable={updateTable}
              selectOneTable={selectOneTable}
            />
          </Draggable>
        );
      })}
    </div>
  );
};

ListTablesPlan.displayName = "ListTablesPlan";
