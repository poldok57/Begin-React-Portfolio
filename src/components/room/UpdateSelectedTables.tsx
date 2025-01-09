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
import { ShowTable } from "./ShowTable";
import { RotationButtons } from "./control/RotationButtons";
import { ResizeButtons } from "./control/ResizeButtons";
import { DeleteSelectedTables } from "./control/DeleteSelectedTables";
import { RotationSquad } from "./control/RotationSquad";
import { useRoomContext } from "./RoomProvider";
import { Mode, TableType } from "./types";
import { Menu } from "./RoomMenu";

import { withMousePosition } from "../windows/withMousePosition";
import { menuRoomVariants } from "@/styles/menu-variants";

interface UpdateSelectedTablesMenuProps {
  btnSize: number;
  isTouch: boolean;
  setActiveMenu: (menu: Menu | null) => void;
}

const UpdateSelectedTablesMenu: React.FC<UpdateSelectedTablesMenuProps> = ({
  btnSize,
  isTouch,
}) => {
  const {
    tables,
    rotationSelectedTable,
    sizeSelectedTable,
    deleteSelectedTable,
    updateSelectedTables,
  } = useTableDataStore();

  const [selectedTablesCount, setSelectedTablesCount] = useState(0);
  const [editSettings, setEditSettings] = useState<TableSettings | null>(null);
  const [tableType, setTableType] = useState<TableType | null>(TableType.poker);
  const saveSettings = (newSettings: TableSettings | null) => {
    setEditSettings(newSettings);
    updateSelectedTables({ settings: newSettings });
  };

  const saveTableType = (tableType: TableType) => {
    setTableType(tableType);
    updateSelectedTables({ type: tableType });
  };

  const handlePowerOff = () => {
    updateSelectedTables({ groupId: null });
  };

  const handleDeleteSelectedTable = () => {
    if (selectedTablesCount > 0) {
      deleteSelectedTable();
    }
  };

  useEffect(() => {
    const selectedTables = tables.filter((table) => table.selected);
    setSelectedTablesCount(selectedTables.length);
  }, [tables]);

  return (
    <div className={menuRoomVariants({ width: 44 })}>
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
            confirmClassName="p-0 w-36 btn btn-circle btn-warning"
            className="btn btn-sm"
          >
            <PowerOff size={btnSize} />
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
  const { setMode } = useRoomContext();

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
        >
          Table modifications
        </Button>
      </div>
      {activeMenu === Menu.updateTable && (
        <UpdateSelectedTablesMenuWP
          btnSize={btnSize}
          isTouch={isTouch}
          setActiveMenu={setActiveMenu}
          onClose={() => setActiveMenu(null)}
          className="absolute z-30 translate-y-24"
          withToggleLock={false}
          withTitleBar={true}
          titleText="Update Tables"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};
