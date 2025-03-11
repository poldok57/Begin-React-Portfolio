import React, { useCallback, useEffect, useState, useRef } from "react";
import { TableData } from "./types";
import { useZustandTableStore } from "@/lib/stores/tables";
import { withMousePosition } from "@/components/windows/withMousePosition";
import { RoomTable } from "./RoomTable";
import { useRoomStore } from "@/lib/stores/room";
import { Mode } from "./types";
import { useTablePositioning } from "./GroundSelection/hooks/useTablePositioning";

const RoomTableWP = withMousePosition(RoomTable);

interface ListTablesProps {
  btnSize: number;
  editable?: boolean;
  onClick?: ((id: string) => void) | null;
}

export const ListTablesPlan = React.memo(
  ({ btnSize, editable = false, onClick = null }: ListTablesProps) => {
    // const [activeTable, setActiveTable] = useState<string | null>(null);
    const { scale, mode, tablesStoreName, alignBy } = useRoomStore();
    const [, setNeedRefresh] = useState(0);

    // Référence pour suivre le changement de tablesStoreName
    const prevStoreNameRef = useRef<string | null>(tablesStoreName);

    // Obtenir le store correspondant à la clé actuelle
    const tableStore = useZustandTableStore(tablesStoreName);

    // Forcer le rafraîchissement du composant lorsque le store change
    const [storeState, setStoreState] = useState(tableStore.getState());

    useEffect(() => {
      // Vérifier si la clé du store a changé
      if (prevStoreNameRef.current !== tablesStoreName) {
        // Mettre à jour la référence
        prevStoreNameRef.current = tablesStoreName;
        // Mettre à jour l'état avec le nouveau store
        setStoreState(tableStore.getState());
      }

      // S'abonner aux changements du store
      const unsubscribe = tableStore.subscribe((state) => {
        setStoreState(state);
      });

      // Se désabonner lors du démontage du composant ou lorsque la clé change
      return () => unsubscribe();
    }, [tableStore, tablesStoreName]);

    // Utiliser les valeurs du state actuel
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
