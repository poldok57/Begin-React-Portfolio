import { useRef } from "react";
import { useRoomStore } from "@/lib/stores/room";
import { useZustandTableStore } from "@/lib/stores/tables";
import { useHistoryStore } from "@/lib/stores/history";
import { Coordinate, Rectangle } from "@/lib/canvas/types";
import { Mode, TableData } from "@/components/room/types";

import { TableDataState } from "@/lib/stores/tables";

const MARGIN = 10;

export interface ChangeCoordinatesParams {
  position?: { left?: number; top?: number };
  offset?: { left?: number; top?: number };
  rotation?: number;
  tableIds?: string[] | null;
  uniqueId?: string | null;
}

export const useTablePositioning = () => {
  const { tablesStoreName, getElementRect, getMode, alignBy } = useRoomStore();
  const namedStore = useZustandTableStore(tablesStoreName);
  const { addEntry } = useHistoryStore();

  const storeNameRef = useRef<string | null>(null);
  const namedStoreRef = useRef<TableDataState | null>(null);

  const selectedArea = useRef<boolean>(false);

  if (storeNameRef.current !== tablesStoreName) {
    namedStoreRef.current = namedStore.getState();
    storeNameRef.current = tablesStoreName;
  }
  /**
   * Update the position of a table
   */
  const updateTablePosition = (
    table: TableData,

    position?: { left?: number; top?: number },
    offset?: { left?: number; top?: number },
    rotation?: number
  ) => {
    let x = table.center.x;
    let y = table.center.y;
    if (position) {
      if (alignBy === "topLeft") {
        // get element rect with real size without scale
        const rect = getElementRect(table.id);
        // convert axis position to border position
        if (position.left !== undefined) {
          // Log pour comparer offsetWidth et Rect.width
          x = Math.round(position.left - (rect?.width ?? 0) / 2);
        }
        if (position.top !== undefined) {
          y = Math.round(position.top - (rect?.height ?? 0) / 2);
        }
      } else {
        x = Math.round(position?.left ?? x);
        y = Math.round(position?.top ?? y);
      }
    } else {
      // position table by translation
      if (!offset || (offset.left === 0 && offset.top === 0)) {
        return false;
      }
      x = Math.round(x + (offset?.left ?? 0));
      y = Math.round(y + (offset?.top ?? 0));
    }

    if (x === table.center.x && y === table.center.y) {
      return false;
    }

    const updateData: Partial<TableData> = {
      center: { x, y },
    };
    if (rotation !== undefined) {
      updateData.rotation = rotation;
    }

    // console.log("updateTablePosition", table.id, updateData);
    namedStoreRef.current?.updateTable(table.id, updateData);
    return true;
  };
  /**
   * Change the coordinates of tables
   */

  const changeCoordinates = ({
    position,
    offset,
    rotation,
    tableIds,
    uniqueId,
  }: ChangeCoordinatesParams) => {
    // If no table ID is specified, use the selected tables
    const ids =
      tableIds ||
      namedStoreRef.current?.getSelectedTables().map((table) => table.id) ||
      [];

    // console.log("changeCoordinates", position, offset, ids, uniqueId);
    if (ids.length === 0) return;

    //    register the state before modification if uniqueId is new
    const lastEntry = useHistoryStore.getState().getLastEntry();
    const isNewAction = uniqueId && (!lastEntry || lastEntry.id !== uniqueId);
    let tablesBeforeChange: {
      id: string;
      previousPosition: Coordinate;
      previousRotation?: number;
    }[] = [];
    if (isNewAction) {
      // save the state before modification
      tablesBeforeChange = ids
        .map((id) => {
          const table = namedStoreRef.current?.getTable(id);
          if (!table) return null;

          return {
            id,
            previousPosition: { ...table.center },
            previousRotation: table.rotation,
          };
        })
        .filter(Boolean) as {
        id: string;
        previousPosition: Coordinate;
        previousRotation?: number;
      }[];
    }

    // Apply the changes
    let nbTableUpdated = 0;
    ids.forEach((id: string) => {
      const table = namedStoreRef.current?.getTable(id);
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

  const onSelectionStart = () => {
    selectedArea.current = true;
  };

  const onSelectionEnd = (rect: Rectangle | null) => {
    if (!rect) {
      if (getMode() === Mode.create) {
        namedStoreRef.current?.resetSelectedTables();
      }
      selectedArea.current = false;
      return;
    }

    const right = rect.right ?? rect.left + rect.width;
    const bottom = rect.bottom ?? rect.top + rect.height;

    namedStoreRef.current?.resetSelectedTables();
    const freshTables = namedStoreRef.current?.getAllTables() ?? [];

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

    const selectedTables = updatedTables.filter((table) => table.selected);
    if (selectedTables.length > 0) {
      selectedTables.forEach((table) => {
        namedStoreRef.current?.updateTable(table.id, { selected: true });
      });
    }
    // console.log(
    //   "updatedTables",
    //   selectedTables.length,
    //   "/",
    //   updatedTables.length
    // );
  };

  return {
    changeCoordinates,
    onSelectionStart,
    onSelectionEnd,
  };
};
