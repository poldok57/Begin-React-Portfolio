import React, { useState, useRef, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { TableSettings } from "./types";
import { useTableDataStore } from "./stores/tables";
import { Button } from "@/components/atom/Button";
import { ShowTable } from "./ShowTable";
import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";
import clsx from "clsx";
import { RotationButtons } from "./control/RotationButtons";
import { ResizeButtons } from "./control/ResizeButtons";
import { DeleteSelectedTables } from "./control/DeleteSelectedTables";
import { RotationSquad } from "./control/RotationSquad";

interface UpdateSelectedTablesProps {
  btnSize: number;
  className: string;
  isTouch: boolean;
}

export const UpdateSelectedTables: React.FC<UpdateSelectedTablesProps> = ({
  className,
  btnSize,
  isTouch,
}) => {
  const {
    rotationSelectedTable,
    sizeSelectedTable,
    deleteSelectedTable,
    updateSelectedTable,
    tables,
  } = useTableDataStore();

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedTablesCount, setSelectedTablesCount] = useState(0);
  const [editSettings, setEditSettings] = useState<TableSettings | null>(null);

  const saveSettings = (newSettings: TableSettings | null) => {
    setEditSettings(newSettings);
    updateSelectedTable({ settings: newSettings });
  };

  // const { setRotation, getRotation, getSelectedRect, getElementRect } =
  //   useScale();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      const selectedTables = tables.filter((table) => table.selected);
      setSelectedTablesCount(selectedTables.length);
    }
  }, [isOpen, tables]);

  const handleDeleteSelectedTable = () => {
    if (selectedTablesCount > 0) {
      deleteSelectedTable();
    }
  };

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <Button onClick={() => setIsOpen(!isOpen)}>Modifier les tables</Button>
      {isOpen && (
        <div className="absolute left-4 top-full z-40 p-2 mt-2 w-40 bg-white rounded-lg shadow-lg">
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
                  />
                </DialogContent>
              </Dialog>
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
