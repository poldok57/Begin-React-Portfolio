import React, { useEffect, useRef } from "react";
import { GroupCreat } from "./GroupCreat";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { DesignElement, DesignType, TableData } from "./types";
import { useTableDataStore } from "./stores/tables";
import { isTouchDevice } from "@/lib/utils/device";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { RoomMenu } from "./RoomMenu";
import { GroundSelection } from "./GroundSelection";

export const GROUND_ID = "back-ground";

const MARGIN = 10;

const RoomTableWP = withMousePosition(RoomTable);

export const RoomCreat = () => {
  const { updateTable, deleteTable, addDesignElement, getTable } =
    useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);
  const handleDelete = (id: string) => {
    deleteTable(id);
  };
  const selectedRect = useRef<Rectangle | null>(null);

  const handleMove = (id: string, position: Position) => {
    updateTable(id, { position });
  };
  const handleChangeSelected = (id: string, selected: boolean) => {
    if (selectedArea.current) {
      // console.log("No change status ... area is selected");
      return;
    }
    updateTable(id, { selected });
  };

  const selectedArea = useRef<boolean>(false);
  const selectedTablesRef = useRef<TableData[]>([]);

  const onZoneSelectedStart = (_clientX: number, _clientY: number) => {
    selectedArea.current = true;
  };

  const onZoneSelectedMove = (clientX: number, clientY: number) => {
    if (!selectedArea.current) return;

    selectedTablesRef.current.forEach((table) => {
      if (table.offset) {
        const position: Position = {
          left: Math.round(clientX + table.offset.left),
          top: Math.round(clientY + table.offset.top),
        };
        updateTable(table.id, { position });

        const tableElement = document.getElementById(table.id);
        if (tableElement) {
          tableElement.style.position = "absolute";
          tableElement.style.left = `${position.left}px`;
          tableElement.style.top = `${position.top}px`;
        }
      }
    });
  };

  const onZoneSelectedEnd = (rect: Rectangle | null) => {
    if (!rect) {
      tables.forEach((table) => {
        updateTable(table.id, { offset: undefined, selected: false });
      });
      selectedRect.current = null;
      selectedArea.current = false;

      return;
    }
    selectedRect.current = rect;

    // get a fresh copy of the tables array from the store
    const freshTables = useTableDataStore.getState().tables;

    const updatedTables = freshTables.map((table) => {
      const tableElement = document.getElementById(table.id);
      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();
        const isInside =
          tableRect.left >= rect.left - MARGIN &&
          tableRect.right <= rect.right + MARGIN &&
          tableRect.top >= rect.top - MARGIN &&
          tableRect.bottom <= rect.bottom + MARGIN;

        const offset = {
          left: tableRect.left - rect.left,
          top: tableRect.top - rect.top,
        };
        return { ...table, selected: isInside, offset };
      }
      return table;
    });

    selectedTablesRef.current = updatedTables.filter((table) => table.selected);

    updatedTables.forEach((table) => {
      updateTable(table.id, { selected: table.selected, offset: table.offset });
    });
  };

  const handleHorizontalMove = (left: number, listId: string[]) => {
    // console.log("handleHorizontalMove", left, listId);
    listId.forEach((id) => {
      const tableElement = document.getElementById(id);
      if (tableElement) {
        const table = getTable(id);
        if (!table) {
          return;
        }
        const { width } = tableElement.getBoundingClientRect();
        const position = {
          left: left - width / 2,
          top: table.position?.top ?? 0,
        };
        updateTable(id, { position });

        tableElement.style.left = `${position.left}px`;
        tableElement.style.top = `${position.top}px`;
      }
    });
  };

  const handleVerticalMove = (top: number, listId: string[]) => {
    console.log("handleVerticalMove", top, listId);
    listId.forEach((id) => {
      const tableElement = document.getElementById(id);
      if (tableElement) {
        const table = getTable(id);
        if (!table) {
          return;
        }
        const { height } = tableElement.getBoundingClientRect();
        const position = {
          left: table.position?.left ?? 0,
          top: top - height / 2,
        };
        updateTable(id, { position });

        tableElement.style.left = `${position.left}px`;
        tableElement.style.top = `${position.top}px`;
      }
    });
  };

  const handleRecordBackground = (
    color: string,
    name: string,
    opacity: number = 100
  ) => {
    if (!selectedRect.current) {
      return;
    }

    console.log("rect:", selectedRect.current);
    const { left, top, width, height } = selectedRect.current;

    const background: DesignElement = {
      id: "",
      type: DesignType.background,
      name: name,
      rect: {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
      },
      color,
      opacity: opacity <= 1 ? opacity : opacity / 100,
    };
    addDesignElement(background);

    console.log(color, name);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        tables.forEach((table) => {
          updateTable(table.id, { selected: false });
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="flex w-full bg-background"
      style={{ height: "calc(100vh - 70px)" }}
    >
      <div className="flex flex-row w-full">
        <GroupCreat />
        <RoomMenu btnSize={btnSize} reccordBackround={handleRecordBackground} />
        <GroundSelection
          id={GROUND_ID}
          onSelectionStart={onZoneSelectedStart}
          onSelectionMove={onZoneSelectedMove}
          onSelectionEnd={onZoneSelectedEnd}
          onHorizontalMove={handleHorizontalMove}
          onVerticalMove={handleVerticalMove}
        >
          {tables.map((table, index) => {
            const left = table?.position?.left ?? 50 + index * 10;
            const top = table?.position?.top ?? 50 + index * 10;
            return (
              <RoomTableWP
                key={table.id}
                id={table.id}
                table={table}
                btnSize={btnSize}
                onDelete={handleDelete}
                onMove={handleMove}
                changeSelected={handleChangeSelected}
                draggable={true}
                trace={false}
                withTitleBar={false}
                withToggleLock={false}
                titleText={table.tableText}
                style={{
                  position: "absolute",
                  left: `${left}px`,
                  top: `${top}px`,
                }}
              />
            );
          })}
        </GroundSelection>
      </div>
    </div>
  );
};
