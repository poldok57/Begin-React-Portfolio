import { useRef, useCallback } from "react";
import { useRoomStore } from "@/lib/stores/room";
import { useZustandTableStore } from "@/lib/stores/tables";
import { useHistoryStore } from "@/lib/stores/history";
import {
  Coordinate,
  Rectangle,
  RectPosition as Position,
} from "@/lib/canvas/types";
import { Mode, TableData } from "@/components/room/types";
import { generateUniqueId } from "@/lib/utils/unique-id";
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
  const { tablesStoreName, getElementRect, getMode, alignBy, getScale } =
    useRoomStore();
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

  /**
   * Handle the movement of a table by its ID and position
   * @param id - The ID of the table to move
   * @param position - The new position of the table
   * @param editable - Whether the table is editable
   * @returns void
   */

  const handleMove = useCallback(
    (id: string, position: Position) => {
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

      const movedTable = namedStoreRef.current?.getTable(id);
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
        const tables = namedStoreRef.current?.getAllTables() ?? [];
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
        namedStoreRef.current?.updateTable(id, { center: scalePosition });
      }
    },
    [getScale, changeCoordinates, tablesStoreName]
  );

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
  };

  const isSuperposed = (id: string) => {
    const tableElement = document.getElementById(id);
    if (!tableElement) return;
    const scale = getScale();
    const tableIntervalMin = {
      width: tableElement.offsetWidth / (2 * scale),
      height: tableElement.offsetHeight / (2 * scale),
    };
    const selectedTable = namedStoreRef.current?.getTable(id);
    if (!selectedTable) return;
    const tablePos = selectedTable.center;
    const otherTables = (namedStoreRef.current?.getAllTables() ?? []).filter(
      (table) => table.id !== id
    );
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
      namedStoreRef.current?.updateTable(id, {
        center: {
          x: tablePos.x,
          y: newTop,
        },
      });
      return;
    }
  };

  return {
    changeCoordinates,
    onSelectionStart,
    onSelectionEnd,
    handleMove,
    isSuperposed,
  };
};
