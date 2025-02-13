import { useState, useRef } from "react";
import { Button } from "@/components/atom/Button";
import { SelectionItems } from "../SelectionItems";
import { useTableDataStore } from "../stores/tables";
import { TableType } from "../types";
import { RectangleHorizontal } from "lucide-react";
import { Rectangle, RectPosition as Position } from "@/lib/canvas/types";
import { useRoomContext } from "../RoomProvider";
import { Menu, Mode } from "../types";
import { SelectTableType } from "../SelectTableType";
import {
  positionTable,
  calculateSelectedRect,
  DEFAULT_TABLE_SIZE,
} from "../scripts/room-add-tables";
import { withMousePosition } from "../../windows/withMousePosition";
import { menuRoomVariants } from "@/styles/menu-variants";
interface RoomAddTablesMenuProps {
  addSelectedRect: (rect: Rectangle) => void;
  setActiveMenu: (menu: Menu | null) => void;
}

const RoomAddTablesMenu: React.FC<RoomAddTablesMenuProps> = ({
  addSelectedRect,
  setActiveMenu,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<{
    width: number;
    height: number;
  }>({ width: 2, height: 2 });
  const [selectedTableType, setSelectedTableType] = useState<TableType>(
    TableType.poker
  );

  const { tables, addTable, updateSelectedTables } = useTableDataStore(
    (state) => state
  );
  const { getSelectedRect, scale } = useRoomContext();

  const resetSelectedTables = () => {
    updateSelectedTables({ selected: false });
  };

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
      left: Math.round((position.left - selectedRect.left) * scale),
      top: Math.round((position.top - selectedRect.top) * scale),
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
      parentElement: ref.current,
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
    <div ref={ref} className={menuRoomVariants({ width: 64 })}>
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
  );
};
const RoomAddTablesMenuWP = withMousePosition(RoomAddTablesMenu);

interface RoomAddTablesProps {
  className: string;
  addSelectedRect: (rect: Rectangle) => void;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
  disabled?: boolean;
}

export const RoomAddTables: React.FC<RoomAddTablesProps> = ({
  className,
  addSelectedRect,
  activeMenu,
  setActiveMenu,
  disabled = false,
}) => {
  const { setMode } = useRoomContext();

  return (
    <>
      <div className="flex relative flex-col p-1 w-full">
        <Button
          className={className}
          onClick={() => {
            setActiveMenu(Menu.addTable);
            setMode(Mode.create);
          }}
          selected={activeMenu === Menu.addTable}
          disabled={disabled}
        >
          Add tables
        </Button>
      </div>

      {activeMenu === Menu.addTable && (
        <RoomAddTablesMenuWP
          addSelectedRect={addSelectedRect}
          setActiveMenu={setActiveMenu}
          onClose={() => setActiveMenu(null)}
          className="absolute z-30 translate-y-24"
          withToggleLock={false}
          withTitleBar={true}
          titleText="Add New Tables"
          titleHidden={false}
          titleBackground={"#99ee66"}
          draggable={true}
        />
      )}
    </>
  );
};
