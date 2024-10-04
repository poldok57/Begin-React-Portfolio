import { useState, useRef } from "react";
import { Button } from "@/components/atom/Button";
import { SelectionItems } from "./SelectionItems";
import { useTableDataStore } from "./stores/tables";
import { TableType } from "./types";
import { RectangleHorizontal, X } from "lucide-react";
import { Rectangle, RectPosition as Position } from "@/lib/canvas/types";
import { useRoomContext } from "./RoomProvider";
import { Menu } from "./RoomMenu";
import { Mode } from "./types";
import { SelectTableType } from "./SelectTableType";
import {
  positionTable,
  calculateSelectedRect,
  DEFAULT_TABLE_SIZE,
} from "./scripts/room-add-tables";

interface RoomAddTablesProps {
  className: string;
  addSelectedRect: (rect: Rectangle) => void;
  resetSelectedTables: () => void;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  btnSize?: number;
}

export const RoomAddTables: React.FC<RoomAddTablesProps> = ({
  className,
  addSelectedRect,
  resetSelectedTables,
  activeMenu,
  setActiveMenu,
  btnSize = 14,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<{
    width: number;
    height: number;
  }>({ width: 2, height: 2 });
  const [selectedTableType, setSelectedTableType] = useState<TableType>(
    TableType.poker
  );

  const { addTable, tables } = useTableDataStore((state) => state);
  const { getSelectedRect, scale, setMode } = useRoomContext();

  const handleAddTable = (
    x: number,
    y: number,
    tableNumber: number,
    selectedRect: Rectangle
  ) => {
    const offsetStart = {
      left: selectedRect.left,
      top: selectedRect.top,
    };
    const position: Position = positionTable(offsetStart, x, y);
    const offset: Position = {
      left: (position.left - selectedRect.left) * scale,
      top: (position.top - selectedRect.top) * scale,
    };

    const newTable = {
      id: "",
      type: selectedTableType,
      selected: true,
      size: DEFAULT_TABLE_SIZE,
      position,
      offset,
      rotation: 0,
      tableNumber: `tmp${tableNumber}`,
      tableText: `Table ${tableNumber}`,
    };
    addTable(newTable);
  };

  const handleAddTables = () => {
    if (!selectedItems) {
      return;
    }

    const selectedRect = calculateSelectedRect({
      parentElement: ref.current?.parentElement ?? null,
      containerRect: getSelectedRect(),
      selectedItems,
      scale,
    });
    resetSelectedTables();

    let tableNumber = tables.length + 1;
    for (let y = 0; y < selectedItems.height; y++) {
      for (let x = 0; x < selectedItems.width; x++) {
        handleAddTable(x, y, tableNumber, selectedRect);
        tableNumber++;
      }
    }
    addSelectedRect(selectedRect);
    setActiveMenu(null);
  };

  return (
    <div
      ref={ref}
      className="flex relative flex-col p-1 w-full"
      onMouseOver={(e) => e.stopPropagation()}
    >
      <Button
        className={className}
        onClick={() => {
          setActiveMenu(Menu.addTable);
          setMode(Mode.create);
        }}
      >
        Add tables
      </Button>
      {activeMenu === Menu.addTable && (
        <div className="absolute left-0 top-full z-40 p-4 mt-2 w-64 bg-white rounded-lg shadow-lg">
          <button
            className="absolute top-0 right-0 btn btn-circle btn-sm"
            onClick={() => setActiveMenu(null)}
          >
            <X size={btnSize - 2} />
          </button>
          <h3 className="mb-4 text-lg font-semibold">Add New Tables</h3>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Table Type
            </label>
            <SelectTableType
              tableType={selectedTableType}
              setTableType={setSelectedTableType}
            />
          </div>
          <div className="mb-4">
            {/* <label className="block mb-2 text-sm font-medium text-gray-700">
              Table Layout
            </label> */}
            <SelectionItems
              handleClose={() => setActiveMenu(null)}
              setSelectedItems={setSelectedItems}
              selectedItems={selectedItems}
              addTables={handleAddTables}
              Component={
                RectangleHorizontal as React.FC<{
                  size: number;
                  className: string;
                }>
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setActiveMenu(null)} className="bg-warning">
              Cancel
            </Button>
            <Button onClick={handleAddTables} className="bg-primary">
              Add Tables
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
