import React, { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";

import { TableSettings } from "./types";
import { useTableDataStore } from "./stores/tables";
import { Button } from "@/components/atom/Button";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import { ShowTable } from "./ShowTable";
import {
  Dialog,
  DialogContent,
  DialogOpen,
  DialogClose,
} from "@/components/atom/Dialog";

import clsx from "clsx";

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

  const selectedTables = tables.filter((table) => table.selected);
  const selectedTablesCount = selectedTables.length;
  const [editSettings, setEditSettings] = useState<TableSettings | null>(null);

  const saveSettings = (newSettings: TableSettings | null) => {
    setEditSettings(newSettings);

    updateSelectedTable({ settings: newSettings });
  };

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

  const handleDeleteSelectedTable = () => {
    if (selectedTablesCount > 0) {
      deleteSelectedTable();
    }
  };
  return (
    <div className={clsx("relative", className)} ref={ref}>
      <Button onClick={() => setIsOpen(!isOpen)}>Modify tables</Button>
      {isOpen && (
        <div className="absolute left-4 top-full z-40 p-2 mt-2 w-40 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col gap-2 justify-center">
            <i>
              the changes apply to <b>{selectedTablesCount} selected tables</b>
            </i>
            <div className="flex flex-row gap-1 justify-center">
              <button
                className="btn btn-circle btn-sm"
                onClick={() => rotationSelectedTable(-15)}
              >
                <RotateCcw size={btnSize} />
              </button>
              <button
                className="btn btn-circle btn-sm"
                onClick={() => rotationSelectedTable(15)}
              >
                <RotateCw size={btnSize} />
              </button>
            </div>
            <div className="flex flex-row gap-1 justify-center">
              <button
                className="btn btn-circle btn-sm"
                onClick={() => sizeSelectedTable(-10)}
              >
                <Minus size={btnSize} />
              </button>
              <button
                className="btn btn-circle btn-sm"
                onClick={() => sizeSelectedTable(10)}
              >
                <Plus size={btnSize} />
              </button>
            </div>
            <div className="flex justify-center">
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
                    title="selected table"
                    saveSettings={saveSettings}
                    resetTable={() => {
                      saveSettings(null);
                    }}
                    editing={true}
                    isTouch={isTouch}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-center">
              <DeleteWithConfirm
                className="p-2 btn btn-sm"
                position="right"
                onConfirm={handleDeleteSelectedTable}
                confirmMessage={`delete ${selectedTablesCount} table${
                  selectedTablesCount > 1 ? "s" : ""
                }`}
              >
                <button className="btn btn-circle btn-sm">
                  <Trash2 size={btnSize} />
                </button>
              </DeleteWithConfirm>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
