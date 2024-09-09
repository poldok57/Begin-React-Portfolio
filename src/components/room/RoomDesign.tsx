import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/atom/Button";
import { RangeInput } from "@/components/atom/RangeInput";
import { X } from "lucide-react";
import { useTableDataStore } from "./stores/tables";
import { ModifyColor } from "./ModifyColor";
import clsx from "clsx";

interface RoomDesignProps {
  className: string;
  reccordBackround: (color: string, name: string, opacity: number) => void;
}

export const RoomDesign: React.FC<RoomDesignProps> = ({
  className,
  reccordBackround,
}) => {
  const {
    designElements,
    deleteDesignElement,
    selectedDesignElement,
    setSelectedDesignElement,
  } = useTableDataStore((state) => state);

  const [isOpen, setIsOpen] = useState(false);
  const [background, setBackground] = useState("#000000");
  const [name, setName] = useState("");
  const [opacity, setOpacity] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

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

  const handleBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBackground(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    reccordBackround(background, name, opacity);
  };

  return (
    <div className={clsx("relative", className)} ref={ref}>
      <Button onClick={() => setIsOpen(!isOpen)}>Room design</Button>
      {isOpen && (
        <div className="absolute left-4 top-full z-40 p-2 mt-2 w-56 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col gap-3 mb-5 border-b-2 border-base-300">
            <h2>Room design</h2>
            Background :
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="text"
                name="backgroundName"
                placeholder="Nom de l'arrière-plan"
                required={true}
                className="w-full max-w-xs input input-bordered"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
              <ModifyColor
                label="Color:"
                name="background"
                defaultValue={"#fad0c3"}
                onChange={handleBackgroundColorChange}
                className="z-10 w-20 h-6"
              />
              <RangeInput
                id="opacity"
                value={opacity}
                onChange={(value) => setOpacity(value)}
                label="Opacité"
                min="0"
                max="100"
                step="5"
                className="w-16 h-4 bg-gray-200 range range-sm"
              />
              <Button type="submit">Enregistrer la couleur</Button>
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
      )}
    </div>
  );
};
