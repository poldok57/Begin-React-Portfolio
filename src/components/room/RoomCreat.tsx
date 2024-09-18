import React, { useEffect, useRef, useState } from "react";
import { GroupCreat } from "./GroupCreat";
import { Rectangle } from "@/lib/canvas/types";
import { DesignElement, DesignType, TableData } from "./types";
import { RectPosition as Position } from "@/lib/canvas/types";
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

export const getGroundOffset = () => {
  const ground = document.getElementById(GROUND_ID);
  if (ground) {
    const { left, top } = ground.getBoundingClientRect();
    const { scrollLeft, scrollTop } = ground;
    return {
      left: scrollLeft - left,
      top: scrollTop - top,
    };
  }
  return { left: 0, top: 0 };
};

export const RoomCreatTools = () => {
  const { updateTable, addDesignElement, getTable, getSelectedTables } =
    useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);
  const { getSelectedRect, getElementRect } = useScale();

  const [preSelection, setPreSelection] = useState<Rectangle | null>(null);
  const groundRef = useRef<HTMLDivElement>(null);

  const selectedArea = useRef<boolean>(false);
  const selectedTablesRef = useRef<TableData[]>([]);

  const updateTablePosition = (
    table: TableData,
    position?: { left?: number; top?: number },
    offset?: { left?: number; top?: number }
  ) => {
    if (!position) {
      const newPosition = {
        left: table.position.left + (offset?.left ?? 0),
        top: table.position.top + (offset?.top ?? 0),
      };
      updateTable(table.id, { position: newPosition as Position });
      return;
    }
    const newPosition = {
      left: table.position.left,
      top: table.position.top,
    };
    // get element rect with real size without scale
    const rect = getElementRect(table.id);
    // convert axis position to border position
    if (position.left !== undefined) {
      // Log pour comparer offsetWidth et Rect.width
      newPosition.left = Math.round(position.left - (rect?.width ?? 0) / 2);
    }
    if (position.top !== undefined) {
      newPosition.top = Math.round(position.top - (rect?.height ?? 0) / 2);
    }

    updateTable(table.id, { position: newPosition as Position });
  };

  const changeCoordinates = ({
    position,
    offset,
    tableIds,
  }: {
    position?: { left?: number; top?: number };
    offset?: { left?: number; top?: number };
    tableIds?: string[] | null;
  }) => {
    if (!tableIds) {
      // Find all selected tables
      const selectedTables = getSelectedTables();

      // Move all selected tables
      selectedTables.forEach((table) => {
        updateTablePosition(table, position, offset);
      });

      // Update selectedTablesRef
      selectedTablesRef.current = selectedTables;

      return;
    }

    tableIds.forEach((id) => {
      const table = getTable(id);
      if (table) {
        updateTablePosition(table, position, offset);
      }
    });
  };

  const onZoneSelectedStart = () => {
    selectedArea.current = true;
  };

  const upDateSelectedTables = (tables: TableData[] | null = null) => {
    if (!tables) {
      tables = useTableDataStore.getState().tables;
    }

    selectedTablesRef.current = tables.filter((table) => table.selected);
  };

  const resetSelectedTables = () => {
    tables.forEach((table) => {
      updateTable(table.id, { selected: false });
    });
    selectedTablesRef.current = [];
  };

  const onZoneSelectedEnd = (rect: Rectangle | null) => {
    if (!rect) {
      tables.forEach((table) => {
        updateTable(table.id, { selected: false });
      });
      selectedArea.current = false;

      return;
    }

    const freshTables = useTableDataStore.getState().tables;

    const updatedTables = freshTables.map((table) => {
      const tableElement = document.getElementById(table.id);
      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();
        const isInside =
          tableRect.left >= rect.left - MARGIN &&
          tableRect.right <= (rect?.right || rect.left + rect.width) + MARGIN &&
          tableRect.top >= rect.top - MARGIN &&
          tableRect.bottom <= (rect?.bottom || rect.top + rect.height) + MARGIN;

        const offset = {
          left: Math.round(tableRect.left - rect.left),
          top: Math.round(tableRect.top - rect.top),
        };
        return { ...table, selected: isInside, offset };
      }
      return table;
    });

    updatedTables.forEach((table) => {
      updateTable(table.id, { selected: table.selected });
    });

    upDateSelectedTables(updatedTables);
  };

  const addSelectedRect = (rect: Rectangle) => {
    setPreSelection(rect);

    upDateSelectedTables();
  };

  const handleRecordDesing = (
    type: DesignType = DesignType.square,
    color: string,
    name: string,
    opacity: number = 100
  ) => {
    const rect = getSelectedRect();
    if (!rect && type === DesignType.square) {
      return;
    }

    const designElement: DesignElement = {
      id: "",
      type,
      name: name,
      rect,
      color,
      opacity: opacity <= 1 ? opacity : opacity / 100,
    };
    addDesignElement(designElement);
  };

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
          recordDesign={handleRecordDesing}
          addSelectedRect={addSelectedRect}
          resetSelectedTables={resetSelectedTables}
        />
        <GroundSelection
          ref={groundRef}
          id={GROUND_ID}
          idContainer={CONTAINER_ID}
          changeCoordinates={changeCoordinates}
          onSelectionStart={onZoneSelectedStart}
          onSelectionEnd={onZoneSelectedEnd}
          preSelection={preSelection}
        >
          <ListTables tables={tables} btnSize={btnSize} editable={true} />
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
