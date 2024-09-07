import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { RangeInput } from "@/components/atom/RangeInput";
import { RotateCcw, RotateCw, Minus, Plus, Settings } from "lucide-react";
import { useTableDataStore } from "./stores/tables";
// import { useThrottle } from "@/hooks/useThrottle";
import { ModifyColor } from "./ModifyColor";
import { TableType } from "./types";
import { X, RectangleVertical } from "lucide-react";
import clsx from "clsx";

export const SelectionItem: React.FC<{
  handleClose: () => void;
  selectedItems: { width: number; height: number } | null;
  setSelectedItems: (_: { width: number; height: number }) => void;
  addTables: () => void;
}> = ({ handleClose, selectedItems, setSelectedItems, addTables }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showAddBtn, setShowAddBtn] = useState(false);
  const cellSize = 32;
  const eleWidth = selectedItems?.width || 0;
  const eleHeight = selectedItems?.height || 0;
  const width = cellSize * eleWidth;
  const height = cellSize * eleHeight;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    setShowAddBtn(false);

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(
          Math.round((eleWidth * cellSize + e.clientX - startX) / cellSize),
          1
        ),
        12
      );
      const newHeight = Math.min(
        Math.max(
          Math.round((eleHeight * cellSize + e.clientY - startY) / cellSize),
          1
        ),
        12
      );
      setSelectedItems({
        width: newWidth,
        height: newHeight,
      });
    };

    const handleMouseUp = () => {
      setShowAddBtn(true);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden absolute top-24 z-40 p-4 bg-white rounded-lg shadow-lg min-w-40 min-h-40"
      style={{
        width: `${width + 10 + 2 * cellSize}px`,
        height: `${height + 50 + 2 * cellSize}px`,
      }}
    >
      <h2 className="mb-2 text-lg font-semibold">New elements</h2>
      <div className="relative w-[384px] h-[384px] bg-white rounded-md overflow-hidden">
        <div className="grid grid-cols-12 w-full h-full grid-rows-12">
          {Array(144)
            .fill(null)
            .map((_, index) => (
              <div
                key={index}
                className={clsx("border border-gray-200", {
                  "opacity-30":
                    index % 12 >= eleWidth || index / 12 >= eleHeight,
                })}
              >
                <RectangleVertical
                  size={cellSize / 2}
                  className="w-full h-full text-gray-400"
                />
              </div>
            ))}
        </div>
        <div
          className="absolute top-0 left-0 bg-blue-200 bg-opacity-30 border-2 border-blue-500 border-dashed"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            cursor: "se-resize",
          }}
          onMouseDown={handleMouseDown}
        />
        {showAddBtn && (
          <button
            className="absolute btn btn-sm btn-primary"
            style={{
              left: `${width / 3}px`,
              top: `${height + 8}px`,
            }}
            onClick={addTables}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

interface RoomMenuProps {
  btnSize: number;
  reccordBackround: (color: string, name: string, opacity: number) => void;
}
export const RoomMenu: React.FC<RoomMenuProps> = ({
  btnSize,
  reccordBackround,
}) => {
  const {
    addTable,
    rotationSelectedTable,
    sizeSelectedTable,
    tables,
    designElements,
    deleteDesignElement,
    selectedDesignElement,
    setSelectedDesignElement,
  } = useTableDataStore((state) => state);
  const [background, setBackground] = useState("#000000");
  const [name, setName] = useState("");
  const [opacity, setOpacity] = useState(50);
  const [selectedItems, setSelectedItems] = useState<{
    width: number;
    height: number;
  } | null>({ width: 2, height: 2 });
  const [openSelection, setOpenSelection] = useState(false);

  const handleBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBackground(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reccordBackround(background, name, opacity);
  };

  const handleSelectedItems = (items: { width: number; height: number }) => {
    console.log(items);

    setSelectedItems(items);
  };

  const DEFAULT_TABLE_SIZE = 100;
  const handleAddTable = (x: number, y: number) => {
    const newTable = {
      id: "",
      type: "poker" as TableType,
      selected: true,
      size: DEFAULT_TABLE_SIZE,
      position: {
        left: DEFAULT_TABLE_SIZE * (1 + 2 * x),
        top: DEFAULT_TABLE_SIZE * (1 + 2 * y),
      },
      rotation: 0,
      tableNumber: `${tables.length + 1}`,
      tableText: `Table ${tables.length + 1}`,
    };
    addTable(newTable);
  };

  const handleAddTables = () => {
    if (selectedItems) {
      for (let y = 0; y < selectedItems.height; y++) {
        for (let x = 0; x < selectedItems.width; x++) {
          handleAddTable(x, y);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 mx-2 w-52 rounded-xl border-2 bg-base-200 border-base-300">
      <h1>RoomCreate</h1>
      <Button onClick={() => setOpenSelection(true)}>Add table</Button>
      {openSelection && (
        <SelectionItem
          handleClose={() => setOpenSelection(false)}
          setSelectedItems={handleSelectedItems}
          selectedItems={selectedItems}
          addTables={handleAddTables}
        />
      )}
      <div className="flex flex-col gap-2">
        <h2>Modify selected tables</h2>
        <div className="flex flex-col gap-2 justify-center">
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
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2>Modify Room</h2>
        Background:
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            name="backgroundName"
            placeholder="background"
            required={true}
            className="w-full max-w-xs input input-bordered"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <ModifyColor
            label="Color"
            name="background"
            defaultValue={"#fad0c3"}
            onChange={handleBackgroundColorChange}
            className="z-10 w-16 h-6"
          />
          <RangeInput
            id="opacity"
            value={opacity}
            onChange={(value) => setOpacity(value)}
            label="Opacity"
            min="0"
            max="100"
            step="5"
            className="w-16 h-4 bg-gray-200 range range-sm"
          />
          <Button type="submit">Save Color</Button>
        </form>
      </div>
      <h3>Design elements ({designElements.length})</h3>

      <div className="flex overflow-y-auto flex-col p-2 h-32 rounded-lg bg-base-200">
        {designElements.length > 0 ? (
          designElements.map((element) => (
            <div
              key={element.id}
              className={clsx(
                "flex flex-row justify-between items-center p-1 mb-1 w-full rounded-md",
                {
                  "border-2 border-red-500 border-dashed border-opacity-100":
                    selectedDesignElement === element.id,
                }
              )}
              style={{
                backgroundColor: element.color,
                opacity: element.opacity ?? 1,
              }}
            >
              <span
                className="text-sm text-base-content"
                onClick={() => setSelectedDesignElement(element.id)}
              >
                {element.type}: {element.name}
              </span>
              <button
                className="btn btn-circle btn-xs bg-base-100"
                onClick={() => {
                  deleteDesignElement(element.id);
                  if (selectedDesignElement === element.id) {
                    setSelectedDesignElement(null);
                  }
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-base-content">Aucun élément de design</p>
        )}
      </div>
    </div>
  );
};
