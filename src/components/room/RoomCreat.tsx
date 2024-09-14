import React, { useEffect, useRef, useState, useCallback } from "react";
import { GroupCreat } from "./GroupCreat";
import { RectPosition as Position, Rectangle } from "@/lib/canvas/types";
import { DesignElement, DesignType, TableData } from "./types";
import { useTableDataStore } from "./stores/tables";
import { isTouchDevice } from "@/lib/utils/device";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomMenu } from "./RoomMenu";
import { GroundSelection } from "./GroundSelection";
import { RoomProvider, useScale } from "./RoomProvider";
import { ListTables } from "./ListTables";

export const GROUND_ID = "back-ground";
export const CONTAINER_ID = "ground-container";

const MARGIN = 10;

const RoomMenuWP = withMousePosition(RoomMenu);
const GroupCreatWP = withMousePosition(GroupCreat);

export const RoomCreatTools = () => {
  const { updateTable, addDesignElement, getTable } = useTableDataStore(
    (state) => state
  );

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);
  const { scale, getScale } = useScale();

  const [preSelection, setPreSelection] = useState<Rectangle | null>(null);
  const selectedRect = useRef<Rectangle | null>(null);
  const groundRect = useRef<Rectangle | null>(null);

  const setGroundRect = () => {
    const ground = document.getElementById(GROUND_ID);
    if (ground) {
      const groundRectangle = ground.getBoundingClientRect();
      groundRect.current = {
        left: groundRectangle.left,
        top: groundRectangle.top,
        width: groundRectangle.width,
        height: groundRectangle.height,
        right: groundRectangle.right,
        bottom: groundRectangle.bottom,
      };
    }
  };

  const selectedArea = useRef<boolean>(false);
  const selectedTablesRef = useRef<TableData[]>([]);

  const moveTable = useCallback(
    (
      table: TableData,
      position: { left?: number; top?: number },
      offset: Position | null = null
    ) => {
      const currentScale = getScale();
      const scalePosition = {
        left:
          position.left === undefined
            ? table.position.left
            : position.left / currentScale,
        top:
          position.top === undefined
            ? table.position.top
            : position.top / currentScale,
      };
      if (offset) {
        updateTable(table.id, { position: scalePosition, offset: offset });
      } else {
        updateTable(table.id, { position: scalePosition });
      }
      const tableElement = document.getElementById(table.id);
      if (tableElement) {
        tableElement.style.left = `${scalePosition.left * currentScale}px`;
        tableElement.style.top = `${scalePosition.top * currentScale}px`;
      }
    },
    [updateTable, getScale]
  );

  const onZoneSelectedStart = () => {
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
        moveTable(table, position);
      }
    });
  };

  const upDateSelectedTables = (tables: TableData[] | null = null) => {
    if (!tables) {
      tables = useTableDataStore.getState().tables;
    }

    selectedTablesRef.current = tables.filter((table) => table.selected);
  };

  const resetSelectedTables = () => {
    tables.forEach((table) => {
      updateTable(table.id, { offset: null, selected: false });
    });
    selectedTablesRef.current = [];
  };

  const onZoneSelectedEnd = (rect: Rectangle | null) => {
    if (!rect) {
      tables.forEach((table) => {
        updateTable(table.id, { offset: null, selected: false });
      });
      selectedRect.current = null;
      selectedArea.current = false;

      return;
    }

    setGroundRect();

    selectedRect.current = rect;

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
          left: Math.round(tableRect.left - rect.left),
          top: Math.round(tableRect.top - rect.top),
        };
        return { ...table, selected: isInside, offset };
      }
      return table;
    });

    updatedTables.forEach((table) => {
      updateTable(table.id, { selected: table.selected, offset: table.offset });
    });

    upDateSelectedTables(updatedTables);
  };

  const addSelectedRect = (rect: Rectangle) => {
    selectedRect.current = rect;
    setPreSelection(rect);

    upDateSelectedTables();
  };

  const handleHorizontalMove = (newLeft: number, listId: string[]) => {
    const container = document.getElementById(CONTAINER_ID);
    let containerLeft: number = 0;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      containerLeft = containerRect.left;
    }

    listId.forEach((id) => {
      const tableElement = document.getElementById(id);
      if (tableElement) {
        const table = getTable(id);
        if (!table) {
          return;
        }
        const { width } = tableElement.getBoundingClientRect();

        const newLeftPosition = Math.round(newLeft - width / 2);
        const position = {
          left: Math.round(newLeftPosition),
        };
        let newOffset: Position | null = null;
        if (table.offset && container) {
          newOffset = {
            left: Math.round(
              newLeftPosition -
                (containerLeft - (groundRect.current?.left || 0))
            ),
            top: table.offset.top,
          };
        }

        moveTable(table, position, newOffset);
      }
    });
    upDateSelectedTables();
  };

  const handleVerticalMove = (newTop: number, listId: string[]) => {
    const container = document.getElementById(CONTAINER_ID);
    let containerTop: number = 0;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      containerTop = containerRect.top;
    }

    listId.forEach((id) => {
      const tableElement = document.getElementById(id);
      if (tableElement) {
        const table = getTable(id);
        if (!table) {
          return;
        }
        const { height } = tableElement.getBoundingClientRect();
        const newTopPosition = Math.round(newTop - height / 2);
        const position = {
          top: Math.round(newTopPosition),
        };
        let newOffset: Position | null = null;
        if (table.offset) {
          newOffset = {
            left: table.offset.left,
            top: Math.round(
              newTopPosition - (containerTop - (groundRect.current?.top || 0))
            ),
          };
        }
        moveTable(table, position, newOffset);
      }
    });
    upDateSelectedTables();
  };

  const handleRecordBackground = (
    color: string,
    name: string,
    opacity: number = 100
  ) => {
    if (!selectedRect.current) {
      return;
    }

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
  };

  // const handleTableActivation = (id: string) => {
  //   setActiveTable(id === activeTable ? null : id);
  // };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetSelectedTables();
        setPreSelection(null);
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
      <div className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded border border-gray-300">
        <span className="text-sm font-semibold">
          Scale : {scale.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-row w-full">
        <GroupCreatWP
          className="absolute top-0 left-0 z-10"
          withTitleBar={true}
          titleText="Group creat"
          titleHidden={false}
          titleBackground={"#99ee66"}
          withMinimize={true}
          draggable={true}
        />
        <RoomMenuWP
          className="absolute top-2 left-40 z-10"
          withTitleBar={true}
          titleText="Room config"
          titleHidden={false}
          titleBackground={"#cc66ff"}
          withMinimize={true}
          draggable={true}
          btnSize={btnSize}
          reccordBackround={handleRecordBackground}
          addSelectedRect={addSelectedRect}
          resetSelectedTables={resetSelectedTables}
        />
        <GroundSelection
          id={GROUND_ID}
          idContainer={CONTAINER_ID}
          onSelectionStart={onZoneSelectedStart}
          onSelectionMove={onZoneSelectedMove}
          onSelectionEnd={onZoneSelectedEnd}
          onHorizontalMove={handleHorizontalMove}
          onVerticalMove={handleVerticalMove}
          preSelection={preSelection}
        >
          <ListTables
            tables={tables}
            btnSize={btnSize}
            // activeTable={activeTable}
            // onTableActivation={handleTableActivation}
          />
        </GroundSelection>
      </div>
    </div>
  );
};

// Wrap the component with ScaleProvider
export const RoomCreat = () => (
  <RoomProvider>
    <RoomCreatTools />
  </RoomProvider>
);
