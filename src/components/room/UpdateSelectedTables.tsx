import React, { useState, useRef, useEffect } from "react";
import {
  RotateCcw,
  RotateCw,
  Minus,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useTableDataStore } from "./stores/tables";
import { Button } from "@/components/atom/Button";
import { DeleteWithConfirm } from "@/components/atom/DeleteWithConfirm";
import clsx from "clsx";

interface UpdateSelectedTablesProps {
  btnSize: number;
  className: string;
}

export const UpdateSelectedTables: React.FC<UpdateSelectedTablesProps> = ({
  className,
  btnSize,
}) => {
  const {
    rotationSelectedTable,
    sizeSelectedTable,
    deleteSelectedTable,
    tables,
  } = useTableDataStore((state) => ({
    rotationSelectedTable: state.rotationSelectedTable,
    sizeSelectedTable: state.sizeSelectedTable,
    deleteSelectedTable: state.deleteSelectedTable,
    tables: state.tables,
  }));
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedTables = tables.filter((table) => table.selected);
  const selectedTablesCount = selectedTables.length;

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
              <button
                className="btn btn-circle btn-sm"
                onClick={() => {
                  /* Logique pour modifier les paramètres */
                }}
              >
                <Settings size={btnSize} />
              </button>
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
