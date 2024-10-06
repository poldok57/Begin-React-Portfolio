import React, { useEffect, useRef, useState } from "react";
import { GroupCreat } from "./GroupCreat";
import { Rectangle } from "@/lib/canvas/types";
import { DesignElement, DesignType, TableData } from "./types";
import { RectPosition as Position } from "@/lib/canvas/types";
import { useTableDataStore } from "./stores/tables";
import { isTouchDevice } from "@/lib/utils/device";
import { addEscapeKeyListener } from "@/lib/utils/keyboard";
import { withMousePosition } from "@/components/windows/withMousePosition";
// import { RoomMenu } from "./RoomMenu";
import { RoomMenu2 } from "./RoomMenu2";
import { GroundSelection } from "./GroundSelection/GroundSelection";
import { RoomProvider, useRoomContext } from "./RoomProvider";
import { ListTablesPlan } from "./ListTablesPlan";
import { ListTablesText } from "./ListTablesText";
import { ValidationFrame } from "./ValidationFrame";
import { Mode } from "./types";

export const GROUND_ID = "back-ground";
export const CONTAINER_ID = "ground-container";

const MARGIN = 10;

export type TypeList = "plan" | "list";

// const RoomMenuWP = withMousePosition(RoomMenu);
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

export interface ChangeCoordinatesParams {
  position?: { left?: number; top?: number };
  offset?: { left?: number; top?: number };
  rotation?: number;
  tableIds?: string[] | null;
}

export const RoomCreatTools = () => {
  const {
    updateTable,
    updateSelectedTable,
    addDesignElement,
    getTable,
    getSelectedTables,
    deleteDesignElementByType,
  } = useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);
  const {
    getSelectedRect,
    getElementRect,
    getRotation,
    mode,
    setMode,
    addSelectedTableId,
    removeSelectedTableId,
  } = useRoomContext();

  if (mode === null) {
    console.log("RoomCreatTools setMode Create");
    setMode(Mode.create);
  }

  const [preSelection, setPreSelection] = useState<Rectangle | null>(null);
  const groundRef = useRef<HTMLDivElement>(null);

  const selectedArea = useRef<boolean>(false);
  // const selectedTablesRef = useRef<TableData[]>([]);

  const roundToTwoDigits = (value: number) => parseFloat(value.toFixed(2));

  const [typeListMode, setTypeListMode] = useState<TypeList>("plan");

  const updateTablePosition = (
    table: TableData,

    position?: { left?: number; top?: number },
    offset?: { left?: number; top?: number },
    rotation?: number
  ) => {
    if (!position) {
      const newPosition = {
        left: roundToTwoDigits(table.position.left + (offset?.left ?? 0)),
        top: roundToTwoDigits(table.position.top + (offset?.top ?? 0)),
      };
      const updateData: Partial<TableData> = {
        position: newPosition as Position,
      };
      if (rotation !== undefined) {
        updateData.rotation = rotation;
      }
      updateTable(table.id, updateData);

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
    rotation,
    tableIds,
  }: ChangeCoordinatesParams) => {
    if (!tableIds) {
      // Find all selected tables
      const selectedTables = getSelectedTables();

      // Move all selected tables
      selectedTables.forEach((table) => {
        updateTablePosition(table, position, offset, rotation);
      });

      // Update selectedTablesRef
      // selectedTablesRef.current = selectedTables;

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

  // const upDateSelectedTables = (tables: TableData[] | null = null) => {
  //   if (!tables) {
  //     tables = useTableDataStore.getState().tables;
  //   }

  //   // selectedTablesRef.current = tables.filter((table) => table.selected);
  // };

  const resetSelectedTables = () => {
    // tables.forEach((table) => {
    //   updateTable(table.id, { selected: false });
    // });
    updateSelectedTable({ selected: false });
    // selectedTablesRef.current = [];
  };

  const onZoneSelectedEnd = (rect: Rectangle | null) => {
    if (!rect) {
      if (mode === Mode.create) {
        updateSelectedTable({ selected: false });
      }
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

    // upDateSelectedTables(updatedTables);
  };

  const addSelectedRect = (rect: Rectangle) => {
    setPreSelection(rect);

    // upDateSelectedTables();
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
    const rotation = getRotation();
    if (rotation) {
      designElement.rotation = rotation;
    }
    if (type === DesignType.background) {
      deleteDesignElementByType(type);
    }
    addDesignElement(designElement);
  };

  const handleNumberingTableClick = (id: string) => {
    const table = getTable(id);
    if (!table) return;

    if (table.selected) {
      addSelectedTableId(id);
    } else {
      removeSelectedTableId(id);
    }
  };

  const onTableClick =
    mode === Mode.numbering ? handleNumberingTableClick : null;

  useEffect(() => {
    // manage escape event
    const handleEscapeEvent = () => {
      resetSelectedTables();
      setPreSelection(null);
    };

    // add escape event listener
    const removeListener = addEscapeKeyListener(handleEscapeEvent);

    // Cleanup the event listener when the component unmounts
    return () => {
      removeListener();
    };
  }, []);

  return (
    <>
      <RoomMenu2
        btnSize={btnSize}
        recordDesign={handleRecordDesing}
        addSelectedRect={addSelectedRect}
        typeListMode={typeListMode}
        setTypeListMode={setTypeListMode}
      />
      <div
        className="flex w-full bg-background"
        style={{ height: "calc(100vh - 140px)" }}
      >
        <div className="flex flex-row w-full">
          <GroundSelection
            ref={groundRef}
            id={GROUND_ID}
            containerId={CONTAINER_ID}
            changeCoordinates={changeCoordinates}
            onSelectionStart={onZoneSelectedStart}
            onSelectionEnd={onZoneSelectedEnd}
            preSelection={preSelection}
            typeListMode={typeListMode}
          >
            {typeListMode === "plan" ? (
              <>
                <ListTablesPlan
                  tables={tables}
                  btnSize={btnSize}
                  editable={mode !== Mode.numbering}
                  onClick={onTableClick}
                />
                <ValidationFrame btnSize={btnSize} isTouch={isTouchDevice()} />
              </>
            ) : (
              <ListTablesText maxRowsPerColumn={40} />
            )}
          </GroundSelection>
          <GroupCreatWP
            className="absolute top-0 left-0 z-10"
            withTitleBar={true}
            titleText="Group creat"
            titleHidden={false}
            titleBackground={"#99ee66"}
            withMinimize={true}
            draggable={true}
          />
          {/* <RoomMenuWP
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
          /> */}
        </div>
      </div>
    </>
  );
};

// Wrap the component with ScaleProvider
export const RoomCreat = () => (
  <RoomProvider>
    <RoomCreatTools />
  </RoomProvider>
);
