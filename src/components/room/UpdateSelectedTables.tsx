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
import { useScale } from "./RoomProvider";

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
    updateTable,
    tables,
    getSelectedTables,
  } = useTableDataStore();

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [selectedTablesCount, setSelectedTablesCount] = useState(0);

  const [editSettings, setEditSettings] = useState<TableSettings | null>(null);

  const saveSettings = (newSettings: TableSettings | null) => {
    setEditSettings(newSettings);

    updateSelectedTable({ settings: newSettings });
  };

  const { setRotation, getRotation, getSelectedRect, getElementRect } =
    useScale();

  const setRotationSquade = (angle: number) => {
    const rotation = getRotation();
    console.log("get Rotation", rotation);
    const newRotation = (rotation + angle) % 360;

    const selectedTables = getSelectedTables();
    const selectedRect = getSelectedRect();
    // get the center of the selected rect
    if (selectedRect) {
      const centerX = selectedRect.left + selectedRect.width / 2;
      const centerY = selectedRect.top + selectedRect.height / 2;
      const cos = Math.cos((angle * Math.PI) / 180);
      const sin = Math.sin((angle * Math.PI) / 180);

      selectedTables.forEach((table) => {
        const rect = getElementRect(table.id);
        if (!rect) return;
        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        const tableCenterX = table.position.left + halfWidth;
        const tableCenterY = table.position.top + halfHeight;
        const dx = tableCenterX - centerX;
        const dy = tableCenterY - centerY;

        const position = {
          left: Math.round(centerX + (dx * cos - dy * sin) - halfWidth),
          top: Math.round(centerY + (dx * sin + dy * cos) - halfHeight),
        };

        // console.log(table.position, "=>", position);

        updateTable(table.id, {
          position,
          rotation: (table.rotation || 0) + angle,
        });
      });
    }

    console.log("set newRotation", newRotation);
    setRotation(newRotation);
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
            <div className="flex flex-col gap-1 justify-center text-center border-t-2 border-gray-500 border-opacity-50">
              Apply to squade
              <div className="flex flex-row gap-2 justify-between">
                <button
                  className="btn btn-circle btn-md"
                  onClick={() => setRotationSquade(-15)}
                >
                  <RotateCcw size={btnSize + 10} />
                </button>
                <button
                  className="btn btn-circle btn-md"
                  onClick={() => setRotationSquade(15)}
                >
                  <RotateCw size={btnSize + 10} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
