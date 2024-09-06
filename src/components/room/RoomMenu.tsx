import React, { useState } from "react";
import { Button } from "@/components/atom/Button";
import { RangeInput } from "@/components/atom/RangeInput";
import { RotateCcw, RotateCw, Minus, Plus, Settings } from "lucide-react";
import { useTableDataStore } from "./stores/tables";
import { useThrottle } from "@/hooks/useThrottle";
import { ModifyColor } from "./ModifyColor";
import { TableType } from "./types";
import { X } from "lucide-react";
import clsx from "clsx";

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

  const handleBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBackground(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reccordBackround(background, name, opacity);
  };

  const handleAddTable = useThrottle(() => {
    const newTable = {
      id: "",
      type: "poker" as TableType,
      selected: true,
      size: 100,
      rotation: 0,
      tableNumber: `${tables.length + 1}`,
      tableText: `Table ${tables.length + 1}`,
    };
    addTable(newTable);
  }, 1000);

  return (
    <div className="flex flex-col gap-2 p-2">
      <h1>RoomCreate</h1>
      <Button onClick={handleAddTable}>Add table</Button>
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
            defaultValue={"#000000"}
            onChange={handleBackgroundColorChange}
            className="w-16 h-6"
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
