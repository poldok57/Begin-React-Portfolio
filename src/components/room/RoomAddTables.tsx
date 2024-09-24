import { useState, useRef } from "react";
import { Button } from "@/components/atom/Button";
import { SelectionItems } from "./SelectionItems";
import { useTableDataStore } from "./stores/tables";
import { TableType } from "./types";
import { RectangleHorizontal } from "lucide-react";
import { Rectangle, RectPosition as Position } from "@/lib/canvas/types";
import { useRoomContext } from "./RoomProvider";
import { getGroundOffset } from "./RoomCreat";
import { Menu } from "./RoomMenu";
import { Mode } from "./types";

import clsx from "clsx";

export const RoomAddTables = ({
  className,
  addSelectedRect,
  resetSelectedTables,
  activeMenu,
  setActiveMenu,
}: {
  className: string;
  addSelectedRect: (rect: Rectangle) => void;
  resetSelectedTables: () => void;
  activeMenu: Menu | null;
  setActiveMenu: (menu: Menu | null) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedItems, setSelectedItems] = useState<{
    width: number;
    height: number;
  } | null>({ width: 2, height: 2 });

  const { addTable, tables } = useTableDataStore((state) => state);

  const handleSelectedItems = (items: { width: number; height: number }) => {
    setSelectedItems(items);
  };

  const { getSelectedRect, scale, setMode } = useRoomContext();

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
      left: (position.left - selectedRect.left) * scale,
      top: (position.top - selectedRect.top) * scale,
    };

    const newTable = {
      id: "",
      type: "poker" as TableType,
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

    let offsetStart = {
      left: 50,
      top: 50,
    };

    // get the parent element
    const parentElement = ref.current?.parentElement;
    if (parentElement) {
      const parentRect = parentElement.getBoundingClientRect();
      const offset = getGroundOffset();
      offsetStart = {
        left: (parentRect.right + offset.left) / scale + 50,
        top: (parentRect.top + offset.top) / scale + 20,
      };
    }

    // use container position to adjust offsetStart
    let selectedRect = getSelectedRect();

    const start = positionTable(offsetStart, 0, 0);
    const end = positionTable(
      offsetStart,
      selectedItems.width,
      selectedItems.height
    );
    const left = start.left - DEFAULT_TABLE_SIZE / 4;
    const top = start.top - DEFAULT_TABLE_SIZE / 4;
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
    setActiveMenu(null);
  };

  return (
    <div
      ref={ref}
      className={clsx("relative", className)}
      onMouseOver={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
    >
      <Button
        onClick={() => {
          setActiveMenu(Menu.addTable);
          setMode(Mode.create);
        }}
      >
        Add tables
      </Button>
      {activeMenu === Menu.addTable && (
        <SelectionItems
          handleClose={() => setActiveMenu(null)}
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
