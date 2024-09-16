import { useState } from "react";
import { Button } from "@/components/atom/Button";
import { SelectionItems } from "./SelectionItems";
import { useTableDataStore } from "./stores/tables";
import { TableType } from "./types";
import { RectangleHorizontal } from "lucide-react";
import { Rectangle, RectPosition as Position } from "@/lib/canvas/types";
import { useScale } from "./RoomProvider";
import clsx from "clsx";

export const RoomAddTables = ({
  className,
  addSelectedRect,
  resetSelectedTables,
}: {
  className: string;
  addSelectedRect: (rect: Rectangle) => void;
  resetSelectedTables: () => void;
}) => {
  const [openSelection, setOpenSelection] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{
    width: number;
    height: number;
  } | null>({ width: 2, height: 2 });

  const { addTable, tables } = useTableDataStore((state) => state);

  const handleSelectedItems = (items: { width: number; height: number }) => {
    setSelectedItems(items);
  };

  const { getSelectedRect } = useScale();

  const DEFAULT_TABLE_SIZE = 100;
  const positionTable = (offset: Position, x: number, y: number) => {
    return {
      left: offset.left + DEFAULT_TABLE_SIZE * (0.5 + 1.5 * x),
      top: offset.top + DEFAULT_TABLE_SIZE * (0.5 + y),
    };
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
      left: position.left - selectedRect.left,
      top: position.top - selectedRect.top,
    };

    const newTable = {
      id: "",
      type: "poker" as TableType,
      selected: true,
      size: DEFAULT_TABLE_SIZE,
      position,
      offset,
      rotation: 0,
      tableNumber: `${tableNumber}`,
      tableText: `Table ${tableNumber}`,
    };
    addTable(newTable);
  };

  const handleAddTables = () => {
    if (!selectedItems) {
      return;
    }
    const offsetStart = {
      left: 10,
      top: 10,
    };
    let selectedRect = getSelectedRect();

    const start = positionTable(offsetStart, 0, 0);
    const end = positionTable(
      offsetStart,
      selectedItems.width,
      selectedItems.height
    );
    const left = start.left - 20;
    const top = start.top - 20;
    const width = end.left - start.left + DEFAULT_TABLE_SIZE / 2;
    const height = end.top - start.top + DEFAULT_TABLE_SIZE / 2;
    if (selectedRect === null) {
      selectedRect = {
        ...{
          left,
          top,
          width,
          height,
          right: left + width,
          bottom: top + height,
        },
      };
    } else {
      selectedRect.width = width;
      selectedRect.height = height;
      selectedRect.right = left + width;
      selectedRect.bottom = top + height;
    }
    resetSelectedTables();

    let tableNumber = tables.length + 1;
    for (let y = 0; y < selectedItems.height; y++) {
      for (let x = 0; x < selectedItems.width; x++) {
        handleAddTable(x, y, tableNumber, selectedRect);
        tableNumber++;
      }
    }
    addSelectedRect(selectedRect);

    setOpenSelection(false);
  };

  return (
    <div className={clsx("relative", className)}>
      <Button onClick={() => setOpenSelection(true)}>Add tables</Button>
      {openSelection && (
        <SelectionItems
          handleClose={() => setOpenSelection(false)}
          setSelectedItems={handleSelectedItems}
          selectedItems={selectedItems}
          addTables={handleAddTables}
          Component={
            RectangleHorizontal as React.FC<{ size: number; className: string }>
          }
        />
      )}
    </div>
  );
};
