import React, { useState, useEffect, useRef } from "react";
import { Settings, X, PowerOff, Power } from "lucide-react";
import { TableSettings } from "../../types";
import {
  TableDataState,
  zustandTableStore,
} from "../../../../lib/stores/tables";
import { Button } from "@/components/atom/Button";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";

import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";
import { ShowTable } from "../../Tables/ShowTable";
import { RotationButtons } from "../../control/RotationButtons";
import { ResizeButtons } from "../../control/ResizeButtons";
import { DeleteSelectedTables } from "../../control/DeleteSelectedTables";
import { RotationSquad } from "../../control/RotationSquad";
import { useRoomStore } from "@/lib/stores/room";
import { Mode, TableType, Menu, TableData } from "../../types";
import { GroupSelection } from "../Groups/GroupSelection";
import { withMousePosition } from "../../../windows/withMousePosition";
import { menuRoomContainer, menuRoomVariants } from "@/styles/menu-variants";

interface UpdateSelectedTablesMenuProps {
  btnSize: number;
  isTouch: boolean;
  setActiveMenu: (menu: Menu | null) => void;
  tablesStoreName: string;
}

const UpdateSelectedTablesMenu: React.FC<UpdateSelectedTablesMenuProps> = ({
  btnSize,
  isTouch,
  tablesStoreName,
}) => {
  const storeNameRef = useRef(tablesStoreName);
  const namedStoreRef = useRef<TableDataState | null>(
    zustandTableStore(storeNameRef.current).getState()
  );

  // État local pour les tables sélectionnées
  const [selectedTables, setSelectedTables] = useState<TableData[]>([]);
  const [selectedTablesCount, setSelectedTablesCount] = useState(0);
  const [openTablesCount, setOpenTablesCount] = useState(0);
  const [closedTablesCount, setClosedTablesCount] = useState(0);
  const [editSettings, setEditSettings] = useState<TableSettings | null>(null);
  const [tableType, setTableType] = useState<TableType | null>(TableType.poker);

  // Fonction pour mettre à jour les compteurs
  const updateCounters = (tables: TableData[]) => {
    setSelectedTablesCount(tables.length);

    const openTables = tables.filter((table) => table.groupId);
    const closedTables = tables.filter((table) => !table.groupId);

    setOpenTablesCount(openTables.length);
    setClosedTablesCount(closedTables.length);

    // Mettre à jour le type de table si toutes les tables sélectionnées sont du même type
    if (tables.length > 0) {
      const firstType = tables[0].type;
      const allSameType = tables.every((table) => table.type === firstType);
      if (allSameType) {
        setTableType(firstType);
      }
    }
  };

  // Souscription aux changements du store
  useEffect(() => {
    const store = zustandTableStore(storeNameRef.current);
    namedStoreRef.current = store.getState();

    // Fonction de mise à jour
    const updateFromStore = () => {
      const tables = store.getState().tables.filter((table) => table.selected);
      setSelectedTables(tables);
      updateCounters(tables);
    };

    // Mise à jour initiale
    updateFromStore();

    // Souscription aux changements
    const unsubscribe = store.subscribe((state: TableDataState) => {
      const tables = state.tables.filter((table: TableData) => table.selected);
      setSelectedTables(tables);
      updateCounters(tables);
    });

    // Nettoyage
    return () => {
      unsubscribe();
    };
  }, [tablesStoreName]);

  const updateSelectedTables = (update: Partial<TableData>) => {
    namedStoreRef.current?.updateSelectedTables(update);
  };

  const rotationSelectedTable = (angle: number) => {
    namedStoreRef.current?.rotationSelectedTable(angle);
  };

  const sizeSelectedTable = (size: number) => {
    namedStoreRef.current?.sizeSelectedTable(size);
  };

  const updateTable = (id: string, update: Partial<TableData>) => {
    namedStoreRef.current?.updateTable(id, update);
  };

  const saveSettings = (newSettings: TableSettings | null) => {
    setEditSettings(newSettings);
    updateSelectedTables({ settings: newSettings });
  };

  const saveTableType = (tableType: TableType) => {
    setTableType(tableType);
    updateSelectedTables({ type: tableType });
  };

  const handlePowerOff = () => {
    updateSelectedTables({ groupId: undefined });
  };

  const handleDeleteSelectedTable = () => {
    if (selectedTablesCount > 0) {
      namedStoreRef.current?.deleteSelectedTable();
    }
  };

  // Open tables
  const handleOpenTables = (groupId: string | null) => {
    // Verify if the selected tables are already opened with this groupId
    const tablesToUpdate = selectedTables.filter(
      (table) => table.groupId === null
    );

    if (tablesToUpdate.length > 0) {
      // Update only the tables that need to be modified
      tablesToUpdate.forEach((table) => {
        updateTable(table.id, { groupId: groupId });
      });
    }
  };

  return (
    <div className={menuRoomVariants({ width: 56 })}>
      <div className="flex flex-col gap-2 justify-center">
        <i>
          Modifications apply to <b>{selectedTablesCount} selected table(s)</b>
        </i>
        <RotationButtons
          btnSize={btnSize}
          onRotateLeft={() => rotationSelectedTable(-15)}
          onRotateRight={() => rotationSelectedTable(15)}
        />
        <ResizeButtons
          btnSize={btnSize}
          onResizeSmaller={() => sizeSelectedTable(-10)}
          onResizeLarger={() => sizeSelectedTable(10)}
        />
        <div className="flex flex-col gap-2 px-4">
          <div className="flex flex-row justify-between">
            <Dialog blur={true}>
              <DialogOpen>
                <button className="btn btn-circle btn-sm">
                  <Settings size={btnSize} />
                </button>
              </DialogOpen>
              <DialogContent position="modal">
                <DialogClose>
                  <button className="absolute top-5 right-5 btn btn-circle btn-sm">
                    <X size={btnSize} />
                  </button>
                </DialogClose>
                <ShowTable
                  className="p-4 rounded-lg bg-background"
                  colors={null}
                  settings={editSettings}
                  title="table sélectionnée"
                  saveSettings={saveSettings}
                  resetTable={() => {
                    saveSettings(null);
                  }}
                  editing={true}
                  isTouch={isTouch}
                  tableType={tableType || TableType.poker}
                  setTableType={saveTableType}
                />
              </DialogContent>
            </Dialog>

            <DeleteSelectedTables
              btnSize={btnSize}
              selectedTablesCount={selectedTablesCount}
              onDelete={handleDeleteSelectedTable}
            />
          </div>
          {openTablesCount > 0 && (
            <DeleteWithConfirm
              position="top"
              onConfirm={handlePowerOff}
              confirmMessage={`Close ${openTablesCount} tables ?`}
              confirmClassName="p-0 w-36 btn btn-circle btn-warning"
              className="flex-nowrap w-full btn btn-sm"
            >
              <>
                <PowerOff size={btnSize} />
                Close {openTablesCount} table
                {openTablesCount > 1 ? "s" : ""}
              </>
            </DeleteWithConfirm>
          )}
          {closedTablesCount > 0 && (
            <Dialog blur={true}>
              <DialogOpen>
                <button className="flex-nowrap w-full text-nowrap btn btn-sm btn-primary">
                  <Power size={btnSize} className="mr-2" />
                  Open {closedTablesCount} table
                  {closedTablesCount > 1 ? "s" : ""}
                </button>
              </DialogOpen>
              <DialogContent position="modal">
                <DialogClose>
                  <button className="absolute top-5 right-5 btn btn-circle btn-sm">
                    <X size={btnSize} />
                  </button>
                </DialogClose>
                <GroupSelection
                  onSelect={handleOpenTables}
                  selectOnly={true}
                  preSelectType={tableType || TableType.poker}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <RotationSquad btnSize={btnSize} />
      </div>
    </div>
  );
};

const UpdateSelectedTablesMenuWP = withMousePosition(UpdateSelectedTablesMenu);
interface UpdateSelectedTablesProps {
  className: string;
  btnSize: number;
  isTouch: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const UpdateSelectedTables: React.FC<UpdateSelectedTablesProps> = ({
  className,
  btnSize,
  isTouch,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) => {
  const { setMode, tablesStoreName } = useRoomStore();

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          disabled={disabled}
          onClick={() => {
            setActiveMenu(Menu.updateTable);
            setMode(Mode.create);
          }}
          className={className}
          selected={activeMenu === Menu.updateTable}
          title="Table modifications"
        >
          Modifications
        </Button>
      </div>
      {activeMenu === Menu.updateTable && (
        <UpdateSelectedTablesMenuWP
          btnSize={btnSize}
          isTouch={isTouch}
          setActiveMenu={setActiveMenu}
          onClose={() => setActiveMenu(null)}
          className={menuRoomContainer()}
          withToggleLock={false}
          withTitleBar={true}
          titleText="Update Tables"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
          tablesStoreName={tablesStoreName}
        />
      )}
    </>
  );
};
