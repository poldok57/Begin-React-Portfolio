import React, { useEffect, useRef, useState } from "react";
import { GroupCreat } from "./GroupCreat";
import { Rectangle } from "@/lib/canvas/types";
import { TableData } from "./types";
import { RectPosition as Position } from "@/lib/canvas/types";
import { useTableDataStore } from "./stores/tables";
import { isTouchDevice } from "@/lib/utils/device";
import { addEscapeKeyListener } from "@/lib/utils/keyboard";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomMenu2 } from "./menu/RoomMenu2";
import { GroundSelection } from "./GroundSelection/GroundSelection";
import { RoomProvider, useRoomContext } from "./RoomProvider";
import { ListTablesPlan } from "./ListTablesPlan";
import { ListTablesText } from "./ListTablesText";
import { ValidationFrame } from "./ValidationFrame";
import { Mode } from "./types";
import { DrawingProvider } from "@/context/DrawingContext";
import { useDrawingContext } from "@/context/DrawingContext";
import { DRAWING_MODES } from "@/lib/canvas/canvas-defines";
import { TypeListTables } from "./types";
import { useHistoryStore } from "@/lib/stores/history";
export const GROUND_ID = "back-ground";

const DESIGN_STORE_NAME = "room-design-storge";

const MARGIN = 10;

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
  uniqueId?: string | null;
}

export const RoomCreatTools = () => {
  const { updateTable, resetSelectedTables, getTable, getSelectedTables } =
    useTableDataStore((state) => state);

  const btnSize = isTouchDevice() ? 20 : 16;
  const tables = useTableDataStore((state) => state.tables);
  const {
    getElementRect,
    mode,
    setMode,
    addSelectedTableId,
    removeSelectedTableId,
    setStoreName,
  } = useRoomContext();

  const { setDrawingMode } = useDrawingContext();

  const { addEntry } = useHistoryStore();

  useEffect(() => {
    if (mode === null) {
      setMode(Mode.create);
    } else if (mode !== Mode.draw) {
      setDrawingMode(DRAWING_MODES.PAUSE);
    }
    setStoreName(DESIGN_STORE_NAME);
  }, [mode]);

  const [preSelection, setPreSelection] = useState<Rectangle | null>(null);
  const groundRef = useRef<HTMLDivElement>(null);

  const selectedArea = useRef<boolean>(false);

  const [typeListMode, setTypeListMode] = useState<TypeListTables>(
    TypeListTables.plan
  );

  const updateTablePosition = (
    table: TableData,

    position?: { left?: number; top?: number },
    offset?: { left?: number; top?: number },
    rotation?: number
  ) => {
    if (!position) {
      if (!offset || (offset.left === 0 && offset.top === 0)) {
        return false;
      }
      const newPosition = {
        left: Math.round(table.position.left + (offset?.left ?? 0)),
        top: Math.round(table.position.top + (offset?.top ?? 0)),
      };
      const updateData: Partial<TableData> = {
        position: newPosition as Position,
      };
      if (rotation !== undefined) {
        updateData.rotation = rotation;
      }
      updateTable(table.id, updateData);

      return true;
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

    if (
      newPosition.left === table.position.left &&
      newPosition.top === table.position.top
    ) {
      return false;
    }

    updateTable(table.id, { position: newPosition as Position });
    return true;
  };

  const changeCoordinates = ({
    position,
    offset,
    rotation,
    tableIds,
    uniqueId,
  }: ChangeCoordinatesParams) => {
    // If no table ID is specified, use the selected tables
    const ids = tableIds || getSelectedTables().map((table) => table.id);

    // console.log("changeCoordinates", position, offset, tableIds, uniqueId);
    if (ids.length === 0) return;

    //    register the state before modification if uniqueId is new
    const lastEntry = useHistoryStore.getState().getLastEntry();
    const isNewAction = uniqueId && (!lastEntry || lastEntry.id !== uniqueId);
    let tablesBeforeChange: {
      id: string;
      previousPosition: Position;
      previousRotation?: number;
    }[] = [];
    if (isNewAction) {
      // save the state before modification
      tablesBeforeChange = ids
        .map((id) => {
          const table = getTable(id);
          if (!table) return null;

          return {
            id,
            previousPosition: { ...table.position },
            previousRotation: table.rotation,
          };
        })
        .filter(Boolean) as {
        id: string;
        previousPosition: Position;
        previousRotation?: number;
      }[];
    }

    // Apply the changes
    let nbTableUpdated = 0;
    ids.forEach((id) => {
      const table = getTable(id);
      if (table) {
        if (updateTablePosition(table, position, offset, rotation)) {
          nbTableUpdated++;
        } else {
          tablesBeforeChange = tablesBeforeChange.filter(
            (table) => table.id !== id
          );
        }
      }
    });

    // add the entry if there is a uniqueId and the number of table updated is greater than 0 and the number of table before change is greater than 0
    if (uniqueId && nbTableUpdated > 0 && tablesBeforeChange.length > 0) {
      addEntry({
        id: uniqueId,
        tables: tablesBeforeChange,
      });
    }
  };

  const onZoneSelectedStart = () => {
    selectedArea.current = true;
  };

  const onZoneSelectedEnd = (rect: Rectangle | null) => {
    if (!rect) {
      if (mode === Mode.create) {
        resetSelectedTables();
      }
      selectedArea.current = false;
      return;
    }

    const right = rect.right ?? rect.left + rect.width;
    const bottom = rect.bottom ?? rect.top + rect.height;

    const freshTables = useTableDataStore.getState().tables;

    const updatedTables = freshTables.map((table) => {
      const tableElement = document.getElementById(table.id);
      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();

        const limitWidth = tableRect.width / 2 - MARGIN;
        const limitHeight = tableRect.height / 2 - MARGIN;

        const isInside =
          tableRect.left + limitWidth >= rect.left &&
          tableRect.right - limitWidth <= right &&
          tableRect.top + limitHeight >= rect.top &&
          tableRect.bottom - limitHeight <= bottom;

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
  };

  const addSelectedRect = (rect: Rectangle) => {
    setPreSelection(rect);
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
                  changeCoordinates={changeCoordinates}
                />
                <ValidationFrame btnSize={btnSize} isTouch={isTouchDevice()} />
              </>
            ) : typeListMode === "list" ? (
              <ListTablesText />
            ) : null}
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
        </div>
      </div>
    </>
  );
};

// Wrap the component with ScaleProvider
export const RoomCreat = () => (
  <RoomProvider>
    <DrawingProvider>
      <RoomCreatTools />
    </DrawingProvider>
  </RoomProvider>
);
