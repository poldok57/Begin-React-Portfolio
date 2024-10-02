import React, { useState, useEffect } from "react";
import { Settings, X, PowerOff } from "lucide-react";
import { TableSettings } from "./types";
import { useTableDataStore } from "./stores/tables";
import { Button } from "@/components/atom/Button";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";
import clsx from "clsx";
import { ShowTable } from "./ShowTable";
import { RotationButtons } from "./control/RotationButtons";
import { ResizeButtons } from "./control/ResizeButtons";
import { DeleteSelectedTables } from "./control/DeleteSelectedTables";
import { RotationSquad } from "./control/RotationSquad";
import { useRoomContext } from "./RoomProvider";
import { Mode, TableType } from "./types";
import { Menu } from "./RoomMenu";

interface UpdateSelectedTablesProps {
  btnSize: number;
  className: string;
  isTouch: boolean;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
}

export const UpdateSelectedTables: React.FC<UpdateSelectedTablesProps> = ({
  className,
  btnSize,
  isTouch,
  activeMenu,
  setActiveMenu,
}) => {
  const {
    rotationSelectedTable,
    sizeSelectedTable,
    deleteSelectedTable,
    updateSelectedTable,
    // countSelectedTables,
    tables,
  } = useTableDataStore();
  const { setMode } = useRoomContext();
  const [selectedTablesCount, setSelectedTablesCount] = useState(0);
  const [editSettings, setEditSettings] = useState<TableSettings | null>(null);
  const [tableType, setTableType] = useState<TableType | null>(TableType.poker);
  const saveSettings = (newSettings: TableSettings | null) => {
    setEditSettings(newSettings);
    updateSelectedTable({ settings: newSettings });
  };

  const saveTableType = (tableType: TableType) => {
    setTableType(tableType);
    updateSelectedTable({ type: tableType });
  };

  const handlePowerOff = () => {
    updateSelectedTable({ groupId: null });
  };

  useEffect(() => {
    if (activeMenu === Menu.updateTable) {
      const selectedTables = tables.filter((table) => table.selected);
      setSelectedTablesCount(selectedTables.length);
    }
  }, [activeMenu, tables]);

  const handleDeleteSelectedTable = () => {
    if (selectedTablesCount > 0) {
      deleteSelectedTable();
    }
  };

  return (
    <div className={clsx("relative", className)}>
      <Button
        onClick={() => {
          setActiveMenu(Menu.updateTable);
          setMode(Mode.create);
        }}
      >
        Table modifications
      </Button>
      {activeMenu === Menu.updateTable && (
        <div className="absolute left-4 top-full z-40 p-2 mt-2 w-40 bg-white rounded-lg shadow-lg translate-x-16">
          <div className="flex flex-col gap-2 justify-center">
            <i>
              Mofication apply to <b>{selectedTablesCount} selected table</b>
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
            <div className="flex flex-row justify-between px-4">
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
              <DeleteWithConfirm
                position="top"
                onConfirm={handlePowerOff}
                confirmMessage={`Close ${selectedTablesCount} tables ?`}
                className="p-0 w-36 btn btn-warning"
              >
                <button className="btn btn-circle btn-sm">
                  <PowerOff size={btnSize} />
                </button>
              </DeleteWithConfirm>

              <DeleteSelectedTables
                btnSize={btnSize}
                selectedTablesCount={selectedTablesCount}
                onDelete={handleDeleteSelectedTable}
              />
            </div>
            <RotationSquad btnSize={btnSize} />
          </div>
        </div>
      )}
    </div>
  );
};
