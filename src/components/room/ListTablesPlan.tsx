import React, { useCallback, useEffect, useState, useRef } from "react";
import { TableData } from "./types";
import { useZustandTableStore } from "@/lib/stores/tables";
import { RoomTable } from "./Tables/RoomTable";
import { useRoomStore } from "@/lib/stores/room";
import { Mode } from "./types";
import { useTablePositioning } from "./GroundSelection/hooks/useTablePositioning";

import { withMousePosition } from "@/components/windows/withMousePosition";
import { usePlaceStore } from "@/lib/stores/places";

const RoomTableWP = withMousePosition(RoomTable);

interface ListTablesProps {
  btnSize: number;
  editable?: boolean;
  onClick?: ((id: string) => void) | null;
}

export const ListTablesPlan = React.memo(
  ({ btnSize, editable = false, onClick = null }: ListTablesProps) => {
    // const [activeTable, setActiveTable] = useState<string | null>(null);
    const { scale, mode, tablesStoreName } = useRoomStore();
    const [, setNeedRefresh] = useState(0);
    const { getCurrentPlace } = usePlaceStore();
    const currentPlace = getCurrentPlace();

    // Reference to track changes in tablesStoreName
    const prevStoreNameRef = useRef<string | null>(tablesStoreName);

    // Get the store corresponding to the current key
    const tableStore = useZustandTableStore(tablesStoreName);

    // Force a component refresh when the store changes
    const [storeState, setStoreState] = useState(tableStore.getState());

    useEffect(() => {
      // Check if the store key has changed
      if (prevStoreNameRef.current !== tablesStoreName) {
        // Update the reference
        prevStoreNameRef.current = tablesStoreName;
        // Update the state with the new store
        setStoreState(tableStore.getState());
      }

      // Subscribe to store changes
      const unsubscribe = tableStore.subscribe((state) => {
        setStoreState(state);
      });

      // Unsubscribe when the component is unmounted or when the key changes
      return () => unsubscribe();
    }, [tableStore, tablesStoreName]);

    // Use the current state values
    const {
      tables,
      activeTable,
      updateTable,
      deleteTable,
      setActiveTable,
      selectOneTable,
    } = storeState;

    const { handleMove, isSuperposed } = useTablePositioning();

    const handleChangeSelected = useCallback(
      (id: string, selected: boolean) => {
        if (!editable) return;
        updateTable(id, { selected });
      },
      [updateTable, editable]
    );

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
    }, [setActiveTable]);

    useEffect(() => {
      if (tables.length === 0) {
        setNeedRefresh((current) => current + 1);
      }
    }, [tables]);

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
          onMove={editable ? handleMove : undefined}
          changeSelected={handleChangeSelected}
          draggable={isActive}
          trace={false}
          withTitleBar={false}
          withToggleLock={false}
          titleText={table.tableText}
          isPokerEvent={currentPlace?.isPokerEvent ?? false}
          style={{
            position: "absolute",
            left: `${left}px`,
            top: `${top}px`,
            transform: "translate(-50%, -50%)",
          }}
          scale={scale}
          onClick={
            mode !== Mode.draw
              ? (e: React.MouseEvent<HTMLDivElement>) =>
                  handleClick?.(e, table.id)
              : undefined
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
